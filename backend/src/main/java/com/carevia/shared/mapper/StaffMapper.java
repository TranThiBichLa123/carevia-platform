package com.carevia.shared.mapper;

import com.carevia.core.domain.Staff;
import com.carevia.shared.dto.response.account.AccountProfileResponse;
import com.carevia.shared.dto.response.staff.StaffDetailResponse;
import com.carevia.shared.dto.response.staff.StaffResponse;

public class StaffMapper {

    public static AccountProfileResponse.Profile toProfileResponse(Staff staff) {
        return AccountProfileResponse.Profile.builder()
                .staffId(staff.getId())
                .staffCode(staff.getStaffCode())
                .fullName(staff.getFullName())
                .phone(staff.getPhone())
                .birthDate(staff.getBirthDate())
                .bio(staff.getBio())
                .gender(staff.getGender())
                .specialty(staff.getSpecialty())
                .degree(staff.getDegree())
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .approved(staff.isApproved())
                .approvedBy(staff.getApprovedBy())
                .approvedAt(staff.getApprovedAt())
                .rejectionReason(staff.getRejectReason())
                .build();
    }

    public static StaffResponse toStaffResponse(Staff staff) {
        return StaffResponse.builder()
                .id(staff.getId())
                .staffCode(staff.getStaffCode())
                .fullName(staff.getFullName())
                .email(staff.getAccount() != null ? staff.getAccount().getEmail() : null)
                .phone(staff.getPhone())
                .birthDate(staff.getBirthDate())
                .gender(staff.getGender())
                .bio(staff.getBio())
                .specialty(staff.getSpecialty())
                .degree(staff.getDegree())
                .avatarUrl(staff.getAccount() != null ? staff.getAccount().getAvatarUrl() : null)
                .approved(staff.isApproved())
                .accountStatus(staff.getAccount() != null ? staff.getAccount().getStatus() : null)
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .build();
    }

    public static StaffDetailResponse toStaffDetailResponse(Staff staff) {
        return StaffDetailResponse.builder()
                .id(staff.getId())
                .accountId(staff.getAccount() != null ? staff.getAccount().getId() : null)
                .staffCode(staff.getStaffCode())
                .fullName(staff.getFullName())
                .email(staff.getAccount() != null ? staff.getAccount().getEmail() : null)
                .username(staff.getAccount() != null ? staff.getAccount().getUsername() : null)
                .phone(staff.getPhone())
                .birthDate(staff.getBirthDate())
                .gender(staff.getGender())
                .bio(staff.getBio())
                .specialty(staff.getSpecialty())
                .degree(staff.getDegree())
                .avatarUrl(staff.getAccount() != null ? staff.getAccount().getAvatarUrl() : null)
                .approved(staff.isApproved())
                .approvedBy(staff.getApprovedBy())
                .approvedAt(staff.getApprovedAt())
                .rejectReason(staff.getRejectReason())
                .accountStatus(staff.getAccount() != null ? staff.getAccount().getStatus() : null)
                .role(staff.getAccount() != null ? staff.getAccount().getRole() : null)
                .lastLoginAt(staff.getAccount() != null ? staff.getAccount().getLastLoginAt() : null)
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .build();
    }
}
