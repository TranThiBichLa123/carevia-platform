package com.carevia.shared.mapper;


import com.carevia.core.domain.Account;
import com.carevia.core.domain.Client;
import com.carevia.core.domain.Staff;
import com.carevia.shared.constant.AccountStatus;
import com.carevia.shared.dto.request.auth.RegisterRequest;
import com.carevia.shared.dto.response.auth.RegisterResponse;
import com.carevia.shared.dto.response.auth.ResLoginDTO;
import com.carevia.shared.dto.response.account.AccountProfileResponse;
import com.carevia.shared.dto.response.account.AccountResponse;


public class AccountMapper {

    public static Account toEntity(RegisterRequest registerRequest) {
        return Account.builder()
                .email(registerRequest.getEmail())
                .role(registerRequest.getRole())
                .username(registerRequest.getUsername())
                .passwordHash(registerRequest.getPassword())
                .status(AccountStatus.PENDING_EMAIL)
                .langKey(registerRequest.getLangKey() != null ? registerRequest.getLangKey() : "en")
                .build();
    }

    public static RegisterResponse toResponse(Account account) {
        return RegisterResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .username(account.getUsername())
                .role(account.getRole())
                .status(account.getStatus())
                .avatarUrl(account.getAvatarUrl())
                .createdAt(account.getCreatedAt())
                .langKey(account.getLangKey())
                .build();
    }

    public static ResLoginDTO clientToResLoginDTO(Client client) {
        return ResLoginDTO.builder()
                .user(ResLoginDTO.UserInfo.builder()
                        .id(client.getAccount().getId())
                        .username(client.getAccount().getUsername())
                        .email(client.getAccount().getEmail())
                        .role(client.getAccount().getRole())
                        .fullName(client.getFullName())
                        .avatarUrl(client.getAccount().getAvatarUrl())
                        .langKey(client.getAccount().getLangKey())
                        .build())
                .build();
    }

    public static ResLoginDTO staffToResLoginDTO(Staff staff) {
        return ResLoginDTO.builder()
                .user(ResLoginDTO.UserInfo.builder()
                        .id(staff.getAccount().getId())
                        .username(staff.getAccount().getUsername())
                        .email(staff.getAccount().getEmail())
                        .role(staff.getAccount().getRole())
                        .avatarUrl(staff.getAccount().getAvatarUrl())
                        .fullName(staff.getFullName())
                        .langKey(staff.getAccount().getLangKey())
                        .build())
                .build();
    }

    public static ResLoginDTO adminToResLoginDTO( Account admin) {
        return ResLoginDTO.builder()
                .user(ResLoginDTO.UserInfo.builder()
                        .id(admin.getId())
                        .username(admin.getUsername())
                        .email(admin.getEmail())
                        .role(admin.getRole())
                        .avatarUrl(admin.getAvatarUrl())
                        .langKey(admin.getLangKey())
                        .build())
                .build();
    }

    public static AccountProfileResponse toProfileResponse(Account account, AccountProfileResponse.Profile profile) {
        return AccountProfileResponse.builder()
                .accountId(account.getId())
                .lastLoginAt(account.getLastLoginAt())
                .email(account.getEmail())
                .username(account.getUsername())
                .role(account.getRole())
                .status(account.getStatus())
                .avatarUrl(account.getAvatarUrl())
                .profile(profile)
                .build();
    }

    public static AccountResponse toAccountResponse(Account account) {
        return AccountResponse.builder()
                .accountId(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .role(account.getRole())
                .status(account.getStatus())
                .avatarUrl(account.getAvatarUrl())
                .lastLoginAt(account.getLastLoginAt())
                .createdAt(account.getCreatedAt())
                .build();
    }


}

