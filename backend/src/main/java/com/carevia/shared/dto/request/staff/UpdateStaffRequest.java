package com.carevia.shared.dto.request.staff;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.carevia.shared.constant.Gender;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update staff information")
public class UpdateStaffRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
    @Schema(description = "Staff full name", example = "Nguyen Van A")
    private String fullName;

    @Past(message = "Birth date must be in the past")
    @Schema(description = "Staff birth date", example = "1990-01-01")
    private LocalDate birthDate;

    @Schema(description = "Staff gender", example = "MALE")
    private Gender gender;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    @Schema(description = "Staff phone number", example = "0901234567")
    private String phone;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    @Schema(description = "Staff biography", example = "Experienced software engineer and educator")
    private String bio;

    @Size(max = 255, message = "Specialty must not exceed 255 characters")
    @Schema(description = "Staff specialty/expertise", example = "Software Engineering, Data Science")
    private String specialty;

    @Size(max = 128, message = "Degree must not exceed 128 characters")
    @Schema(description = "Staff academic degree", example = "Master of Science in Computer Science")
    private String degree;

    @Size(max = 50, message = "Staff code must not exceed 50 characters")
    @Schema(description = "Staff code", example = "GV2024001")
    private String staffCode;
}

