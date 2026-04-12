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
import com.carevia.core.domain.Staff;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.StaffRepository;
import com.carevia.service.storage.CloudinaryStorageService;
import com.carevia.shared.annotation.Audit;
import com.carevia.shared.constant.AccountStatus;
import com.carevia.shared.constant.AuditAction;
import com.carevia.shared.constant.Role;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.staff.UpdateStaffRequest;
import com.carevia.shared.dto.response.account.UploadAvatarResponse;
import com.carevia.shared.dto.response.client.ClientResponse;
import com.carevia.shared.dto.response.staff.StaffDetailResponse;
import com.carevia.shared.dto.response.staff.StaffRevenueResponse;
import com.carevia.shared.dto.response.staff.StaffStatsResponse;
import com.carevia.shared.exception.*;
import com.carevia.shared.mapper.StaffMapper;
import com.carevia.shared.util.CloudinaryUtils;
import com.carevia.shared.util.SecurityUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class StaffService {

    private static final Logger log = LoggerFactory.getLogger(StaffService.class);
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final CloudinaryUtils cloudinaryUtils;
    private final AccountService accountService;

    @Value("${app.avatar.max-size-bytes}")
    private long maxSizeBytes;

    public StaffService(StaffRepository staffRepository,
            AccountRepository accountRepository,
            CloudinaryStorageService cloudinaryStorageService,
            CloudinaryUtils cloudinaryUtils,
            AccountService accountService) {
        this.staffRepository = staffRepository;
        this.accountRepository = accountRepository;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.cloudinaryUtils = cloudinaryUtils;
        this.accountService = accountService;
    }

    /**
     * Get staff by ID
     * - STAFF: Can only view their own profile
     * - ADMIN: Can view any staff
     * - STUDENT: Can view approved staff teaching their courses
     */
    public StaffDetailResponse getStaffById(Long id) {
        log.info("Fetching staff by id: {}", id);

        Staff staff = staffRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Check authorization
        validateStaffAccess(staff);

        return StaffMapper.toStaffDetailResponse(staff);
    }

    /**
     * Get staff by staff code
     * - STAFF: Can only view their own profile
     * - ADMIN: Can view any staff
     * - STUDENT: Can view approved staff teaching their courses
     */
    public StaffDetailResponse getStaffByCode(String code) {
        log.info("Fetching staff by code: {}", code);

        Staff staff = staffRepository.findByStaffCodeWithAccount(code)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with code: " + code));

        // Check authorization
        validateStaffAccess(staff);

        return StaffMapper.toStaffDetailResponse(staff);
    }

    /**
     * Update staff information
     * - STAFF: Can only update their own profile
     * - ADMIN: Can update any staff
     */
    @Transactional
    @Audit(table = "staff", action = AuditAction.UPDATE)
    public StaffDetailResponse updateStaff(Long id, UpdateStaffRequest request) {
        log.info("Updating staff id: {}", id);

        Staff staff = staffRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Check account is active
        if (staff.getAccount().getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidStatusException("Cannot update inactive staff account");
        }

        // Check authorization
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account currentAccount = accountRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current account not found"));

        // STAFF can only update their own profile
        if (currentAccount.getRole() == Role.STAFF) {
            if (!staff.getAccount().getId().equals(currentUserId)) {
                throw new UnauthorizedException("Staff can only update their own profile");
            }
        }

        // Validate unique staff code if changed
        if (request.getStaffCode() != null &&
                !request.getStaffCode().equals(staff.getStaffCode())) {
            if (staffRepository.findByStaffCode(request.getStaffCode()).isPresent()) {
                throw new InvalidRequestException("Staff code already exists: " + request.getStaffCode());
            }
            staff.setStaffCode(request.getStaffCode());
        }

        // Update staff information
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            staff.setFullName(request.getFullName());
        }
        if (request.getBirthDate() != null) {
            staff.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            staff.setGender(request.getGender());
        }
        if (request.getPhone() != null) {
            staff.setPhone(request.getPhone());
        }
        if (request.getBio() != null) {
            staff.setBio(request.getBio());
        }
        if (request.getSpecialty() != null) {
            staff.setSpecialty(request.getSpecialty());
        }
        if (request.getDegree() != null) {
            staff.setDegree(request.getDegree());
        }

        staff = staffRepository.save(staff);

        log.info("Staff id: {} updated successfully", id);
        return StaffMapper.toStaffDetailResponse(staff);
    }

    /**
     * Upload avatar for staff
     * - STAFF: Can only upload their own avatar
     */
    @Transactional
    public UploadAvatarResponse uploadStaffAvatar(Long id, MultipartFile file) {
        log.info("Uploading avatar for staff id: {}", id);

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

        Staff staff = staffRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Check account is active
        if (staff.getAccount().getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidStatusException("Cannot update avatar for inactive staff account");
        }

        // Check authorization - STAFF can only upload their own avatar
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        if (!staff.getAccount().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Staff can only update their own avatar");
        }

        Account account = staff.getAccount();
        String oldPublicId = account.getAvatarPublicId();

        // Upload avatar to Cloudinary
        CloudinaryStorageService.UploadResult uploadResult = cloudinaryStorageService.uploadAvatar(file,
                account.getId(), oldPublicId);

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

        log.info("Avatar uploaded successfully for staff id: {}", id);
        return response;
    }

    /**
     * Request approval for staff account
     * - STAFF: Can request approval for their own account
     *
     * Full Implementation Plan:
     * 1. Validate staff profile completeness:
     * - Specialty and degree are required
     * - Bio and phone are recommended
     * - Avatar is recommended
     * 2. Create ApprovalRequest entity to track:
     * - Request timestamp
     * - Staff information snapshot
     * - Status (PENDING, APPROVED, REJECTED)
     * - Processing timeline
     * 3. Send notification to admin:
     * - Email notification with staff details
     * - In-app notification
     * - Dashboard alert for pending approvals
     * 4. Set pending approval status flag
     * 5. Log approval request activity
     * 6. Return updated staff profile with request status
     */
    @Transactional
    @Audit(table = "staff", action = AuditAction.UPDATE)
    public StaffDetailResponse requestApproval(Long id) {
        log.info("Staff id: {} requesting approval", id);

        Staff staff = staffRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Check authorization - STAFF can only request approval for themselves
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        if (!staff.getAccount().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Staff can only request approval for themselves");
        }

        // Check if already approved
        if (staff.isApproved()) {
            throw new InvalidRequestException("Staff is already approved");
        }

        // Validate profile completeness
        if (staff.getSpecialty() == null || staff.getSpecialty().isBlank()) {
            throw new InvalidRequestException("Specialty is required for approval request");
        }
        if (staff.getDegree() == null || staff.getDegree().isBlank()) {
            throw new InvalidRequestException("Degree is required for approval request");
        }

        // Implementation pending - requires ApprovalRequest entity and EmailService
        // When ApprovalRequest entity is available:
        // ApprovalRequest approvalRequest = ApprovalRequest.builder()
        // .staff(staff)
        // .requestDate(Instant.now())
        // .status(ApprovalStatus.PENDING)
        // .build();
        // approvalRequestRepository.save(approvalRequest);
        //
        // Send notification to admin:
        // emailService.sendStaffApprovalRequestEmail(staff);
        // notificationService.notifyAdminsOfPendingApproval(staff);

        log.info("Approval request submitted for staff id: {}", id);
        log.warn("Full approval workflow pending - requires ApprovalRequest entity and notification services");

        return StaffMapper.toStaffDetailResponse(staff);
    }

    /**
     * Approve staff (Admin only)
     *
     * Implementation Plan for Notifications:
     * 1. Send approval email to staff:
     * - Congratulations message
     * - Next steps (creating courses, profile setup)
     * - Platform guidelines and policies
     * - Links to staff dashboard
     * 2. Create in-app notification:
     * - Notification type: STAFF_APPROVED
     * - Include approval date and approver info (optional)
     * 3. Update approval request status (if using ApprovalRequest entity)
     * 4. Log approval action in audit trail
     */
    @Transactional
    @Audit(table = "staff", action = AuditAction.UPDATE)
    public StaffDetailResponse approveStaff(Long id, String note) {
        log.info("Approving staff id: {}", id);

        // Verify admin role
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account currentAccount = accountRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current account not found"));

        if (currentAccount.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can approve staff");
        }

        Staff staff = staffRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        if (staff.isApproved()) {
            throw new InvalidRequestException("Staff is already approved");
        }

        staff.setApproved(true);
        staff.setApprovedBy(currentUserId);
        staff.setApprovedAt(Instant.now());
        staff.setRejectReason(null); // Clear any previous rejection reason

        staff = staffRepository.save(staff);

        // Send approval notification - implementation pending
        // When EmailService is available:
        // emailService.sendStaffApprovalEmail(staff, note);
        // notificationService.createNotification(
        // staff.getAccount().getId(),
        // NotificationType.STAFF_APPROVED,
        // "Your staff account has been approved! You can now create and publish
        // courses."
        // );
        //
        // Update approval request if exists:
        // approvalRequestRepository.findByStaffId(id).ifPresent(request -> {
        // request.setStatus(ApprovalStatus.APPROVED);
        // request.setApprovedBy(currentUserId);
        // request.setApprovedAt(Instant.now());
        // request.setNote(note);
        // approvalRequestRepository.save(request);
        // });

        log.info("Staff id: {} approved successfully by admin id: {}", id, currentUserId);
        log.warn("Email notification pending - requires EmailService and NotificationService");

        return StaffMapper.toStaffDetailResponse(staff);
    }

    /**
     * Reject staff (Admin only)
     *
     * Implementation Plan for Notifications:
     * 1. Send rejection email to staff:
     * - Professional rejection message
     * - Clear explanation of rejection reason
     * - Steps to address issues
     * - Information about re-application process
     * - Support contact information
     * 2. Create in-app notification:
     * - Notification type: STAFF_REJECTED
     * - Include rejection reason
     * - Link to profile improvement suggestions
     * 3. Update approval request status (if using ApprovalRequest entity)
     * 4. Log rejection action in audit trail
     */
    @Transactional
    @Audit(table = "staff", action = AuditAction.UPDATE)
    public StaffDetailResponse rejectStaff(Long id, String reason) {
        log.info("Rejecting staff id: {}", id);

        // Verify admin role
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account currentAccount = accountRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current account not found"));

        if (currentAccount.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can reject staff");
        }

        Staff staff = staffRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        staff.setApproved(false);
        staff.setRejectReason(reason);
        staff.setApprovedBy(null);
        staff.setApprovedAt(null);

        staff = staffRepository.save(staff);

        // Send rejection notification - implementation pending
        // When EmailService is available:
        // emailService.sendStaffRejectionEmail(staff, reason);
        // notificationService.createNotification(
        // staff.getAccount().getId(),
        // NotificationType.STAFF_REJECTED,
        // "Your staff application has been reviewed. Please check your email for
        // details."
        // );
        //
        // Update approval request if exists:
        // approvalRequestRepository.findByStaffId(id).ifPresent(request -> {
        // request.setStatus(ApprovalStatus.REJECTED);
        // request.setRejectedBy(currentUserId);
        // request.setRejectedAt(Instant.now());
        // request.setRejectionReason(reason);
        // approvalRequestRepository.save(request);
        // });

        log.info("Staff id: {} rejected by admin id: {} with reason: {}", id, currentUserId, reason);
        log.warn("Email notification pending - requires EmailService and NotificationService");

        return StaffMapper.toStaffDetailResponse(staff);
    }

    public PageResponse<ClientResponse> getStaffClients(Long id, Pageable pageable) {
        log.info("Fetching clients for staff id: {}", id);

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Check authorization - only staff themselves or admin
        validateStaffOwnershipOrAdmin(staff);

        // Implementation pending - requires Enrollment entity and optimized queries
        // When Enrollment entity and repository are available:
        // Page<Client> clientPage =
        // clientRepository.findDistinctByEnrollmentsCourseStaffId(id, pageable);
        //
        // List<ClientResponse> clients = clientPage.getContent().stream()
        // .map(client -> {
        // // Get enrollment statistics for this client with this staff
        // long enrollmentCount = enrollmentRepository
        // .countByClientIdAndCourseStaffId(client.getId(), id);
        // double avgProgress = enrollmentRepository
        // .getAverageProgressByClientIdAndStaffId(client.getId(), id);
        // Instant latestEnrollment = enrollmentRepository
        // .getLatestEnrollmentDateByClientIdAndStaffId(client.getId(), id);
        //
        // return ClientResponse.builder()
        // .id(client.getId())
        // .clientCode(client.getClientCode())
        // .fullName(client.getFullName())
        // .email(client.getAccount().getEmail())
        // .avatarUrl(client.getAccount().getAvatarUrl())
        // .enrollmentCount((int) enrollmentCount)
        // .averageProgress(avgProgress)
        // .latestEnrollmentDate(latestEnrollment)
        // .build();
        // })
        // .toList();

        List<ClientResponse> clients = new ArrayList<>();
        Page<ClientResponse> page = new PageImpl<>(clients, pageable, 0);

        log.debug("Returning {} clients for staff id: {}", clients.size(), id);
        log.warn("Client enrollment query pending - requires Enrollment entity and optimized repository methods");

        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious());
    }

    /**
     * Get staff's revenue statistics
     * - STAFF: Can only view their own revenue
     * - ADMIN: Can view any staff's revenue
     *
     * Implementation Plan:
     * 1. Query all paid enrollments for staff's courses with:
     * - Join: Enrollment -> Payment -> Course -> Staff
     * - Filter: Payment status = COMPLETED
     * - Filter: Course staff_id = staff.id
     * 2. Calculate total revenue:
     * - Sum of all successful payments
     * - Apply revenue share percentage (e.g., 70% to staff, 30% platform fee)
     * - Consider refunds (subtract refunded amounts)
     * 3. Break down by time periods:
     * - Monthly revenue: Current month and last 12 months
     * - Yearly revenue: Current year and historical years
     * - Daily revenue: Last 30 days for trend analysis
     * 4. Break down by course:
     * - Revenue per course
     * - Enrollment count per course
     * - Average revenue per enrollment
     * - Top earning courses
     * 5. Include enrollment statistics:
     * - Total enrollments (lifetime)
     * - Monthly enrollments
     * - Enrollment conversion rate
     * 6. Add filters:
     * - Date range (start date, end date)
     * - Specific course
     * - Payment method
     * 7. Currency handling:
     * - Support multiple currencies
     * - Convert to staff's preferred currency
     * 8. Caching strategy:
     * - Cache monthly/yearly totals
     * - Invalidate cache on new payment
     * - Use Redis for high-traffic staff
     * 9. Performance optimization:
     * - Use database aggregation functions
     * - Materialize monthly revenue in separate table
     * - Schedule background jobs for statistics update
     */
    public StaffRevenueResponse getStaffRevenue(Long id) {
        log.info("Fetching revenue for staff id: {}", id);

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Check authorization - only staff themselves or admin
        validateStaffOwnershipOrAdmin(staff);

        // Implementation pending - requires Payment, Enrollment entities and revenue
        // calculation logic
        // When Payment and Enrollment entities are available:
        //
        // Calculate total revenue:
        // Double totalRevenue = paymentRepository
        // .sumRevenueByStaffId(id, PaymentStatus.COMPLETED);
        // Double staffShare = totalRevenue * revenueSharePercentage;
        //
        // Calculate monthly revenue:
        // Instant startOfMonth =
        // LocalDate.now().withDayOfMonth(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        // Double monthlyRevenue = paymentRepository
        // .sumRevenueByStaffIdAndDateRange(id, startOfMonth, Instant.now());
        //
        // Calculate yearly revenue:
        // Instant startOfYear =
        // LocalDate.now().withDayOfYear(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        // Double yearlyRevenue = paymentRepository
        // .sumRevenueByStaffIdAndDateRange(id, startOfYear, Instant.now());
        //
        // Get enrollment counts:
        // Long totalEnrollments = enrollmentRepository.countByStaffId(id);
        // Long monthlyEnrollments = enrollmentRepository
        // .countByStaffIdAndDateRange(id, startOfMonth, Instant.now());
        //
        // Get revenue by course:
        // List<RevenueByCourse> revenueByCourse = paymentRepository
        // .getRevenueGroupedByStaffId(id);

        StaffRevenueResponse response = StaffRevenueResponse.builder()
                .totalRevenue(BigDecimal.ZERO) // Use BigDecimal.ZERO for 0.0
                .monthlyRevenue(BigDecimal.ZERO)
                .yearlyRevenue(BigDecimal.ZERO)
                .totalEnrollments(0L)
                .monthlyEnrollments(0L)
                .revenueByCourse(new HashMap<>())
                .lastUpdated(Instant.now())
                .build();

        log.debug("Returning revenue data for staff id: {}", id);
        log.warn(
                "Revenue calculation pending - requires Payment entity, Enrollment entity, and revenue share configuration");

        return response;
    }

    /**
     * Get staff statistics
     * - STAFF: Can view their own stats
     * - ADMIN: Can view any staff's stats
     *
     * Implementation Plan:
     * 1. Count courses by status:
     * - Total courses: All courses created by staff
     * - Published courses: Status = PUBLISHED
     * - Draft courses: Status = DRAFT
     * - Archived courses: Status = ARCHIVED
     * - Pending review courses: Status = PENDING_REVIEW
     * 2. Count total clients:
     * - Query distinct clients enrolled in any staff's course
     * - Consider only active enrollments
     * 3. Calculate average rating:
     * - Aggregate all course reviews for staff's courses
     * - Calculate weighted average based on review count
     * - Round to 2 decimal places
     * 4. Count total reviews:
     * - Sum of all reviews across all staff's courses
     * - Group by rating (5-star, 4-star, etc.) for distribution
     * 5. Calculate total revenue:
     * - Use getStaffRevenue() method
     * - Consider only completed payments
     * - Apply revenue share percentage
     * 6. Additional statistics:
     * - Course completion rate
     * - Student engagement rate
     * - Average course duration
     * - Most popular course
     * - Recent activity (courses created, updated in last 30 days)
     * 7. Caching strategy:
     * - Cache statistics for 15 minutes (suitable for dashboard)
     * - Use @Cacheable annotation with key: "staff_stats_{staffId}"
     * - Invalidate cache on:
     * * New course published
     * * New review received
     * * Enrollment status changes
     * 8. Performance optimization:
     * - Use native SQL queries for complex aggregations
     * - Implement background job to pre-calculate stats
     * - Store computed stats in staff_statistics table
     */
    public StaffStatsResponse getStaffStats(Long id) {
        log.info("Fetching statistics for staff id: {}", id);

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Check authorization
        validateStaffAccess(staff);

        // Implementation pending - requires Course, Review, Enrollment entities
        // When entities and repositories are available:
        //
        // Count courses by status:
        // Long totalCourses = courseRepository.countByStaffId(id);
        // Long publishedCourses = courseRepository.countByStaffIdAndStatus(id,
        // CourseStatus.PUBLISHED);
        // Long draftCourses = courseRepository.countByStaffIdAndStatus(id,
        // CourseStatus.DRAFT);
        //
        // Count total clients:
        // Long totalClients = enrollmentRepository.countDistinctClientsByStaffId(id);
        //
        // Calculate average rating:
        // Double averageRating = reviewRepository.getAverageRatingByStaffId(id);
        //
        // Count total reviews:
        // Long totalReviews = reviewRepository.countByStaffId(id);
        //
        // Calculate total revenue:
        // StaffRevenueResponse revenue = getStaffRevenue(id);
        // Double totalRevenue = revenue.getTotalRevenue();

        StaffStatsResponse stats = StaffStatsResponse.builder()
                .totalCourses(0L)
                .publishedCourses(0L)
                .draftCourses(0L)
                .totalClients(0L)
                .totalReviews(0L)
                .averageRating(0.0)
                .totalRevenue(0.0)
                .build();

        log.debug("Returning statistics for staff id: {}", id);
        log.warn(
                "Statistics calculation pending - requires Course, Review, Enrollment entities and aggregation queries");

        return stats;
    }

    /**
     * Delete staff (Admin only)
     * - Soft delete by setting account status to DEACTIVATED
     */
    @Transactional
    public void deleteStaff(Long id, String ipAddress) {
        log.info("Deleting staff id: {}", id);

        Staff staff = staffRepository.findByIdWithAccount(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Use AccountService to handle account deactivation with proper logging
        accountService.deleteAccountById(staff.getAccount().getId(), ipAddress);

        log.info("Staff id: {} deleted successfully", id);
    }

    /**
     * Validate staff access - ensures staff can only access their own data
     * Throws UnauthorizedException if access denied
     *
     * Used by methods that require staff to access only their own profile
     * (not used for admin access checks - use validateStaffOwnershipOrAdmin
     * instead)
     */
    public void validateStaffAccess(Staff staff) {
        Account currentAccount = accountService.validateCurrentAccountByRole(Role.STAFF);

        if (!staff.getAccount().getId().equals(currentAccount.getId())) {
            throw new UnauthorizedException("Staff can only access their own data");
        }

        // Access granted - return normally
    }

    /**
     * Validate staff ownership or admin role
     */
    public void validateStaffOwnershipOrAdmin(Staff staff) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account currentAccount = accountRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current account not found"));

        // ADMIN can access any staff
        if (currentAccount.getRole() == Role.ADMIN) {
            return;
        }

        // STAFF can only access their own data
        if (currentAccount.getRole() == Role.STAFF) {
            if (!staff.getAccount().getId().equals(currentUserId)) {
                throw new UnauthorizedException("Staff can only access their own data");
            }
            return;
        }

        throw new UnauthorizedException("Access denied");
    }
}
