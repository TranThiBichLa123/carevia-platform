package com.carevia.controller.system;

import com.carevia.service.SystemSettingService;
import com.carevia.shared.annotation.AdminOnly;
import com.carevia.shared.dto.request.system.UpdateBusinessSettingsRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "System Settings", description = "Business information settings APIs")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    public SystemSettingController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }

    @GetMapping("/api/v1/system-settings/business-info")
    @Operation(summary = "Get public business information settings")
    public ResponseEntity<?> getBusinessSettings() {
        return ResponseEntity.ok(systemSettingService.getBusinessSettings());
    }

    @PutMapping("/api/v1/admin/system-settings/business-info")
    @AdminOnly
    @Operation(summary = "Update public business information settings")
    public ResponseEntity<?> updateBusinessSettings(@Valid @RequestBody UpdateBusinessSettingsRequest request) {
        return ResponseEntity.ok(systemSettingService.updateBusinessSettings(request));
    }
}