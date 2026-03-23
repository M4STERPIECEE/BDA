package com.bda.bda.dto.response;

public record AuthResponse(
        String token,
        String username,
        String role
) {}