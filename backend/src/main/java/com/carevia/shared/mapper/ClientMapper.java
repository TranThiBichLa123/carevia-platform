package com.carevia.shared.mapper;

import com.carevia.core.domain.Client;
import com.carevia.shared.dto.response.account.AccountProfileResponse;
import com.carevia.shared.dto.response.client.ClientDetailResponse;
import com.carevia.shared.dto.response.client.ClientResponse;

public class ClientMapper {

    public static AccountProfileResponse.Profile toProfileResponse(Client client) {
        return AccountProfileResponse.Profile.builder()
                .clientId(client.getId())
                .clientCode(client.getClientCode())
                .fullName(client.getFullName())
                .phone(client.getPhone())
                .birthDate(client.getBirthDate())
                .bio(client.getBio())
                .gender(client.getGender())
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .build();
    }

    public static ClientResponse toClientResponse(Client client) {
        return ClientResponse.builder()
                .id(client.getId())
                .clientCode(client.getClientCode())
                .fullName(client.getFullName())
                .email(client.getAccount() != null ? client.getAccount().getEmail() : null)
                .phone(client.getPhone())
                .birthDate(client.getBirthDate())
                .gender(client.getGender())
                .bio(client.getBio())
                .avatarUrl(client.getAccount() != null ? client.getAccount().getAvatarUrl() : null)
                .accountStatus(client.getAccount() != null ? client.getAccount().getStatus() : null)
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .build();
    }

    public static ClientDetailResponse toClientDetailResponse(Client client) {
        return ClientDetailResponse.builder()
                .id(client.getId())
                .clientCode(client.getClientCode())
                .fullName(client.getFullName())
                .email(client.getAccount() != null ? client.getAccount().getEmail() : null)
                .username(client.getAccount() != null ? client.getAccount().getUsername() : null)
                .phone(client.getPhone())
                .birthDate(client.getBirthDate())
                .gender(client.getGender())
                .bio(client.getBio())
                .avatarUrl(client.getAccount() != null ? client.getAccount().getAvatarUrl() : null)
                .accountStatus(client.getAccount() != null ? client.getAccount().getStatus() : null)
                .role(client.getAccount() != null ? client.getAccount().getRole() : null)
                .lastLoginAt(client.getAccount() != null ? client.getAccount().getLastLoginAt() : null)
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .accountId(client.getAccount() != null ? client.getAccount().getId() : null)
                .build();
    }
}

