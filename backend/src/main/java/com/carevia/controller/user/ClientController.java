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
import com.carevia.service.ClientService;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.client.*;
import com.carevia.shared.dto.response.client.*;
import com.carevia.shared.dto.response.account.UploadAvatarResponse;
import com.carevia.shared.annotation.ApiMessage;
import com.carevia.shared.annotation.ClientOrAdmin;
import com.carevia.shared.annotation.ClientOrStaff;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/clients")
@Tag(name = "Client Management", description = "APIs for managing client information and activities")
@SecurityRequirement(name = "bearerAuth")
public class ClientController {

    private static final Logger log = LoggerFactory.getLogger(ClientController.class);
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @Operation(
            summary = "Get client by ID",
            description = "Retrieve detailed information about a client by their ID. Clients can only view their own profile, staff can view clients in their care, and admins can view any client."
    )
    @GetMapping("/{id}")
    @ApiMessage("Get client by ID")
    @ClientOrStaff
    public ResponseEntity<ClientDetailResponse> getClientById(
            @Parameter(description = "Client ID", required = true, example = "1")
            @PathVariable Long id
    ) {
        log.info("GET /api/v1/clients/{}", id);
        ClientDetailResponse response = clientService.getClientById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get client by code",
            description = "Retrieve detailed information about a client by their client code. Clients can only view their own profile, staff can view clients in their care, and admins can view any client."
    )
    @GetMapping("/code/{code}")
    @ApiMessage("Get client by code")
    @ClientOrStaff
    public ResponseEntity<ClientDetailResponse> getClientByCode(
            @Parameter(description = "Client code", required = true, example = "CL2024001")
            @PathVariable String code
    ) {
        log.info("GET /api/v1/clients/code/{}", code);
        ClientDetailResponse response = clientService.getClientByCode(code);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update client information",
            description = "Update client profile information. Clients can only update their own profile, admins can update any client."
    )
    @PutMapping("/{id}")
    @ApiMessage("Update client information")
    @ClientOrAdmin
    public ResponseEntity<ClientDetailResponse> updateClient(
            @Parameter(description = "Client ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(description = "Updated client information", required = true)
            @Valid @RequestBody UpdateClientRequest request
    ) {
        log.info("PUT /api/v1/clients/{}", id);
        ClientDetailResponse response = clientService.updateClient(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Upload client avatar",
            description = "Upload a new avatar image for a client. Clients can only upload their own avatar. Accepts JPG, PNG, and WEBP formats."
    )
    @PutMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiMessage("Upload client avatar")
    @ClientOrAdmin
    public ResponseEntity<UploadAvatarResponse> uploadAvatar(
            @Parameter(description = "Client ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(description = "Avatar image file (JPG, PNG, WEBP)", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        log.info("PUT /api/v1/clients/{}/avatar", id);
        UploadAvatarResponse response = clientService.uploadClientAvatar(id, file);
        return ResponseEntity.ok(response);
    }



    @Operation(
            summary = "Delete client (Admin only)",
            description = "Soft delete a client account by setting its status to DEACTIVATED. This action is reversible. Only accessible by administrators."
    )
    @DeleteMapping("/{id}")
    @ApiMessage("Delete client (Admin only)")
    public ResponseEntity<Void> deleteClient(
            @Parameter(description = "Client ID to delete", required = true, example = "1")
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        log.info("DELETE /api/v1/clients/{}", id);
        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .orElse(request.getRemoteAddr());
        clientService.deleteClient(id, ip);
        return ResponseEntity.noContent().build();
    }
}
