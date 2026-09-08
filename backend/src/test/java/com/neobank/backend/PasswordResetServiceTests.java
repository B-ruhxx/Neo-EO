package com.neobank.backend;


import com.neobank.backend.Model.PasswordResetToken;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.PasswordResetTokenRepository;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Service.PasswordResetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class PasswordResetServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPassword("oldPassword");
    }

    @Test
    void shouldCreatePasswordResetToken() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // Act
        String token = passwordResetService.createPasswordResetToken("test@example.com");

        // Assert
        assertThat(token).isNotNull();
        verify(tokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    void shouldThrowWhenUserNotFound() {
        // Arrange
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> passwordResetService.createPasswordResetToken("unknown@example.com"));
    }

    @Test
    void shouldResetPasswordSuccessfully() {
        // Arrange
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token("valid-token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");

        // Act
        passwordResetService.resetPassword("valid-token", "newPassword");

        // Assert
        verify(userRepository).save(testUser);
        verify(tokenRepository).delete(resetToken);
        assertThat(testUser.getPassword()).isEqualTo("encodedPassword");
    }

    @Test
    void shouldThrowWhenTokenExpired() {
        // Arrange
        PasswordResetToken expiredToken = PasswordResetToken.builder()
                .token("expired-token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().minusMinutes(1)) // already expired
                .build();

        when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> passwordResetService.resetPassword("expired-token", "newPassword"));
    }

    @Test
    void shouldThrowWhenTokenNotFound() {
        // Arrange
        when(tokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> passwordResetService.resetPassword("invalid-token", "newPassword"));
    }
}
