package com.neobank.backend.Auth;

import com.neobank.backend.DTO.UserRequestDTO;
import com.neobank.backend.Exceptions.UserNotFoundException;
import com.neobank.backend.Mapper.UserMapper;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(AuthRequest request) {
        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));


        if (user.getRole() == null) {
            user.setRole(com.neobank.backend.Model.Role.USER);
        }

        User savedUser = userRepository.save(user);


        String jwtToken = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(jwtToken, UserMapper.toDTO(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Invalid email or password!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UserNotFoundException("Invalid email or password!");
        }


        String jwtToken = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(jwtToken, UserMapper.toDTO(user));
    }
}
