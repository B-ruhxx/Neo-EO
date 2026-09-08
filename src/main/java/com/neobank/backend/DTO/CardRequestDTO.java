package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardRequestDTO {
    private String cardType;
    private BigDecimal dailyLimit;
    private BigDecimal monthlyLimit;
    private String pin;
    private String color;
    private String cardHolder;
}
