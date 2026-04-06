package com.bda.bda.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Role is required")
        @Pattern(regexp = "ADMIN|ETUDIANT|GESTIONNAIRE", message = "Role must be ADMIN, ETUDIANT or GESTIONNAIRE")
        String role
) {}