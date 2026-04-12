package com.carevia.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.Client;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.ClientRepository;
import com.carevia.service.storage.CloudinaryStorageService;
import com.carevia.shared.annotation.Audit;
import com.carevia.shared.constant.AccountStatus;
import com.carevia.shared.constant.AuditAction;
import com.carevia.shared.constant.Role;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.client.UpdateClientRequest;
import com.carevia.shared.dto.response.account.UploadAvatarResponse;
import com.carevia.shared.dto.response.client.*;
import com.carevia.shared.exception.*;
import com.carevia.shared.mapper.ClientMapper;
import com.carevia.shared.util.CloudinaryUtils;
import com.carevia.shared.util.SecurityUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class ClientService {

    private static final Logger log = LoggerFactory.getLogger(ClientService.class);
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final ClientRepository clientRepository;
    private final AccountRepository accountRepository;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final CloudinaryUtils cloudinaryUtils;
    private final AccountService accountService;

    @Value("${app.avatar.max-size-bytes}")
    private long maxSizeBytes;

    public ClientService(ClientRepository clientRepository,
                          AccountRepository accountRepository,
                          CloudinaryStorageService cloudinaryStorageService,
                          CloudinaryUtils cloudinaryUtils,
                          AccountService accountService) {
        this.clientRepository = clientRepository;
        this.accountRepository = accountRepository;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.cloudinaryUtils = cloudinaryUtils;
        this.accountService = accountService;
    }

    /**
     * Get client by ID
     * - CLIENT: Can only view their own profile
     * - TEACHER: Can view students enrolled in their courses
     * - ADMIN: Can view any client
     */
    public ClientDetailResponse getClientById(Long id) {
        log.info("Fetching client by id: {}", id);

        Client client = clientRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        // Check authorization (includes enrollment check for teachers)
        validateClientAccess(client);

        return ClientMapper.toClientDetailResponse(client);
    }

    /**
     * Get client by client code
     * - CLIENT: Can only view their own profile
     * - TEACHER: Can view clients enrolled in their courses
     * - ADMIN: Can view any client
     */
    public ClientDetailResponse getClientByCode(String code) {
        log.info("Fetching client by code: {}", code);

        Client client = clientRepository.findByClientCodeWithAccount(code)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with code: " + code));

        // Check authorization (includes enrollment check for teachers)
        validateClientAccess(client);

        return ClientMapper.toClientDetailResponse(client);
    }

    /**
     * Update client information
     * - CLIENT: Can only update their own profile
     * - ADMIN: Can update any client
     */
    @Transactional
    @Audit(table = "clients", action = AuditAction.UPDATE)
    public ClientDetailResponse updateClient(Long id, UpdateClientRequest request) {
        log.info("Updating client id: {}", id);

        Client client = clientRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        // Check account is active
        if (client.getAccount().getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidStatusException("Cannot update inactive client account");
        }

        // Check authorization
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account currentAccount = accountRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current account not found"));

        // CLIENT can only update their own profile
        if (currentAccount.getRole() == Role.CLIENT) {
            if (!client.getAccount().getId().equals(currentUserId)) {
                throw new UnauthorizedException("Clients can only update their own profile");
            }
        }

        // Validate unique client code if changed
        if (request.getClientCode() != null &&
            !request.getClientCode().equals(client.getClientCode())) {
            if (clientRepository.findByClientCode(request.getClientCode()).isPresent()) {
                throw new InvalidRequestException("Client code already exists: " + request.getClientCode());
            }
            client.setClientCode(request.getClientCode());
        }

        // Update client information
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            client.setFullName(request.getFullName());
        }
        if (request.getBirthDate() != null) {
            client.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            client.setGender(request.getGender());
        }
        if (request.getPhone() != null) {
            client.setPhone(request.getPhone());
        }
        if (request.getBio() != null) {
            client.setBio(request.getBio());
        }

        client = clientRepository.save(client);

        log.info("Client id: {} updated successfully", id);
        return ClientMapper.toClientDetailResponse(client);
    }

    /**
     * Upload avatar for client
     * - CLIENT: Can only upload their own avatar
     */
    @Transactional
    public UploadAvatarResponse uploadClientAvatar(Long id, MultipartFile file) {
        log.info("Uploading avatar for client id: {}", id);

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

        Client client = clientRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        // Check account is active
        if (client.getAccount().getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidStatusException("Cannot update avatar for inactive client account");
        }

        // Check authorization - CLIENT can only upload their own avatar
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        if (!client.getAccount().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Clients can only update their own avatar");
        }

        Account account = client.getAccount();
        String oldPublicId = account.getAvatarPublicId();

        // Upload avatar to Cloudinary
        CloudinaryStorageService.UploadResult uploadResult =
                cloudinaryStorageService.uploadAvatar(file, account.getId(), oldPublicId);

        // Delete old image if a new one is generated
        if (oldPublicId != null && !Objects.equals(oldPublicId, uploadResult.getPublicId())) {
            try {
                cloudinaryStorageService.deleteByPublicId(oldPublicId);
                log.info("Deleted old avatar: {}", oldPublicId);
            } catch (Exception ex) {
                log.warn("Failed to delete old avatar ({}): {}", oldPublicId, ex.getMessage());
            }
        }

        // Update avatar info in DB
        account.setAvatarUrl(uploadResult.getUrl());
        account.setAvatarPublicId(uploadResult.getPublicId());
        accountRepository.save(account);

        // Prepare response
        UploadAvatarResponse response = new UploadAvatarResponse();
        response.setAvatarUrl(uploadResult.getUrl());
        response.setThumbnailUrl(cloudinaryUtils.getThumbnailUrl(uploadResult.getPublicId(), 200, 200));

        log.info("Avatar uploaded successfully for client id: {}", id);
        return response;
    }

    /**
     * Get client's enrolled courses
     * - CLIENT: Can only view their own courses
     * - TEACHER: Can view clients enrolled in their courses
     * - ADMIN: Can view any client's courses
     *
     * Implementation Plan:
     * 1. Query enrollments by client ID with course information
     * 2. Map enrollments to ClientCourseResponse with:
     *    - Course details (title, description, thumbnail)
     *    - Enrollment status and date
     *    - Progress percentage
     *    - Completion status
     *    - Teacher information
     * 3. Add filters: status (ACTIVE, COMPLETED, DROPPED), search by course name
     * 4. Sort by: enrollment date, progress, course title
     * 5. Consider caching for performance
     */



   
   
    //  * Delete client (Admin only)
    //  * - Soft delete by setting account status to DEACTIVATED
    //  */
    @Transactional
    public void deleteClient(Long id, String ipAddress) {
        log.info("Deleting client id: {}", id);

        Client client = clientRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        // Use AccountService to handle account deactivation with proper logging
        accountService.deleteAccountById(client.getAccount().getId(), ipAddress);

        log.info("Client id: {} deleted successfully", id);
    }

    /**
     * Validate if current user has access to view/modify client data
     *
     * Access Rules:
     * - ADMIN: Can access any client
     * - CLIENT: Can only access their own data
     * - TEACHER: Can access clients enrolled in their courses
     *
     * Implementation Plan for Teacher Enrollment Check:
     * 1. Query enrollments to find common courses between teacher and client
     * 2. Check if teacher owns any course the client is enrolled in
     * 3. Use EnrollmentRepository.existsByClientIdAndCourseTeacherId()
     * 4. Cache the result for performance
     */
    private void validateClientAccess(Client client) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account currentAccount = accountRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current account not found"));

        // ADMIN can access any student
        if (currentAccount.getRole() == Role.ADMIN) {
            return;
        }

        // CLIENT can only access their own data
        if (currentAccount.getRole() == Role.CLIENT) {
            if (!client.getAccount().getId().equals(currentUserId)) {
                throw new UnauthorizedException("Clients can only access their own data");
            }
            return;
        }

        // TEACHER can access clients enrolled in their courses
        // if (currentAccount.getRole() == Role.TEACHER) {
            // Implementation pending - requires Enrollment entity
            // When Enrollment entity is available:
            // Teacher teacher = teacherRepository.findByAccountId(currentUserId)
            //     .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            // boolean hasEnrollment = enrollmentRepository
            //     .existsByClientIdAndCourseTeacherId(client.getId(), teacher.getId());
            // if (!hasEnrollment) {
            //     throw new UnauthorizedException("Teacher can only access clients enrolled in their courses");
            // }

            // For now, allow teacher access (will be restricted when Enrollment is implemented)
        //     log.debug("Teacher access granted for client id: {} (enrollment check pending)", client.getId());
        //     return;
        // }

        throw new UnauthorizedException("Access denied");
    }
}


