package com.carevia.service;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.RefreshToken;
import com.carevia.core.domain.Client;
import com.carevia.core.domain.Staff;
import com.carevia.core.repository.RefreshTokenRepository;
import com.carevia.core.repository.ClientRepository;
import com.carevia.core.repository.StaffRepository;
import com.carevia.shared.dto.request.auth.ReqRefreshTokenDTO;
import com.carevia.shared.dto.response.auth.ResLoginDTO;
import com.carevia.shared.exception.InvalidTokenException;
import com.carevia.shared.exception.UserNotActivatedException;
import com.carevia.shared.mapper.AccountMapper;
import com.carevia.shared.util.SecurityUtils;
import com.carevia.shared.util.TokenHashUtil;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final ClientRepository clientRepository;
    private final StaffRepository staffRepository;
    private final SecurityUtils securityUtils;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               ClientRepository clientRepository,
                               StaffRepository staffRepository,
                               SecurityUtils securityUtils) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.clientRepository = clientRepository;
        this.staffRepository = staffRepository;
        this.securityUtils = securityUtils;
    }

    /**
     * Refresh an expired access token using a valid refresh token.
     * - Validate and rotate the refresh token.
     * - Generate a new access token.
     */
    @Transactional
    public ResLoginDTO refreshAccessToken(ReqRefreshTokenDTO reqRefreshTokenDTO) {
        Instant now = Instant.now();

        // Hash the incoming refresh token and find it in database
        String tokenHash = TokenHashUtil.hashToken(reqRefreshTokenDTO.getRefreshToken());
        RefreshToken oldRefreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        // Validate token (throws exception if invalid)
        oldRefreshToken.validate();

        Account accountDB = oldRefreshToken.getAccount();

        // Generate new refresh token plain text
        String newRefreshTokenPlain = securityUtils.createRefreshToken(accountDB.getEmail());

        // Rotate the refresh token (revokes old, creates new)
        RefreshToken newRefreshToken = oldRefreshToken.rotate(
                newRefreshTokenPlain,
                reqRefreshTokenDTO.getIpAddress(),
                securityUtils.getRefreshTokenExpiration()
        );

        // Save both tokens (old is revoked, new is created)
        refreshTokenRepository.save(oldRefreshToken);
        refreshTokenRepository.save(newRefreshToken);

        // Map account to response DTO based on role
        ResLoginDTO resLoginDTO = mapAccountToLoginDTO(accountDB);

        // Generate new access token
        String newAccessToken = securityUtils.createAccessToken(accountDB.getEmail(), resLoginDTO);
        Instant accessTokenExpiresAt = now.plus(securityUtils.getAccessTokenExpiration(), ChronoUnit.SECONDS);

        resLoginDTO.setAccessToken(newAccessToken);
        resLoginDTO.setAccessTokenExpiresAt(accessTokenExpiresAt);
        resLoginDTO.setRefreshToken(newRefreshTokenPlain);
        resLoginDTO.setRefreshTokenExpiresAt(newRefreshToken.getExpiresAt());

        return resLoginDTO;
    }

    /**
     * Revoke an existing refresh token (logout or manual invalidation).
     */
    @Transactional
    public void revokeRefreshToken(String refreshTokenPlain) {
        String tokenHash = TokenHashUtil.hashToken(refreshTokenPlain);

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);
    }

    /**
     * Issue a new refresh token for an account during login.
     */
    @Transactional
    public RefreshToken issueRefreshToken(Account account, String tokenPlain,
                                          String deviceInfo, String ipAddress) {
        RefreshToken refreshToken = RefreshToken.issue(
                account,
                tokenPlain,
                deviceInfo,
                ipAddress,
                securityUtils.getRefreshTokenExpiration()
        );

        return refreshTokenRepository.save(refreshToken);
    }


    /**
     * Helper method to map account to login DTO based on role.
     */
    private ResLoginDTO mapAccountToLoginDTO(Account account) {
        return switch (account.getRole()) {
            case CLIENT -> {
                Client client = clientRepository.findByAccount(account)
                        .orElseThrow(() -> new UserNotActivatedException("Account not activated"));
                yield AccountMapper.clientToResLoginDTO(client);
            }
            case STAFF -> {
                Staff staff = staffRepository.findByAccount(account)
                        .orElseThrow(() -> new UserNotActivatedException("Account not activated"));
                yield AccountMapper.staffToResLoginDTO(staff);
            }
            case ADMIN -> AccountMapper.adminToResLoginDTO(account);
            default -> throw new IllegalStateException("Unexpected role: " + account.getRole());
        };
    }
}

