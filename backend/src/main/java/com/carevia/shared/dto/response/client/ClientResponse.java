package com.carevia.shared.dto.response.client;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.carevia.shared.constant.AccountStatus;
import com.carevia.shared.constant.Gender;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Client information response")
public class ClientResponse {

    @Schema(description = "Client ID", example = "1")
    private Long id;

    @Schema(description = "Client code", example = "CL2024001")
    private String clientCode;

    @Schema(description = "Client full name", example = "Nguyen Van A")
    private String fullName;

    @Schema(description = "Client email", example = "client@example.com")
    private String email;

    @Schema(description = "Client phone", example = "0123456789")
    private String phone;

    @Schema(description = "Client birth date", example = "2000-01-01")
    private LocalDate birthDate;

    @Schema(description = "Client gender", example = "MALE")
    private Gender gender;

    @Schema(description = "Client biography")
    private String bio;

    @Schema(description = "Avatar URL")
    private String avatarUrl;

    @Schema(description = "Account status", example = "ACTIVE")
    private AccountStatus accountStatus;

    @Schema(description = "Creation timestamp")
    private Instant createdAt;

    @Schema(description = "Last update timestamp")
    private Instant updatedAt;
}

