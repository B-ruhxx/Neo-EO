package com.neobank.backend.Service;

import com.neobank.backend.DTO.UserRequestDTO;
import com.neobank.backend.DTO.UserResponseDTO;
import com.neobank.backend.Exceptions.UserNotFoundException;
import com.neobank.backend.Mapper.UserMapper;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.DTO.UserSummaryDTO;
import com.neobank.backend.Repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class UserServiceImplementation implements UserService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public UserServiceImplementation(UserRepository userRepository) {
        this(userRepository, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public UserServiceImplementation(UserRepository userRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public UserResponseDTO createUser(UserRequestDTO userRequestDTO) {
      User user= UserMapper.toEntity(userRequestDTO);
      User savedUser = userRepository.save(user);
      return UserMapper.toDTO(savedUser);
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + id + " not found"));
        return UserMapper.toDTO(user);
    }



    @Override
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));
        return UserMapper.toDTO(user);
    }



    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findByDeletedFalse().stream()
                .map(UserMapper::toDTO)
                .toList();
    }



    @Override
    public UserResponseDTO updateUser(Long id, UserRequestDTO updateUser) {
        return userRepository.findById(id).map(existingUser -> {
            existingUser.setFirstName(updateUser.getFirstName());
            existingUser.setLastName(updateUser.getLastName());
            existingUser.setEmail(updateUser.getEmail());
            if (updateUser.getPassword() != null && !updateUser.getPassword().isBlank()) {
                existingUser.setPassword(updateUser.getPassword());
            }
            existingUser.setPhoneNumber(updateUser.getPhoneNumber());
            existingUser.setAddress(updateUser.getAddress());
            existingUser.setCity(updateUser.getCity());
            existingUser.setPostalCode(updateUser.getPostalCode());
            existingUser.setCountry(updateUser.getCountry());
            return UserMapper.toDTO(userRepository.save(existingUser));
        }).orElseThrow(() -> new UserNotFoundException("User with ID " + id + " not found"));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setDeleted(true); // Soft delete
        userRepository.save(user);
    }



    @Transactional
    public UserResponseDTO freezeUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setStatus("FROZEN");
        userRepository.save(user);
        return UserMapper.toDTO(user);
    }

    @Transactional
    public UserResponseDTO unfreezeUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setStatus("ACTIVE");
        userRepository.save(user);
        return UserMapper.toDTO(user);
    }

    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<UserSummaryDTO> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.searchUsers(query.trim()).stream()
                .map(u -> new UserSummaryDTO(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail()))
                .toList();
    }

    @Override
    public List<UserSummaryDTO> getFrequentContacts(String userEmail) {
        if (transactionRepository == null) {
            return List.of();
        }
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        return transactionRepository.findDistinctRecipientsByUser(user).stream()
                .map(u -> new UserSummaryDTO(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail()))
                .toList();
    }

}
