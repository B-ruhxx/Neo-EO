package com.neobank.backend.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VirtualCardDTO(
        Long id,
        String cardNumber,
        String cvv,
        LocalDate expiryDate,
        String status,
        String cardType,
        BigDecimal dailyLimit,
        BigDecimal monthlyLimit,
        String pin,
        Boolean onlinePaymentsEnabled,
        String color,
        String cardHolder
) {}
