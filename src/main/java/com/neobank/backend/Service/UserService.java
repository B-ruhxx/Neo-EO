package com.neobank.backend.Service;

import com.neobank.backend.DTO.UserRequestDTO;
import com.neobank.backend.DTO.UserResponseDTO;
import com.neobank.backend.Model.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


public interface UserService {
        UserResponseDTO createUser(UserRequestDTO userRequestDTO);
        UserResponseDTO getUserById(Long id);
        UserResponseDTO getUserByEmail(String email);  // FIXED
        List<UserResponseDTO> getAllUsers();
        UserResponseDTO updateUser(Long id, UserRequestDTO userRequestDTO);  // FIXED
        void deleteUser(Long id);
        UserResponseDTO freezeUser(Long id);
        UserResponseDTO unfreezeUser(Long id);
        User getUserEntityByEmail(String email);
        List<com.neobank.backend.DTO.UserSummaryDTO> searchUsers(String query);
        List<com.neobank.backend.DTO.UserSummaryDTO> getFrequentContacts(String userEmail);
    }
