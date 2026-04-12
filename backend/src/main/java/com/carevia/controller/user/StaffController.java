package com.carevia.controller.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.carevia.service.StaffService;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.staff.ApproveStaffRequest;
import com.carevia.shared.dto.request.client.RejectStaffRequest;
import com.carevia.shared.dto.request.staff.UpdateStaffRequest;
import com.carevia.shared.dto.response.account.UploadAvatarResponse;
import com.carevia.shared.dto.response.client.ClientResponse;
import com.carevia.shared.dto.response.staff.StaffDetailResponse;
import com.carevia.shared.dto.response.staff.StaffRevenueResponse;
import com.carevia.shared.dto.response.staff.StaffStatsResponse;
import com.carevia.shared.annotation.AdminOnly;
import com.carevia.shared.annotation.ApiMessage;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.annotation.StaffOrAdmin;
import com.carevia.shared.annotation.StaffOnly;

@RestController
@RequestMapping("/api/v1/staff")
@Tag(name = "Staff Management", description = "APIs for managing staff information, courses, and statistics")
@SecurityRequirement(name = "bearerAuth")
public class StaffController {

        private static final Logger log = LoggerFactory.getLogger(StaffController.class);
        private final StaffService staffService;

        public StaffController(StaffService staffService) {
                this.staffService = staffService;
        }

        @Operation(summary = "Get staff by ID", description = "Retrieve detailed information about a staff member by their ID. Staff can only view their own profile, clients can view approved staff, and admins can view any staff.")
        @GetMapping("/{id}")
        @ApiMessage("Get staff by ID")
        @Authenticated
        public ResponseEntity<StaffDetailResponse> getStaffById(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id) {
                log.info("GET /api/v1/staff/{}", id);
                StaffDetailResponse response = staffService.getStaffById(id);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Get staff by code", description = "Retrieve detailed information about a staff member by their staff code. Staff can only view their own profile, clients can view approved staff, and admins can view any staff.")
        @GetMapping("/code/{code}")
        @ApiMessage("Get staff by code")
        @Authenticated
        public ResponseEntity<StaffDetailResponse> getStaffByCode(
                        @Parameter(description = "Staff code", required = true, example = "ST2024001") @PathVariable String code) {
                log.info("GET /api/v1/staff/code/{}", code);
                StaffDetailResponse response = staffService.getStaffByCode(code);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Update staff information", description = "Update staff profile information including specialty, degree, and personal details. Staff can only update their own profile, admins can update any staff.")
        @PutMapping("/{id}")
        @ApiMessage("Update staff information")
        @StaffOrAdmin
        public ResponseEntity<StaffDetailResponse> updateStaff(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id,
                        @Parameter(description = "Updated staff information", required = true) @Valid @RequestBody UpdateStaffRequest request) {
                log.info("PUT /api/v1/staff/{}", id);
                StaffDetailResponse response = staffService.updateStaff(id, request);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Upload staff avatar", description = "Upload a new avatar image for a staff member. Staff can only upload their own avatar. Accepts JPG, PNG, and WEBP formats.")
        @PutMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @ApiMessage("Upload staff avatar")
        @StaffOrAdmin
        public ResponseEntity<UploadAvatarResponse> uploadAvatar(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id,
                        @Parameter(description = "Avatar image file (JPG, PNG, WEBP)", required = true) @RequestParam("file") MultipartFile file) {
                log.info("PUT /api/v1/staff/{}/avatar", id);
                UploadAvatarResponse response = staffService.uploadStaffAvatar(id, file);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Request staff approval", description = "Staff requests approval from admin to start working. Can only be called by the staff themselves.")
        @PostMapping("/{id}/request-approval")
        @ApiMessage("Request staff approval")
        @StaffOnly
        public ResponseEntity<StaffDetailResponse> requestApproval(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id) {
                log.info("POST /api/v1/staff/{}/request-approval", id);
                StaffDetailResponse response = staffService.requestApproval(id);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Approve staff", description = "Admin approves a staff member to allow them to start working. Only accessible by admins.")
        @PostMapping("/{id}/approve")
        @ApiMessage("Approve staff")
        @AdminOnly
        public ResponseEntity<StaffDetailResponse> approveStaff(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id,
                        @Parameter(description = "Optional approval note") @RequestBody(required = false) ApproveStaffRequest request) {
                log.info("POST /api/v1/staff/{}/approve", id);
                String note = request != null ? request.getNote() : null;
                StaffDetailResponse response = staffService.approveStaff(id, note);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Reject staff", description = "Admin rejects a staff application with a reason. Only accessible by admins.")
        @PostMapping("/{id}/reject")
        @ApiMessage("Reject staff")
        @AdminOnly
        public ResponseEntity<StaffDetailResponse> rejectStaff(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id,
                        @Parameter(description = "Rejection reason", required = true) @Valid @RequestBody RejectStaffRequest request) {
                log.info("POST /api/v1/staff/{}/reject", id);
                StaffDetailResponse response = staffService.rejectStaff(id, request.getReason());
                return ResponseEntity.ok(response);
        }

       

       

        @Operation(summary = "Get staff's revenue statistics", description = "Retrieve revenue statistics including total revenue, monthly revenue, and breakdown by course. Staff can only view their own revenue, admins can view any staff's revenue.")
        @GetMapping("/{id}/revenue")
        @ApiMessage("Get staff's revenue")
        @StaffOrAdmin
        public ResponseEntity<StaffRevenueResponse> getStaffRevenue(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id) {
                log.info("GET /api/v1/staff/{}/revenue", id);
                StaffRevenueResponse response = staffService.getStaffRevenue(id);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Get staff's statistics", description = "Retrieve overall statistics including course count, student count, average rating, and total reviews. Staff can view their own stats, admins can view any staff's stats.")
        @GetMapping("/{id}/stats")
        @ApiMessage("Get staff's statistics")
        @StaffOrAdmin
        public ResponseEntity<StaffStatsResponse> getStaffStats(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id) {
                log.info("GET /api/v1/staff/{}/stats", id);
                StaffStatsResponse response = staffService.getStaffStats(id);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Delete staff", description = "Soft delete a staff account by setting it to DEACTIVATED status. Only accessible by admins.")
        @DeleteMapping("/{id}")
        @ApiMessage("Delete staff")
        @AdminOnly
        public ResponseEntity<Void> deleteStaff(
                        @Parameter(description = "Staff ID", required = true, example = "1") @PathVariable Long id,
                        HttpServletRequest request) {
                log.info("DELETE /api/v1/staff/{}", id);
                String ipAddress = request.getRemoteAddr();
                staffService.deleteStaff(id, ipAddress);
                return ResponseEntity.noContent().build();
        }
}
