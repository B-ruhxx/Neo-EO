package com.neobank.backend.Auth;

import com.neobank.backend.DTO.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String jwtToken;
    private UserResponseDTO user;
}
