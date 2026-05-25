package com.carevia.controller.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.net.URI;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.carevia.core.domain.Account;
import com.carevia.service.AuthService;
import com.carevia.service.EmailVerificationService;
import com.carevia.service.RefreshTokenService;
import com.carevia.shared.annotation.ApiMessage;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.dto.request.auth.ChangePasswordDTO;
import com.carevia.shared.dto.request.auth.ForgotPasswordDTO;
import com.carevia.shared.dto.request.auth.ReqLoginDTO;
import com.carevia.shared.dto.request.auth.ReqRefreshTokenDTO;
import com.carevia.shared.dto.request.auth.RegisterRequest;
import com.carevia.shared.dto.request.auth.ResendVerifyEmailRequest;
import com.carevia.shared.dto.request.auth.ResetPasswordDTO;
import com.carevia.shared.dto.response.auth.MeResponse;
import com.carevia.shared.dto.response.auth.RegisterResponse;
import com.carevia.shared.dto.response.auth.ResLoginDTO;
import com.carevia.shared.mapper.AccountMapper;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "APIs for user authentication, registration, and password management")
public class PublicAuthController {

    private static final Logger log = LoggerFactory.getLogger(PublicAuthController.class);

    @Value("${app.avatar.default-url}")
    private String defaultAvatarUrl;

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final RefreshTokenService refreshTokenService;

    public PublicAuthController(AuthService authService,
                    PasswordEncoder passwordEncoder,
                    EmailVerificationService emailVerificationService,
                    RefreshTokenService refreshTokenService) {
            this.authService = authService;
            this.passwordEncoder = passwordEncoder;
            this.emailVerificationService = emailVerificationService;
            this.refreshTokenService = refreshTokenService;
    }

    @Operation(summary = "Register a new account", description = "Register a new client or staff account. An email verification link will be sent to the provided email address.")
    @PostMapping("/register")
    @ApiMessage("Register new account")
    public ResponseEntity<RegisterResponse> registerAccount(
                    @Parameter(description = "Registration details including email, username, password, and role", required = true) @Valid @RequestBody RegisterRequest accountRequest) {
            log.info("Received registration request for email: {}", accountRequest.getEmail());

            Account account = AccountMapper.toEntity(accountRequest);
            account.setAvatarUrl(defaultAvatarUrl);
            account.setPasswordHash(this.passwordEncoder.encode(accountRequest.getPassword()));

            Account accountDB = this.authService.registerAccount(account, accountRequest);
            RegisterResponse response = AccountMapper.toResponse(accountDB);

            log.info("Account registered successfully for username: {}", accountDB.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Verify email address", description = "Verify user's email using the token received via email. This activates client accounts or sets staff accounts to pending approval.")
    @GetMapping("/verify-email")
    @ApiMessage("Verify user email")
    public ResponseEntity<Void> verifyEmail(
                    @Parameter(description = "Email verification token", required = true) @RequestParam("token") String token) {
            log.debug("Verifying email token: {}", token);
            this.emailVerificationService.verifyToken(token);
            log.info("Email verification succeeded for token: {}", token);
            return ResponseEntity.status(HttpStatus.FOUND)
                            .location(URI.create("http://localhost:3000/auth/signin?verified=true"))
                            .build();
    }

    @PostMapping("/signin")
    @ApiMessage("Login to the system")
    public ResponseEntity<ResLoginDTO> login(
                    @Valid @RequestBody ReqLoginDTO reqLoginDTO,
                    HttpServletRequest request) {

            log.info("Login attempt for user: {}", reqLoginDTO.getLogin());

            String clientIp = request.getHeader("X-Forwarded-For");
            if (clientIp == null)
                    clientIp = request.getRemoteAddr();
            reqLoginDTO.setIpAddress(clientIp);

            ResLoginDTO res = this.authService.login(reqLoginDTO);
            log.info("Login successful for user: {}", reqLoginDTO.getLogin());
            return ResponseEntity.ok(res);
    }

    @Operation(summary = "Refresh access token", description = "Generate a new access token using a valid refresh token. The old refresh token will be revoked and a new one issued.")
    @PostMapping("/refresh")
    @ApiMessage("Refresh access token using refresh token")
    public ResponseEntity<ResLoginDTO> refreshAccessToken(
                    @Parameter(description = "Refresh token details", required = true) @Valid @RequestBody ReqRefreshTokenDTO reqRefreshTokenDTO,
                    HttpServletRequest request) {
            String clientIp = request.getHeader("X-Forwarded-For");
            if (clientIp == null)
                    clientIp = request.getRemoteAddr();

            reqRefreshTokenDTO.setIpAddress(clientIp);
            ResLoginDTO response = refreshTokenService.refreshAccessToken(reqRefreshTokenDTO);
            return ResponseEntity.ok(response);
    }

    @Operation(summary = "Logout from the system", description = "Revoke the refresh token to logout. This invalidates the refresh token and prevents it from being used again.")
    @PostMapping("/logout")
    @ApiMessage("Logout and revoke refresh token")
    public ResponseEntity<Void> logout(
                    @Parameter(description = "Refresh token to revoke", required = true) @Valid @RequestBody ReqRefreshTokenDTO request) {
            refreshTokenService.revokeRefreshToken(request.getRefreshToken());
            return ResponseEntity.ok(null);
    }

    @Operation(summary = "Request password reset", description = "Send a password reset link to the user's email address. If the email exists, a reset link will be sent.")
    @PostMapping("/password/forgot")
    @ApiMessage("Request password reset via email")
    public ResponseEntity<Void> forgotPassword(
                    @Parameter(description = "Email address to send password reset link", required = true) @Valid @RequestBody ForgotPasswordDTO forgotPasswordDTO) {
            log.info("Received password reset request for email: {}", forgotPasswordDTO.getEmail());
            this.authService.forgotPassword(forgotPasswordDTO.getEmail());
            log.info("Password reset email sent to: {}", forgotPasswordDTO.getEmail());
            return ResponseEntity.ok(null);
    }

    @Operation(summary = "Reset password", description = "Reset user password using the token received via email. The token is single-use and expires after 30 minutes.")
    @PostMapping("/password/reset")
    @ApiMessage("Reset password using reset token")
    public ResponseEntity<Void> resetPassword(
                    @Parameter(description = "Password reset token from email", required = true) @RequestParam("token") String token,
                    @Parameter(description = "New password", required = true) @Valid @RequestBody ResetPasswordDTO resetPasswordDTO) {
            log.info("Received password reset submission for token: {}", token);
            this.authService.resetPassword(token, resetPasswordDTO.getNewPassword());
            log.info("Password reset successful for token: {}", token);
            return ResponseEntity.ok(null);
    }

    @Operation(summary = "Get current user information", description = "Retrieve detailed information about the currently authenticated user including profile and role-specific data.")
    @GetMapping("/me")
    @ApiMessage("Get current logged-in user info")
    @SecurityRequirement(name = "bearerAuth")
    @Authenticated
    public ResponseEntity<MeResponse> getCurrentUserInfo() {
            MeResponse userInfo = authService.getCurrentUserInfo();
            return ResponseEntity.ok(userInfo);
    }

    @Operation(summary = "Change password", description = "Change the password for the currently authenticated user. Requires the old password for verification.")
    @PutMapping("/password/change")
    @ApiMessage("Change password for logged-in user")
    @SecurityRequirement(name = "bearerAuth")
    @Authenticated
    public ResponseEntity<Void> changePassword(
                    @Parameter(description = "Old and new password details", required = true) @Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
            log.info("Received password change request for user");
            this.authService.changePassword(changePasswordDTO);
            log.info("Password change successful for user");
            return ResponseEntity.ok(null);
    }

    @Operation(summary = "Resend email verification link", description = "Resend the email verification link to the specified email address.")
    @PostMapping("/resend-verification")
    @ApiMessage("Resend email verification link")
    public ResponseEntity<Void> resendVerificationEmail(
                    @Parameter(description = "Email address to resend verification link", required = true) @Valid @RequestBody ResendVerifyEmailRequest request) {

            String email = request.getEmail();
            log.info("Resend verification email request for: {}", email);
            this.authService.resendVerificationEmail(email);
            log.info("Verification email resent to: {}", email);
            return ResponseEntity.ok(null);
    }
}