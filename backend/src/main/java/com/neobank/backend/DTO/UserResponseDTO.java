package com.neobank.backend.DTO;


import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String postalCode;
    private String country;
    private String role;
    private Boolean isVerified;
    private BigDecimal balance;



}
