package com.neobank.backend;


import com.neobank.backend.Auth.AuthRequest;
import com.neobank.backend.Auth.AuthResponse;
import com.neobank.backend.Auth.AuthService;
import com.neobank.backend.Auth.LoginRequest;
import com.neobank.backend.Exceptions.UserNotFoundException;
import com.neobank.backend.Model.Role;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Security.CustomUserDetailService;
import com.neobank.backend.Security.JwtService;
import com.neobank.backend.Mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthServiceTests {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;


    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtService = mock(JwtService.class);
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void testRegister_shouldSaveUserAndReturnToken() {
        AuthRequest request = new AuthRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setEmail("jane@example.com");
        request.setPassword("password123");

        User mappedUser = UserMapper.toEntity(request);
        mappedUser.setId(1L);
        mappedUser.setRole(Role.USER); // Explicitly setting role to prevent NPE

        when(passwordEncoder.encode("password123")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(mappedUser);
        when(jwtService.generateToken("jane@example.com", "USER")).thenReturn("mock-jwt");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt", response.getJwtToken());
        assertEquals("jane@example.com", response.getUser().getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testLogin_shouldReturnTokenAndUser() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("pass123");

        User user = User.builder()
                .id(1L)
                .email("john@example.com")
                .password("encodedPass")
                .firstName("John")
                .role(Role.USER)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "encodedPass")).thenReturn(true);
        when(jwtService.generateToken("john@example.com", "USER")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getJwtToken());
        assertEquals("john@example.com", response.getUser().getEmail());
    }

    @Test
    void testLogin_withInvalidEmail_shouldThrow() {
        LoginRequest request = new LoginRequest();
        request.setEmail("notfound@example.com");
        request.setPassword("irrelevant");

        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.login(request));
    }

    @Test
    void testLogin_withWrongPassword_shouldThrow() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("wrongpass");

        User user = User.builder()
                .id(1L)
                .email("john@example.com")
                .password("encodedCorrectPass")
                .role(Role.USER)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "encodedCorrectPass")).thenReturn(false);

        assertThrows(UserNotFoundException.class, () -> authService.login(request));
    }


}

