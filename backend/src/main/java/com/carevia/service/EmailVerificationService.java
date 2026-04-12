package com.carevia.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.EmailVerification;
import com.carevia.core.domain.Client;
import com.carevia.core.domain.Staff;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.EmailVerificationRepository;
import com.carevia.core.repository.ClientRepository;
import com.carevia.core.repository.StaffRepository;
import com.carevia.service.event.AccountActivatedEvent;
import com.carevia.service.helper.ClientCodeGenerator;
import com.carevia.service.helper.StaffCodeGenerator;
import com.carevia.shared.constant.AccountStatus;
import com.carevia.shared.constant.TokenType;
import com.carevia.shared.exception.InvalidTokenException;
import com.carevia.shared.exception.ResourceNotFoundException;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.carevia.shared.util.TokenHashUtil;

@Service
public class EmailVerificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);

    private final EmailVerificationRepository emailVerificationRepository;
    private final ClientCodeGenerator clientCodeGenerator;
    private final StaffCodeGenerator staffCodeGenerator;
    private final StaffRepository staffRepository;
    private final ClientRepository clientRepository;
    private final AccountRepository accountRepository;
    private final ApplicationEventPublisher eventPublisher;

    public EmailVerificationService(EmailVerificationRepository emailVerificationRepository,
                                    ClientCodeGenerator clientCodeGenerator,
                                    StaffCodeGenerator staffCodeGenerator,
                                    StaffRepository staffRepository,
                                    ClientRepository clientRepository,
                                    AccountRepository accountRepository,
                                    ApplicationEventPublisher eventPublisher) {
        this.emailVerificationRepository = emailVerificationRepository;
        this.clientCodeGenerator = clientCodeGenerator;
        this.staffCodeGenerator = staffCodeGenerator;
        this.staffRepository = staffRepository;
        this.clientRepository = clientRepository;
        this.accountRepository = accountRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Verify the given email token and activate or update account status accordingly.
     *
     * @param rawToken unique verification token sent via email
     * @throws ResourceNotFoundException if token not found
     * @throws com.carevia.shared.exception.InvalidTokenException if token is invalid, expired, or used
     */
    @Transactional
    public void verifyToken(String rawToken) {
        log.info("Start verifying email token: {}", rawToken);

        String hashToken = TokenHashUtil.hashToken(rawToken);

        // Find token
        EmailVerification verification = emailVerificationRepository.findByTokenHash(hashToken)
                .orElseThrow(() -> {
                    log.warn("Token not found: {}", rawToken);
                    return new ResourceNotFoundException("Invalid verification token.");
                });

        // Validate token using domain behavior (throws exception if invalid)
        verification.validateForUse();
        verification.validateTokenType(TokenType.VERIFY_EMAIL);

        // Load associated account
        Account account = verification.getAccount();
        log.debug("Processing verification for account id={}, role={}", account.getId(), account.getRole());

        // Activate or set pending status based on role
        switch (account.getRole()) {
            case CLIENT -> {
                log.info("Activating student account id={}", account.getId());
                account.setStatus(AccountStatus.ACTIVE);

                Client client = new Client();
                client.setAccount(account);
                client.setFullName("User" + account.getId());
                client.setClientCode(clientCodeGenerator.generate());
                clientRepository.save(client);

                log.info("Client entity created with code={}", client.getClientCode());
            }
            case STAFF -> {
                log.info("Marking staff account as pending approval id={}", account.getId());
                account.setStatus(AccountStatus.PENDING_APPROVAL);

                Staff staff = new Staff();
                staff.setAccount(account);
                staff.setFullName("User" + account.getId());
                staff.setStaffCode(staffCodeGenerator.generate());
                staff.setApproved(false);
                staffRepository.save(staff);

                log.info("Staff entity created with code={}", staff.getStaffCode());
            }
            default -> log.warn("Unsupported role during verification: {}", account.getRole());
        }

        // Consume token using domain behavior
        verification.consume();
        emailVerificationRepository.save(verification);
        accountRepository.save(account);

        // Notify user of activation success
        eventPublisher.publishEvent(new AccountActivatedEvent(account));

        log.info("Email verification completed successfully for account id={}", account.getId());
    }

    /**
     * Generate a new email verification token for an account.
     *
     * @param account the account for which to generate the verification
     * @param tokenType the type of verification token
     * @return the generated EmailVerification with plain token available
     */
    @Transactional
    public EmailVerification generateVerificationToken(Account account, TokenType tokenType) {
        return generateVerificationToken(account, tokenType, 30);
    }

    /**
     * Generate a new email verification token with custom expiration.
     *
     * @param account the account for which to generate the verification
     * @param tokenType the type of verification token
     * @param expirationMinutes custom expiration time in minutes
     * @return the generated EmailVerification with plain token available
     */
    @Transactional
    public EmailVerification generateVerificationToken(Account account, TokenType tokenType, long expirationMinutes) {
        EmailVerification verification = EmailVerification.generate(account, tokenType, expirationMinutes);
        return emailVerificationRepository.save(verification);
    }



}
