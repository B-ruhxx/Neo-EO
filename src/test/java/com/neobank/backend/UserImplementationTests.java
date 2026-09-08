package com.neobank.backend;

import com.neobank.backend.DTO.UserRequestDTO;
import com.neobank.backend.DTO.UserResponseDTO;
import com.neobank.backend.Exceptions.UserNotFoundException;
import com.neobank.backend.Mapper.UserMapper;
import com.neobank.backend.Model.Role;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Service.UserServiceImplementation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserImplementationTests {

    private UserRepository userRepository;
    private UserServiceImplementation userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userService = new UserServiceImplementation(userRepository);
    }

    @Test
    void testGetUserById_whenUserExists() {
        User mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Alex")
                .role(Role.USER)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        UserResponseDTO result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals("Alex", result.getFirstName());
        verify(userRepository).findById(1L);
    }

    @Test
    void testGetUserById_whenUserDoesNotExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById(1L));
        verify(userRepository).findById(1L);
    }

    @Test
    void testCreateUser_shouldReturnSavedUser() {
        UserRequestDTO request = new UserRequestDTO();
        request.setFirstName("New");
        request.setEmail("new@example.com");

        User userEntity = UserMapper.toEntity(request);
        userEntity.setId(1L);
        userEntity.setRole(Role.USER);

        when(userRepository.save(any(User.class))).thenReturn(userEntity);

        UserResponseDTO response = userService.createUser(request);

        assertEquals("New", response.getFirstName());
        assertEquals("new@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testGetAllUsers_shouldReturnList() {
        List<User> users = List.of(
                User.builder().id(1L).email("a@example.com").role(Role.USER).build(),
                User.builder().id(2L).email("b@example.com").role(Role.ADMIN).build()
        );

        when(userRepository.findByDeletedFalse()).thenReturn(users);

        List<UserResponseDTO> result = userService.getAllUsers();

        assertEquals(2, result.size());
        verify(userRepository).findByDeletedFalse();
    }

    @Test
    void testUpdateUser_whenUserExists() {
        User existingUser = User.builder()
                .id(1L)
                .email("old@example.com")
                .firstName("Old")
                .role(Role.USER)
                .build();

        UserRequestDTO updatedDTO = new UserRequestDTO();
        updatedDTO.setEmail("new@example.com");
        updatedDTO.setFirstName("New");

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDTO result = userService.updateUser(1L, updatedDTO);

        assertEquals("New", result.getFirstName());
        assertEquals("new@example.com", result.getEmail());
        verify(userRepository).save(existingUser);
    }

    @Test
    void testDeleteUser_whenExists() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.deleteUser(1L);

        assertTrue(user.getDeleted());
        verify(userRepository).save(user);
    }

    @Test
    void testDeleteUser_whenNotExists_shouldThrow() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.deleteUser(1L));
    }
}
