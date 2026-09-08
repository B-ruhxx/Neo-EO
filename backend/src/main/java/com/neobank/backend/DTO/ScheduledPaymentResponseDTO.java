package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledPaymentResponseDTO {
    private Long id;
    private String title;
    private String serviceType;
    private String accountReference;
    private BigDecimal amount;
    private String frequency;
    private LocalDate nextExecutionDate;
    private String status;
    private Boolean autoDebit;
    private LocalDateTime lastExecutedAt;
    private LocalDateTime createdAt;
}
