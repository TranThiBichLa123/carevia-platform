package com.carevia.shared.dto.response.auth;

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
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO for current user profile information")
public class MeResponse {

    @Schema(description = "Account ID", example = "123")
    private Long accountId;

    @Schema(description = "Username", example = "john_doe")
    private String username;

    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Full name", example = "John Doe")
    private String fullName;

    @Schema(description = "Account status", example = "ACTIVE")
    private AccountStatus status;

    @Schema(description = "Avatar URL", example = "https://example.com/avatars/john.jpg")
    private String avatarUrl;

    @Schema(description = "User role", example = "STUDENT")
    private Role role;

    @Schema(description = "Birthday", example = "1990-01-15")
    private LocalDate birthday;

    @Schema(description = "Biography", example = "Software developer passionate about learning")
    private String bio;

    @Schema(description = "Gender", example = "MALE")
    private Gender gender;

    @Schema(description = "Phone number", example = "0901234567")
    private String phone;

    @Schema(description = "Default shipping address", example = "123 Nguyen Trai, Ho Chi Minh, Vietnam 700000")
    private String address;

    @Schema(description = "Client code", example = "CL2024001")
    private String clientCode;

    @Schema(description = "Loyalty points", example = "100")
    private Integer loyaltyPoints;

    @Schema(description = "Membership level", example = "BASIC")
    private String membershipLevel;

    @Schema(description = "Skin type", example = "Da nhạy cảm")
    private String skinType;

    @Schema(description = "Skin concerns", example = "mụn, thâm")
    private String skinConcerns;

    @Schema(description = "Saved shipping addresses")
    private List<AddressInfo> addresses;

    @Schema(description = "Last login timestamp", example = "2025-11-30T10:15:30Z")
    private Instant lastLoginAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Shipping address info for current user")
    public static class AddressInfo {
        @Schema(description = "Address ID", example = "1")
        private Long id;

        @Schema(description = "Street address", example = "123 Nguyen Trai")
        private String street;

        // --- THÊM MỚI ---
        @Schema(description = "Ward", example = "Phường 1")
        private String ward;

        @Schema(description = "District", example = "Quận 1")
        private String district;
        // ----------------

        @Schema(description = "City or province", example = "Ho Chi Minh")
        private String city;

        // ĐÃ XÓA country và postalCode theo yêu cầu của bạn

        @Schema(description = "Whether this is the default address", example = "true")
        private Boolean isDefault;
    }
}
