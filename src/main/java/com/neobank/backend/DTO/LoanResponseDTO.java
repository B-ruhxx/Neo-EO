package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponseDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private BigDecimal amount;
    private Integer termMonths;
    private BigDecimal interestRate;
    private BigDecimal monthlyPayment;
    private BigDecimal totalRepayment;
    private BigDecimal remainingBalance;
    private String status;
    private String purpose;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String adminNotes;
}
