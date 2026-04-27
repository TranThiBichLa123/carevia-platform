package com.carevia.shared.dto.request.account;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating or updating a shipping address")
public class UpsertAddressRequest {

    @NotBlank(message = "Vui lòng nhập số nhà")
    @Size(max = 255, message = "Số nhà không được quá 255 ký tự")
    @Schema(description = "Street address", example = "123 Nguyễn Trãi")
    private String street;

    @NotBlank(message = "Vui lòng nhập xã/phường")
    @Size(max = 120, message = "Xã/Phường không được quá 120 ký tự")
    @Schema(description = "Ward", example = "Phường Bến Thành")
    private String ward;

    @NotBlank(message = "Vui lòng nhập quận/huyện")
    @Size(max = 120, message = "Quận/Huyện không được quá 120 ký tự")
    @Schema(description = "District", example = "Quận 1")
    private String district;

    @NotBlank(message = "Vui lòng nhập tỉnh/thành phố")
    @Size(max = 120, message = "Tỉnh/Thành phố không được quá 120 ký tự")
    @Schema(description = "City or province", example = "Hồ Chí Minh")
    private String city;

    @Schema(description = "Whether this address is the default shipping address", example = "false")
    private Boolean isDefault = false;
}
