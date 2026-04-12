package com.carevia.shared.constant;

import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * User roles in the LMS system
 */
@Schema(description = "User roles")
public enum Role {
    @Schema(description = "Client role - Can access client-specific features")
    CLIENT,

    @Schema(description = "Staff role - Can manage courses and assist clients")
    STAFF,

    @Schema(description = "Administrator role - Full system access")
    ADMIN;

    /**
     * Create Role from string value (case-insensitive)
     * @param value Role name as string
     * @return Role enum
     * @throws IllegalArgumentException if value is invalid
     */
    @JsonCreator
    public static Role fromString(String value) {
        for (Role role : Role.values()) {
            if (role.name().equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role value: " + value);
    }
}
