package com.carevia.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.service.event.AccountActiveEvent;
import com.carevia.service.event.PasswordResetEvent;
import com.carevia.shared.constant.SecurityConstants;
import com.carevia.shared.constant.TokenType;
import com.carevia.shared.dto.request.auth.ChangePasswordDTO;
import com.carevia.shared.dto.request.auth.ReqLoginDTO;
import com.carevia.shared.dto.response.auth.MeResponse;
import com.carevia.shared.dto.response.auth.ResLoginDTO;
import com.carevia.shared.exception.*;
import com.carevia.shared.mapper.AccountMapper;
import com.carevia.shared.util.SecurityUtils;
import com.carevia.shared.util.TokenHashUtil;
import com.carevia.shared.util.TokenProvider;
import com.carevia.shared.annotation.EnableSoftDeleteFilter;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * AuthService - Thin orchestrator following Rich Domain Model pattern
 * <p>
 * This service coordinates authentication workflows and delegates business
 * logic to domain entities.
 * Domain entities (Account, EmailVerification, Teacher, Student) encapsulate
 * their own behavior.
 * </p>
 */
@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final MailService emailService;
    private final AuthenticationManager authenticationManager; // Thêm dòng này
    private final SecurityUtils securityUtils;
    private final ClientRepository clientRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;
    private final EmailVerificationRepository emailVerificationRepository;
    private final TokenProvider tokenProvider;
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    @Value("${app.avatar.default-url}")
    private String defaultAvatarUrl;

    /**
     * Constructs an {@code AuthService} with all required dependencies.
     */
    public AuthService(AccountRepository accountRepository,
            MailService emailService,
            @Lazy AuthenticationManager authenticationManager,
            SecurityUtils securityUtils,
            ClientRepository clientRepository,
            StaffRepository staffRepository,
            PasswordEncoder passwordEncoder,
            ApplicationEventPublisher eventPublisher,
            RefreshTokenService refreshTokenService,
            EmailVerificationService emailVerificationService,
            EmailVerificationRepository emailVerificationRepository,
            TokenProvider tokenProvider) {
        this.emailVerificationRepository = emailVerificationRepository;
        this.accountRepository = accountRepository;
        this.emailService = emailService;
        this.authenticationManager = authenticationManager;
        this.securityUtils = securityUtils;
        this.tokenProvider = tokenProvider;
        this.clientRepository = clientRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
        this.refreshTokenService = refreshTokenService;
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * Registers a new account and sends an email verification link.
     * <p>
     * Service orchestrates: duplicate check, deletion, save, token creation, email
     * event
     * Business logic is in the Account entity
     * </p>
     *
     * @param account the account entity to register
     * @return the saved {@link Account} entity
     * @throws UsernameAlreadyUsedException if the username is already used
     * @throws EmailAlreadyUsedException    if the email is already used
     */
    @Transactional
    @EnableSoftDeleteFilter
    public Account registerAccount(Account account) {

        // 1. Kiểm tra trùng Username
        accountRepository.findOneByUsername(account.getUsername())
                .ifPresent(existingAccount -> {
                    if (!existingAccount.isPendingEmailVerification()) {
                        throw new UsernameAlreadyUsedException();
                    }
                    accountRepository.delete(existingAccount);
                    accountRepository.flush();
                });

        // 2. Kiểm tra trùng Email
        accountRepository.findOneByEmailIgnoreCase(account.getEmail())
                .ifPresent(existingAccount -> {
                    if (!existingAccount.isPendingEmailVerification()) {
                        throw new EmailAlreadyUsedException();
                    }
                    accountRepository.delete(existingAccount);
                    accountRepository.flush();
                });

        // 3. TỰ ĐỘNG GÁN AVATAR TỪ GRAVATAR (dựa trên email)
        if (account.getAvatarUrl() == null || account.getAvatarUrl().isEmpty()) {
            try {
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
                byte[] digest = md.digest(account.getEmail().trim().toLowerCase().getBytes());
                StringBuilder sb = new StringBuilder();
                for (byte b : digest) {
                    sb.append(String.format("%02x", b));
                }
                String gravatarUrl = "https://www.gravatar.com/avatar/" + sb.toString() + "?d=identicon&s=200";
                account.setAvatarUrl(gravatarUrl);
            } catch (java.security.NoSuchAlgorithmException e) {
                String fallback = defaultAvatarUrl + "?name=" + account.getUsername() + "&background=random&color=fff";
                account.setAvatarUrl(fallback);
            }
        }

        // 4. Lưu tài khoản
        Account saved = accountRepository.save(account);

        // 5. Tạo Token xác thực
        EmailVerification emailVerification = emailVerificationService.generateVerificationToken(saved,
                TokenType.VERIFY_EMAIL);
        String rawToken = emailVerification.getPlainToken();

        // 6. Bắn Event gửi Email
        eventPublisher.publishEvent(new AccountActiveEvent(saved, rawToken));

        return saved;
    }

    /**
     * Authenticates a user and generates access and refresh tokens.
     * <p>
     * Service orchestrates: authentication, token generation, DB updates, event
     * publishing
     * Business logic for status management is in Account entity
     * </p>
     *
     * @param reqLoginDTO the login request containing credentials and device info
     * @return a {@link ResLoginDTO} with authentication details and tokens
     * @throws ResourceNotFoundException if the account does not exist
     * @throws UserNotActivatedException if the account is not yet activated
     */
    @EnableSoftDeleteFilter
    public ResLoginDTO login(ReqLoginDTO reqLoginDTO) {

        // 1. Khởi tạo đối tượng xác thực
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                reqLoginDTO.getLogin(), reqLoginDTO.getPassword());

        // 2. SỬA TẠI ĐÂY: Sử dụng trực tiếp authenticationManager thay vì builder
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Lấy thông tin account (Sử dụng email làm định danh)
        String email = authentication.getName();
        Account accountDB = accountRepository.findOneByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // 4. Kiểm tra trạng thái tài khoản (Nghiệp vụ quan trọng)
        if (accountDB.isPendingEmailVerification()) {
            throw new UserNotActivatedException("Account email is not verified");
        }

        // 5. Map account ra DTO tùy theo Role
        ResLoginDTO resLoginDTO;
        switch (accountDB.getRole()) {
            case CLIENT -> {
                Client client = clientRepository.findByAccount(accountDB)
                        .orElseThrow(() -> new UserNotActivatedException("Client profile not found"));
                resLoginDTO = AccountMapper.clientToResLoginDTO(client);
            }
            case STAFF -> {
                Staff staff = staffRepository.findByAccount(accountDB)
                        .orElseThrow(() -> new UserNotActivatedException("Staff profile not found"));
                resLoginDTO = AccountMapper.staffToResLoginDTO(staff);
            }
            case ADMIN -> {
                resLoginDTO = AccountMapper.adminToResLoginDTO(accountDB);
            }
            default -> throw new IllegalStateException("Unexpected role: " + accountDB.getRole());
        }

        // 6. Tạo Access Token
        // String accessToken =
        // securityUtils.createAccessToken(authentication.getName(), resLoginDTO);
        String accessToken = this.tokenProvider.createToken(authentication);
        resLoginDTO.setAccessToken(accessToken);
        Instant now = Instant.now();
        resLoginDTO.setAccessTokenExpiresAt(now.plus(securityUtils.getAccessTokenExpiration(), ChronoUnit.SECONDS));

        // 7. Tạo và lưu Refresh Token
        String rawRefreshToken = securityUtils.createRefreshToken(accountDB.getEmail());

        RefreshToken refreshToken = refreshTokenService.issueRefreshToken(
                accountDB,
                rawRefreshToken,
                reqLoginDTO.getDeviceInfo(),
                reqLoginDTO.getIpAddress());

        resLoginDTO.setRefreshToken(rawRefreshToken);
        resLoginDTO.setRefreshTokenExpiresAt(refreshToken.getExpiresAt());

        // 8. Cập nhật lần đăng nhập cuối
        accountDB.recordLogin();
        accountRepository.save(accountDB);

        return resLoginDTO;
    }

    @EnableSoftDeleteFilter
    public void forgotPassword(String email) {

        Account accountDB = this.accountRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Forgot password failed: email not found [{}]", email);
                    return new ResourceNotFoundException("User not found with email: " + email);
                });

        // Create password reset token
        EmailVerification verification = emailVerificationService.generateVerificationToken(accountDB,
                TokenType.RESET_PASSWORD);
        String rawToken = verification.getPlainToken();

        // Publish event for email sending
        eventPublisher.publishEvent(new PasswordResetEvent(accountDB, rawToken));
    }

    @Transactional
    @EnableSoftDeleteFilter
    public void resetPassword(String token, String newPassword) {
        log.info("Start resetting password with token: {}", token);
        String hashToken = TokenHashUtil.hashToken(token);

        // Find and validate token
        EmailVerification verification = emailVerificationRepository.findByTokenHash(hashToken)
                .orElseThrow(() -> {
                    log.warn("Token not found: {}", token);
                    return new InvalidTokenException("Invalid token.");
                });

        // Validate token using domain behavior
        verification.validateForUse();
        verification.validateTokenType(TokenType.RESET_PASSWORD);

        // Get account and reset password using domain behavior
        Account account = verification.getAccount();
        log.debug("Resetting password for account id={}, role={}", account.getId(), account.getRole());

        account.resetPassword(newPassword, passwordEncoder);
        accountRepository.save(account);

        // Consume token using domain behavior
        verification.consume();
        emailVerificationRepository.save(verification);

        log.info("Password reset successfully for account id={}", account.getId());
    }

    @EnableSoftDeleteFilter
    public MeResponse getCurrentUserInfo() {
        String email = SecurityUtils.getCurrentUserLogin()
                .filter(e -> !SecurityConstants.ANONYMOUS_USER.equals(e))
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account account = accountRepository.findOneByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        MeResponse meResponse = buildBaseResponse(account);

        // Fetch profile based on role
        BaseProfile profile = switch (account.getRole()) {
            case CLIENT -> {
                Client client = clientRepository.findByAccountWithAddresses(account)
                        .orElseThrow(() -> new UserNotActivatedException("Account not activated"));
                yield client;
            }
            case STAFF -> {
                Staff staff = staffRepository.findByAccount(account)
                        .orElseThrow(() -> new UserNotActivatedException("Account not activated"));
                yield staff;
            }
            default -> null;
        };

        if (profile != null) {
            fillUserProfile(meResponse, profile);
        }

        return meResponse;
    }

    private MeResponse buildBaseResponse(Account account) {
        return MeResponse.builder()
                .accountId(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .role(account.getRole())
                .avatarUrl(account.getAvatarUrl())
                .lastLoginAt(account.getLastLoginAt())
                .status(account.getStatus())
                .build();
    }

    private void fillUserProfile(MeResponse meResponse, BaseProfile profile) {
        meResponse.setFullName(profile.getFullName());
        meResponse.setGender(profile.getGender());
        meResponse.setBio(profile.getBio());
        meResponse.setBirthday(profile.getBirthDate());

        if (profile instanceof com.carevia.shared.entity.PersonBase personBase) {
            meResponse.setPhone(personBase.getPhone());
        }

        if (profile instanceof Client client) {
            meResponse.setAddress(client.getAddress());
            meResponse.setClientCode(client.getClientCode());
            meResponse.setLoyaltyPoints(client.getLoyaltyPoints());
            meResponse.setMembershipLevel(client.getMembershipLevel() != null
                    ? client.getMembershipLevel().name()
                    : null);
            meResponse.setSkinType(client.getSkinType());
            meResponse.setSkinConcerns(client.getSkinConcerns());

            meResponse.setAddresses(client.getAddresses() == null
                    ? java.util.List.of()
                    : client.getAddresses().stream()
                            .sorted(java.util.Comparator
                                    .comparing((ClientAddress address) -> Boolean.TRUE.equals(address.getIsDefault()))
                                    .reversed()
                                    .thenComparing(ClientAddress::getCreatedAt,
                                            java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())))
                            .map(address -> MeResponse.AddressInfo.builder()
                                    .id(address.getId())
                                    .street(address.getStreet())
                                    .ward(address.getWard()) // Đã thêm
                                    .district(address.getDistrict()) // Đã thêm
                                    .city(address.getCity())
                                    .isDefault(address.getIsDefault())
                                    .build())
                            .toList());
        }
    }

    @Transactional
    @EnableSoftDeleteFilter
    public void changePassword(ChangePasswordDTO changePasswordDTO) {

        String email = SecurityUtils.getCurrentUserLogin()
                .filter(e -> !SecurityConstants.ANONYMOUS_USER.equals(e))
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account account = accountRepository.findOneByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // Use domain behavior for password change with validation
        account.changePassword(
                changePasswordDTO.getOldPassword(),
                changePasswordDTO.getNewPassword(),
                passwordEncoder);

        accountRepository.save(account);
    }

    @Transactional
    @EnableSoftDeleteFilter
    public void resendVerificationEmail(String email) {
        Account accountDB = this.accountRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Resend verification email failed: email not found [{}]", email);
                    return new ResourceNotFoundException("User not found with email: " + email);
                });

        // Use domain behavior to check status
        if (!accountDB.isPendingEmailVerification()) {
            log.warn("Resend verification email failed: account already activated [{}]", email);
            throw new IllegalStateException("Account is already activated.");
        }

        // Rate limiting check
        Instant oneHourAgo = Instant.now().minus(1, ChronoUnit.HOURS);
        long recentAttempts = emailVerificationRepository.countByAccountAndCreatedAtAfterAndTokenType(
                accountDB,
                oneHourAgo,
                TokenType.VERIFY_EMAIL);

        if (recentAttempts >= 3) {
            log.warn("Too many resend attempts for email: {}", email);
            throw new TooManyRequestsException("Too many resend attempts. Please try again later.");
        }

        // Generate new verification token using domain behavior
        EmailVerification verification = emailVerificationService.generateVerificationToken(
                accountDB,
                TokenType.VERIFY_EMAIL);

        // Publish event for email sending with plain token
        eventPublisher.publishEvent(new AccountActiveEvent(accountDB, verification.getPlainToken()));

        log.info("Verification email resent to: {}", email);
    }

}
