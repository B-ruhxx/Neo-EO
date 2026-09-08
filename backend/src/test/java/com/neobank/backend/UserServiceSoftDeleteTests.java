package com.neobank.backend;

import com.neobank.backend.Model.Role;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Service.UserServiceImplementation;
import com.neobank.backend.Exceptions.UserNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

public class UserServiceSoftDeleteTests {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImplementation userService;

    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder()
                .id(1L)
                .email("test@bank.com")
                .password("pass")
                .status("ACTIVE")
                .deleted(false)
                .role(Role.USER)
                .build();
    }

    @Test
    void testFreezeUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.freezeUser(1L);

        assertThat(user.getStatus()).isEqualTo("FROZEN");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testUnfreezeUser() {
        user.setStatus("FROZEN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.unfreezeUser(1L);

        assertThat(user.getStatus()).isEqualTo("ACTIVE");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testSoftDeleteUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        doAnswer(invocation -> {
            user.setDeleted(true);
            return null;
        }).when(userRepository).delete(user);

        userRepository.delete(user);

        assertThat(user.getDeleted()).isTrue();
        verify(userRepository, times(1)).delete(user);
    }

    @Test
    void testFreezeNonExistingUserThrows() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.freezeUser(99L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("User not found");
    }
}
