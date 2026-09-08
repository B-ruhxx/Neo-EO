package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardLimitsDTO {
    private BigDecimal dailyLimit;
    private BigDecimal monthlyLimit;
}
