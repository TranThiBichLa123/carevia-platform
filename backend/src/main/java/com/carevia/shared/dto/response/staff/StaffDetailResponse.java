package com.carevia.shared.dto.response.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.carevia.shared.constant.AccountStatus;
import com.carevia.shared.constant.Gender;
import com.carevia.shared.constant.Role;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Staff detailed information response (includes sensitive fields for admin)")
public class StaffDetailResponse {

    @Schema(description = "Staff ID", example = "1")
    private Long id;

    @Schema(description = "Account ID", example = "10")
    private Long accountId;

    @Schema(description = "Staff code", example = "NV2024001")
    private String staffCode;

    @Schema(description = "Full name", example = "Nguyen Van A")
    private String fullName;

    @Schema(description = "Email address", example = "staff@example.com")
    private String email;

    @Schema(description = "Username", example = "staff_username")
    private String username;

    @Schema(description = "Phone number", example = "0901234567")
    private String phone;

    @Schema(description = "Birth date", example = "1990-01-01")
    private LocalDate birthDate;

    @Schema(description = "Gender", example = "MALE")
    private Gender gender;

    @Schema(description = "Biography")
    private String bio;

    @Schema(description = "Specialty/Expertise", example = "Software Engineering")
    private String specialty;

    @Schema(description = "Academic degree", example = "Master of Science")
    private String degree;

    @Schema(description = "Avatar URL")
    private String avatarUrl;

    @Schema(description = "Whether staff is approved", example = "true")
    private boolean approved;

    @Schema(description = "ID of admin who approved", example = "5")
    private Long approvedBy;

    @Schema(description = "Approval timestamp")
    private Instant approvedAt;

    @Schema(description = "Rejection reason (if rejected)")
    private String rejectReason;

    @Schema(description = "Account status", example = "ACTIVE")
    private AccountStatus accountStatus;

    @Schema(description = "Account role", example = "STAFF")
    private Role role;

    @Schema(description = "Last login timestamp")
    private Instant lastLoginAt;

    @Schema(description = "Created at timestamp")
    private Instant createdAt;

    @Schema(description = "Updated at timestamp")
    private Instant updatedAt;
}

