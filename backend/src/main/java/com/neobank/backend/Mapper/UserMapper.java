package com.neobank.backend.Mapper;

import com.neobank.backend.Auth.AuthRequest;
import com.neobank.backend.DTO.UserRequestDTO;
import com.neobank.backend.DTO.UserResponseDTO;
import com.neobank.backend.Model.Role;
import com.neobank.backend.Model.User;

import java.math.BigDecimal;

public class UserMapper {


        public static User toEntity(UserRequestDTO dto) {
            if (dto == null) return null;

            return User.builder()
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .email(dto.getEmail())
                    .password(dto.getPassword())
                    .phoneNumber(dto.getPhoneNumber())
                    .address(dto.getAddress())
                    .city(dto.getCity())
                    .postalCode(dto.getPostalCode())
                    .country(dto.getCountry())
                    .balance(BigDecimal.ZERO)
                    .build();
        }


    public static UserResponseDTO toDTO(User user) {
        if (user == null) return null;

        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setPostalCode(user.getPostalCode());
        dto.setCountry(user.getCountry());
        dto.setRole(user.getRole().name());
        dto.setIsVerified(user.getIsVerified());


        dto.setBalance(user.getBalance());

        return dto;
    }

    public static User toEntity(AuthRequest request) {
        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.USER)
                .isVerified(false)
                .balance(BigDecimal.ZERO)
                .build();
    }


}
