package com.carevia.service;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.AccountActionLog;
import com.carevia.core.domain.Client;
import com.carevia.core.domain.ClientAddress;
import com.carevia.core.domain.Staff;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.ClientRepository;
import com.carevia.core.repository.StaffRepository;
import com.carevia.service.event.AccountStatusChangeEvent;
import com.carevia.service.storage.CloudinaryStorageService;
import com.carevia.shared.annotation.Audit;
import com.carevia.shared.constant.*;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.account.UpsertAddressRequest;
import com.carevia.shared.dto.request.account.UpdateProfileRequest;
import com.carevia.shared.dto.response.account.AddressMutationResponse;
import com.carevia.shared.dto.response.account.AddressResponse;
import com.carevia.shared.dto.response.account.AccountProfileResponse;
import com.carevia.shared.dto.response.account.AccountResponse;
import com.carevia.shared.dto.response.account.UploadAvatarResponse;
import com.carevia.shared.dto.response.log.AccountActionLogResponse;
import com.carevia.shared.exception.*;
import com.carevia.shared.mapper.AccountMapper;
import com.carevia.shared.mapper.LogMapper;
import com.carevia.shared.mapper.StaffMapper;
import com.carevia.shared.mapper.ClientMapper;
import com.carevia.shared.util.CloudinaryUtils;
import com.carevia.shared.util.SecurityUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * AccountService - Thin orchestrator following Rich Domain Model pattern
 * <p>
 * This service coordinates account management workflows and delegates business
 * logic to domain entities.
 * Domain entities (Account, Staff, Client) encapsulate their own behavior and
 * validation rules.
 * </p>
 */
@Service
public class AccountService {

        private static final Logger log = LoggerFactory.getLogger(AccountService.class);

        private final AccountRepository accountRepository;
        private final ClientRepository clientRepository;

        private final StaffRepository staffRepository;
        private final CloudinaryStorageService cloudinaryStorageService;
        private final CloudinaryUtils cloudinaryUtils;
        private final AccountActionLogService accountActionLogService;
        private final MailService mailService;
        private final ApplicationEventPublisher eventPublisher;

        private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

        @Value("${app.avatar.max-size-bytes}")
        private long maxSizeBytes;

        public AccountService(AccountRepository accountRepository,
                        ClientRepository clientRepository,
                        StaffRepository staffRepository,
                        CloudinaryStorageService cloudinaryStorageService,
                        CloudinaryUtils cloudinaryUtils,
                        AccountActionLogService accountActionLogService,
                        MailService mailService,
                        ApplicationEventPublisher eventPublisher) {
                this.accountActionLogService = accountActionLogService;
                this.accountRepository = accountRepository;
                this.clientRepository = clientRepository;
                this.staffRepository = staffRepository;
                this.cloudinaryStorageService = cloudinaryStorageService;
                this.cloudinaryUtils = cloudinaryUtils;
                this.mailService = mailService;
                this.eventPublisher = eventPublisher;
        }

        public Account verifyCurrentAccount() {
                String email = SecurityUtils.getCurrentUserLogin()
                                .filter(e -> !SecurityConstants.ANONYMOUS_USER.equals(e))
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                Account account = accountRepository.findOneByEmailIgnoreCase(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                // Use domain behavior
                account.requireActive();

                return account;
        }

        /**
         * Get current logged-in user's username/email
         * 
         * @return username (email)
         */
        public String getCurrentUserLogin() {
                return SecurityUtils.getCurrentUserLogin()
                                .filter(e -> !SecurityConstants.ANONYMOUS_USER.equals(e))
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));
        }

        public Account validateCurrentAccountByRole(Role requiredRole) {

                Account account = verifyCurrentAccount();

                // Role-specific validations using domain behaviors
                if (account.isStaff()) {
                        Staff staff = staffRepository.findByAccount(account)
                                        .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
                        staff.requireApproved();
                }
                // Admin validations can be added here if needed

                // Final authorization using domain behavior
                account.requireRole(requiredRole);

                return account;
        }

        /**
         * Retrieve the current logged-in user's profile information.
         */
        public AccountProfileResponse getProfile() {
                String email = SecurityUtils.getCurrentUserLogin()
                                .filter(e -> !SecurityConstants.ANONYMOUS_USER.equals(e))
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                log.info("Fetching profile for user: {}", email);

                Account account = accountRepository.findOneByEmailIgnoreCase(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                return getAccountProfile(account);
        }

        @Transactional(readOnly = true)
        public AddressMutationResponse getCurrentUserAddresses() {
                Client client = getCurrentClientWithAddresses();
                return buildAddressMutationResponse(client, "Addresses retrieved successfully");
        }

        @Transactional
        public AddressMutationResponse addCurrentUserAddress(@Valid UpsertAddressRequest request) {
                Client client = getCurrentClientWithAddresses();

                ClientAddress address = ClientAddress.builder()
                                .client(client)
                                .street(request.getStreet().trim())
                                .ward(request.getWard().trim()) // Thay đổi ở đây
                                .district(request.getDistrict().trim()) // Thay đổi ở đây
                                .city(request.getCity().trim())
                                .isDefault(Boolean.TRUE.equals(request.getIsDefault())
                                                || client.getAddresses().isEmpty())
                                .build();

                client.getAddresses().add(address);

                if (Boolean.TRUE.equals(address.getIsDefault())) {
                        setDefaultAddress(client, address);
                } else {
                        ensureDefaultAddress(client);
                }

                syncDefaultShippingAddress(client);
                clientRepository.save(client);
                return buildAddressMutationResponse(client, "Address added successfully");
        }

        @Transactional
        public AddressMutationResponse updateCurrentUserAddress(Long addressId, @Valid UpsertAddressRequest request) {
                Client client = getCurrentClientWithAddresses();
                ClientAddress address = findAddress(client, addressId);

                address.setStreet(request.getStreet().trim());
                address.setWard(request.getWard().trim()); // Thay đổi ở đây
                address.setDistrict(request.getDistrict().trim()); // Thay đổi ở đây
                address.setCity(request.getCity().trim());

                // Xử lý logic default address
                if (Boolean.TRUE.equals(request.getIsDefault())) {
                        setDefaultAddress(client, address);
                } else if (Boolean.FALSE.equals(request.getIsDefault())
                                && Boolean.TRUE.equals(address.getIsDefault())) {
                        address.setIsDefault(false);
                        ensureDefaultAddress(client);
                }

                syncDefaultShippingAddress(client);
                clientRepository.save(client);
                return buildAddressMutationResponse(client, "Address updated successfully");
        }

        @Transactional
        public AddressMutationResponse deleteCurrentUserAddress(Long addressId) {
                Client client = getCurrentClientWithAddresses();
                ClientAddress address = findAddress(client, addressId);

                client.getAddresses().remove(address);
                ensureDefaultAddress(client);
                syncDefaultShippingAddress(client);
                clientRepository.save(client);

                return buildAddressMutationResponse(client, "Address deleted successfully");
        }

        /**
         * Upload a new avatar for the current user and update the database record.
         * Service orchestrates: validation, upload, deletion, save
         */
        @Transactional
        public UploadAvatarResponse uploadAvatar(MultipartFile file, String currentUserEmail) {
                // Validate file
                if (file == null || file.isEmpty()) {
                        throw new InvalidFileException("File is empty");
                }

                if (!ALLOWED_TYPES.contains(file.getContentType())) {
                        throw new InvalidFileException("Only JPG, PNG, WEBP are allowed");
                }

                if (file.getSize() > maxSizeBytes) {
                        throw new InvalidFileException("File size exceeds " + (maxSizeBytes / 1024 / 1024) + "MB");
                }

                // Fetch account
                Account account = accountRepository.findOneByEmailIgnoreCase(currentUserEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                Long userId = account.getId();
                String oldPublicId = account.getOldAvatarPublicId();

                log.info("Uploading avatar for userId={} (oldPublicId={})", userId, oldPublicId);

                // Upload avatar to Cloudinary
                CloudinaryStorageService.UploadResult uploadResult = cloudinaryStorageService.uploadAvatar(file, userId,
                                oldPublicId);

                // Delete old image if a new one is generated
                if (oldPublicId != null && !Objects.equals(oldPublicId, uploadResult.getPublicId())) {
                        try {
                                cloudinaryStorageService.deleteByPublicId(oldPublicId);
                                log.info("Deleted old avatar: {}", oldPublicId);
                        } catch (Exception ex) {
                                log.warn("Failed to delete old avatar ({}): {}", oldPublicId, ex.getMessage());
                        }
                }

                // Update avatar using domain behavior
                account.updateAvatar(uploadResult.getUrl(), uploadResult.getPublicId());
                accountRepository.save(account);

                // Prepare response
                UploadAvatarResponse response = new UploadAvatarResponse();
                response.setAvatarUrl(uploadResult.getUrl());
                response.setThumbnailUrl(cloudinaryUtils.getThumbnailUrl(uploadResult.getPublicId(), 200, 200));

                log.info("Avatar updated successfully for userId={} (newPublicId={})", userId,
                                uploadResult.getPublicId());
                return response;
        }

        /**
         * Update the profile details of the currently logged-in user.
         * Service orchestrates: fetch, validation, profile update, save
         */
        @Transactional
        @Audit(table = "accounts", action = AuditAction.UPDATE)
        public AccountProfileResponse updateProfile(@Valid UpdateProfileRequest req) {
                String email = SecurityUtils.getCurrentUserLogin()
                                .filter(e -> !SecurityConstants.ANONYMOUS_USER.equals(e))
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                log.info("Updating profile for user: {}", email);

                Account account = accountRepository.findOneByEmailIgnoreCase(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                AccountProfileResponse.Profile profile = switch (account.getRole()) {
                        case CLIENT -> updateClientProfile(req, account);
                        case STAFF -> updateStaffProfile(req, account);
                        case ADMIN -> {
                                log.warn("Attempted to update ADMIN profile — ignored");
                                yield new AccountProfileResponse.Profile();
                        }
                };

                log.info("Profile updated successfully for user: {}", email);
                return AccountMapper.toProfileResponse(account, profile);
        }

        /**
         * Update client-specific profile using domain behavior
         */
        private AccountProfileResponse.Profile updateClientProfile(UpdateProfileRequest req, Account account) {
                Client client = clientRepository.findByAccount(account)
                                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

                // Use domain behavior for profile update
                client.updateProfile(req.getFullName(), req.getBio(), req.getGender(), req.getBirthDate(),
                                req.getPhone());

                // Update client-specific fields
                if (req.getSkinType() != null) {
                        client.setSkinType(req.getSkinType());
                }
                if (req.getSkinConcerns() != null) {
                        client.setSkinConcerns(req.getSkinConcerns());
                }

                clientRepository.save(client);

                log.debug("Client profile updated for accountId={}", account.getId());
                return ClientMapper.toProfileResponse(client);
        }

        /**
         * Update Staff-specific profile using domain behavior
         */
        private AccountProfileResponse.Profile updateStaffProfile(UpdateProfileRequest req, Account account) {
                Staff staff = staffRepository.findByAccount(account)
                                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

                // Use domain behavior for profile update
                staff.updateProfile(req.getFullName(), req.getBio(), req.getGender(), req.getBirthDate(),
                                req.getPhone());
                staff.setSpecialty(req.getSpecialty());
                staff.setDegree(req.getDegree());
                staffRepository.save(staff);

                log.debug("Staff profile updated for accountId={}", account.getId());
                return StaffMapper.toProfileResponse(staff);
        }

        public PageResponse<AccountResponse> getAllAccounts(Specification<Account> spec, Pageable pageable) {
                Page<Account> page = accountRepository.findAll(spec, pageable);

                List<AccountResponse> items = page.getContent()
                                .stream()
                                .map(AccountMapper::toAccountResponse)
                                .toList();

                return new PageResponse<>(
                                items,
                                page.getNumber(),
                                page.getSize(),
                                page.getTotalElements(),
                                page.getTotalPages(),
                                page.hasNext(),
                                page.hasPrevious());
        }

        public AccountProfileResponse getAccountById(Long id) {
                Account account = accountRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                return getAccountProfile(account);
        }

        public AccountProfileResponse getAccountProfile(Account account) {
                AccountProfileResponse.Profile profile = switch (account.getRole()) {
                        case CLIENT -> {
                                Client client = clientRepository.findByAccountWithAddresses(account)
                                                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
                                yield ClientMapper.toProfileResponse(client);
                        }
                        case STAFF -> {
                                Staff staff = staffRepository.findByAccount(account)
                                                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
                                yield StaffMapper.toProfileResponse(staff);
                        }
                        case ADMIN -> new AccountProfileResponse.Profile();
                };

                return AccountMapper.toProfileResponse(account, profile);
        }

        private Client getCurrentClientWithAddresses() {
                Account account = verifyCurrentAccount();
                if (!account.isClient()) {
                        throw new UnauthorizedException("Only client accounts can manage shipping addresses");
                }

                return clientRepository.findByAccountWithAddresses(account)
                                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        }

        private ClientAddress findAddress(Client client, Long addressId) {
                return client.getAddresses().stream()
                                .filter(address -> Objects.equals(address.getId(), addressId))
                                .findFirst()
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Address not found with id: " + addressId));
        }

        private void setDefaultAddress(Client client, ClientAddress defaultAddress) {
                client.getAddresses().forEach(address -> address.setIsDefault(false));
                defaultAddress.setIsDefault(true);
        }

        private void ensureDefaultAddress(Client client) {
                if (client.getAddresses().isEmpty()) {
                        return;
                }

                boolean hasDefault = client.getAddresses().stream()
                                .anyMatch(address -> Boolean.TRUE.equals(address.getIsDefault()));

                if (!hasDefault) {
                        client.getAddresses().get(0).setIsDefault(true);
                }
        }

        private void syncDefaultShippingAddress(Client client) {
                client.setAddress(client.getAddresses().stream()
                                .filter(address -> Boolean.TRUE.equals(address.getIsDefault()))
                                .findFirst()
                                .map(this::formatAddress)
                                .orElse(null));
        }

        private String formatAddress(ClientAddress address) {
                // Nối các thành phần địa chỉ theo thứ tự phổ biến tại Việt Nam
                return String.join(", ",
                                address.getStreet(),
                                address.getWard(),
                                address.getDistrict(),
                                address.getCity());
        }

        private AddressMutationResponse buildAddressMutationResponse(Client client, String message) {
                List<AddressResponse> addresses = client.getAddresses().stream()
                                .sorted(Comparator
                                                .comparing((ClientAddress address) -> Boolean.TRUE
                                                                .equals(address.getIsDefault()))
                                                .reversed()
                                                .thenComparing(ClientAddress::getCreatedAt,
                                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .map(address -> AddressResponse.builder()
                                                .id(address.getId())
                                                .street(address.getStreet())
                                                .ward(address.getWard()) // Thêm mới
                                                .district(address.getDistrict()) // Thêm mới
                                                .city(address.getCity())
                                                .isDefault(address.getIsDefault())
                                                // Nếu AddressResponse có trường formattedAddress, hãy dùng hàm
                                                // formatAddress ở trên
                                                // .formattedAddress(formatAddress(address))
                                                .build())
                                .toList();

                return AddressMutationResponse.builder()
                                .success(true)
                                .addresses(addresses)
                                .message(message)
                                .build();
        }

        /**
         * Approve a staff account by admin.
         * Service orchestrates: validation, approval, logging, event publishing
         *
         * @param id staff account ID
         * @return approved staff profile
         */
        @Transactional
        public AccountProfileResponse approveStaffAccount(Long id, String ipAddress) {
                log.info("Approving staff account id={}, ip={}", id, ipAddress);

                Account account = accountRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                // Validate account is a staff using domain behavior
                if (!account.isStaff()) {
                        throw new InvalidRequestException("Only staff accounts can be approved");
                }

                if (account.isPendingEmailVerification()) {
                        throw new InvalidStatusException("Staff has not verified email yet");
                }

                Staff staff = staffRepository.findByAccount(account)
                                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

                Long adminId = SecurityUtils.getCurrentUserId()
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                Account adminAccount = accountRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));

                // Use domain behaviors for approval
                AccountStatus oldStatus = account.getStatus();
                staff.approve(adminId);

                staffRepository.save(staff);
                accountRepository.save(account);

                // Log action using factory method
                AccountActionLog log = AccountActionLog.createApprovalLog(
                                account,
                                adminAccount,
                                "Staff account approved by: " + adminAccount.getUsername(),
                                ipAddress,
                                oldStatus.name(),
                                AccountStatus.ACTIVE.name());
                accountActionLogService.saveLog(log);

                // Publish event
                eventPublisher.publishEvent(new AccountStatusChangeEvent(
                                account,
                                AccountActionType.APPROVE,
                                "Staff account approved by: " + adminAccount.getUsername()));

                AccountProfileResponse.Profile profile = StaffMapper.toProfileResponse(staff);
                AccountProfileResponse response = AccountMapper.toProfileResponse(account, profile);

                AccountService.log.info("Staff account id={} approved successfully by admin={}", id,
                                adminAccount.getUsername());
                return response;
        }

        /**
         * Reject a staff account by admin.
         * Service orchestrates: validation, rejection, logging, event publishing
         *
         * @param id staff account ID
         * @return rejected staff profile
         */
        @Transactional
        public AccountProfileResponse rejectStaffAccount(Long id, String reason, String ipAddress) {
                log.info("Rejecting staff account id={}, reason='{}', ip={}", id, reason, ipAddress);

                Account account = accountRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                // Validate account is a staff using domain behavior
                if (!account.isStaff()) {
                        throw new InvalidRequestException("Only staff accounts can be rejected");
                }

                if (account.isPendingEmailVerification()) {
                        throw new InvalidStatusException("Staff has not verified email yet");
                }

                Staff staff = staffRepository.findByAccount(account)
                                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

                Long adminId = SecurityUtils.getCurrentUserId()
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                Account adminAccount = accountRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));

                // Use domain behaviors for rejection
                AccountStatus oldStatus = account.getStatus();
                staff.reject(adminId, reason);
                account.reject();

                staffRepository.save(staff);
                accountRepository.save(account);

                // Log action using factory method
                AccountActionLog logEntry = AccountActionLog.createRejectionLog(
                                account,
                                adminAccount,
                                reason,
                                ipAddress,
                                oldStatus.name(),
                                AccountStatus.REJECTED.name());
                accountActionLogService.saveLog(logEntry);

                // Publish event
                eventPublisher.publishEvent(new AccountStatusChangeEvent(account, AccountActionType.REJECT, reason));

                AccountProfileResponse.Profile profile = StaffMapper.toProfileResponse(staff);
                AccountProfileResponse response = AccountMapper.toProfileResponse(account, profile);

                log.info("Staff account id={} rejected by admin={} successfully", id, adminAccount.getUsername());
                return response;
        }

        public PageResponse<AccountActionLogResponse> getAccountActivityLogs(Long accountId,
                        AccountActionType actionType, Pageable pageable) {
                Page<AccountActionLog> page = accountActionLogService.getLogsForAccount(accountId, actionType,
                                pageable);

                List<AccountActionLogResponse> items = page.getContent()
                                .stream()
                                .map(LogMapper::toAccountActionLogResponse)
                                .toList();

                return new PageResponse<>(
                                items,
                                page.getNumber(),
                                page.getSize(),
                                page.getTotalElements(),
                                page.getTotalPages(),
                                page.hasNext(),
                                page.hasPrevious());
        }

        @Transactional
        public AccountProfileResponse changeAccountStatus(Long accountId, AccountStatus newStatus, String reason,
                        String ip) {
                log.info("Changing account status for accountId={}, newStatus={}, ip={}", accountId, newStatus, ip);

                Account account = accountRepository.findById(accountId)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                // Handle staff-specific approval/rejection
                if (account.isStaff() && newStatus == AccountStatus.ACTIVE) {
                        return approveStaffAccount(accountId, ip);
                }

                if (account.isStaff() && newStatus == AccountStatus.REJECTED) {
                        return rejectStaffAccount(accountId, reason != null ? reason : "No reason provided", ip);
                }

                // Validate admin account changes
                if (account.isAdmin()) {
                        throw new InvalidRequestException("Cannot change status of ADMIN accounts");
                }

                // Store old status and set new status
                AccountStatus oldStatus = account.getStatus();
                account.setStatus(newStatus);

                Long adminId = SecurityUtils.getCurrentUserId()
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                Account adminAccount = accountRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));

                accountRepository.save(account);

                // Map status to action type
                AccountActionType actionType = LogMapper.mapStatusToAction(newStatus, oldStatus);

                // Create and save log using factory method
                AccountActionLog logEntry = AccountActionLog.createStatusChangeLog(
                                account,
                                adminAccount,
                                actionType,
                                reason != null ? reason
                                                : "Account status changed to: " + newStatus + " by admin: "
                                                                + adminAccount.getUsername(),
                                ip,
                                oldStatus.name(),
                                newStatus.name());
                accountActionLogService.saveLog(logEntry);

                // Publish event
                eventPublisher.publishEvent(new AccountStatusChangeEvent(
                                account,
                                actionType,
                                reason != null ? reason : "Account status changed to: " + newStatus));

                // Build response based on role
                AccountProfileResponse.Profile profile = switch (account.getRole()) {
                        case CLIENT -> {
                                Client client = clientRepository.findByAccount(account)
                                                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
                                yield ClientMapper.toProfileResponse(client);
                        }
                        case STAFF -> {
                                Staff staff = staffRepository.findByAccount(account)
                                                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
                                yield StaffMapper.toProfileResponse(staff);
                        }
                        case ADMIN -> new AccountProfileResponse.Profile();
                };

                log.info("Account status changed successfully for accountId={} from {} to {}", accountId, oldStatus,
                                newStatus);
                return AccountMapper.toProfileResponse(account, profile);
        }

        /**
         * Suspend an active account.
         * Service orchestrates: validation, suspension, logging, event publishing
         */
        @Transactional
        public AccountProfileResponse suspendAccount(Long accountId, String reason, String ipAddress) {
                log.info("Suspending account id={}, reason='{}', ip={}", accountId, reason, ipAddress);

                Account account = accountRepository.findById(accountId)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                if (account.isAdmin()) {
                        throw new InvalidRequestException("Cannot suspend ADMIN accounts");
                }

                Long adminId = SecurityUtils.getCurrentUserId()
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                Account adminAccount = accountRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));

                // Use domain behavior for suspension
                AccountStatus oldStatus = account.getStatus();
                account.suspend();
                accountRepository.save(account);

                // Log action
                AccountActionLog logEntry = AccountActionLog.createStatusChangeLog(
                                account,
                                adminAccount,
                                AccountActionType.SUSPEND,
                                reason != null ? reason : "Account suspended by admin: " + adminAccount.getUsername(),
                                ipAddress,
                                oldStatus.name(),
                                AccountStatus.SUSPENDED.name());
                accountActionLogService.saveLog(logEntry);

                // Publish event
                eventPublisher.publishEvent(new AccountStatusChangeEvent(
                                account,
                                AccountActionType.SUSPEND,
                                reason != null ? reason : "Account suspended"));

                AccountProfileResponse.Profile profile = buildAccountProfile(account);
                log.info("Account id={} suspended successfully by admin={}", accountId, adminAccount.getUsername());
                return AccountMapper.toProfileResponse(account, profile);
        }

        /**
         * Unlock a suspended account.
         * Service orchestrates: validation, unlocking, logging, event publishing
         */
        @Transactional
        public AccountProfileResponse unlockAccount(Long accountId, String reason, String ipAddress) {
                log.info("Unlocking account id={}, reason='{}', ip={}", accountId, reason, ipAddress);

                Account account = accountRepository.findById(accountId)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                if (account.isAdmin()) {
                        throw new InvalidRequestException("Cannot unlock ADMIN accounts");
                }

                Long adminId = SecurityUtils.getCurrentUserId()
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                Account adminAccount = accountRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));

                // Use domain behavior for unlocking
                AccountStatus oldStatus = account.getStatus();
                account.unlock();
                accountRepository.save(account);

                // Log action
                AccountActionLog logEntry = AccountActionLog.createStatusChangeLog(
                                account,
                                adminAccount,
                                AccountActionType.UNLOCK,
                                reason != null ? reason : "Account unlocked by admin: " + adminAccount.getUsername(),
                                ipAddress,
                                oldStatus.name(),
                                AccountStatus.ACTIVE.name());
                accountActionLogService.saveLog(logEntry);

                // Publish event
                eventPublisher.publishEvent(new AccountStatusChangeEvent(
                                account,
                                AccountActionType.UNLOCK,
                                reason != null ? reason : "Account unlocked"));

                AccountProfileResponse.Profile profile = buildAccountProfile(account);
                log.info("Account id={} unlocked successfully by admin={}", accountId, adminAccount.getUsername());
                return AccountMapper.toProfileResponse(account, profile);
        }

        /**
         * Deactivate an active account.
         * Service orchestrates: validation, deactivation, logging, event publishing
         */
        @Transactional
        public AccountProfileResponse deactivateAccount(Long accountId, String reason, String ipAddress) {
                log.info("Deactivating account id={}, reason='{}', ip={}", accountId, reason, ipAddress);

                Account account = accountRepository.findById(accountId)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                if (account.isAdmin()) {
                        throw new InvalidRequestException("Cannot deactivate ADMIN accounts");
                }

                Long adminId = SecurityUtils.getCurrentUserId()
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                Account adminAccount = accountRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));

                // Use domain behavior for deactivation
                AccountStatus oldStatus = account.getStatus();
                account.deactivate();
                accountRepository.save(account);

                // Log action
                AccountActionLog logEntry = AccountActionLog.createStatusChangeLog(
                                account,
                                adminAccount,
                                AccountActionType.DEACTIVATE,
                                reason != null ? reason : "Account deactivated by admin: " + adminAccount.getUsername(),
                                ipAddress,
                                oldStatus.name(),
                                AccountStatus.DEACTIVATED.name());
                accountActionLogService.saveLog(logEntry);

                // Publish event
                eventPublisher.publishEvent(new AccountStatusChangeEvent(
                                account,
                                AccountActionType.DEACTIVATE,
                                reason != null ? reason : "Account deactivated"));

                AccountProfileResponse.Profile profile = buildAccountProfile(account);
                log.info("Account id={} deactivated successfully by admin={}", accountId, adminAccount.getUsername());
                return AccountMapper.toProfileResponse(account, profile);
        }

        /**
         * Helper method to build account profile based on role
         */
        private AccountProfileResponse.Profile buildAccountProfile(Account account) {
                return switch (account.getRole()) {
                        case CLIENT -> {
                                Client client = clientRepository.findByAccount(account)
                                                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
                                yield ClientMapper.toProfileResponse(client);
                        }
                        case STAFF -> {
                                Staff staff = staffRepository.findByAccount(account)
                                                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
                                yield StaffMapper.toProfileResponse(staff);
                        }
                        case ADMIN -> new AccountProfileResponse.Profile();
                };
        }

        public void deleteAccountById(Long id, String ipAddress) {
                log.info("Deleting account id={}, ip={}", id, ipAddress);

                Account account = accountRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                Long adminId = SecurityUtils.getCurrentUserId()
                                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

                Account adminAccount = accountRepository.findById(adminId)
                                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));

                AccountStatus oldStatus = account.getStatus();
                account.setStatus(AccountStatus.DEACTIVATED);

                accountActionLogService.logAction(
                                account.getId(),
                                AccountActionType.DEACTIVATE,
                                "Account status changed to: " + AccountStatus.DEACTIVATED + " by admin: "
                                                + adminAccount.getUsername(),
                                adminId,
                                ipAddress,
                                oldStatus.name(),
                                AccountStatus.DEACTIVATED.name());

                eventPublisher.publishEvent(new AccountStatusChangeEvent(account, AccountActionType.DEACTIVATE,
                                "Account status changed to: " + AccountStatus.DEACTIVATED + " by admin: "
                                                + adminAccount.getUsername()));

                log.info("Account id={} deleted successfully", id);
        }

}
