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
public class LoanSimulationResponseDTO {
    private BigDecimal amount;
    private Integer termMonths;
    private BigDecimal annualInterestRate;
    private BigDecimal monthlyPayment;
    private BigDecimal totalRepayment;
    private BigDecimal totalInterest;
}
