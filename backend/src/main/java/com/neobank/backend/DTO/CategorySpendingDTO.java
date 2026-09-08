package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySpendingDTO {
    private String category;
    private BigDecimal totalSpent;
    private BigDecimal budgetLimit;
    private Double percentage;
    private Long transactionCount;
}
