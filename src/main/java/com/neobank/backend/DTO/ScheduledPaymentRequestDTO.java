package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledPaymentRequestDTO {
    private String title;
    private String serviceType;
    private String accountReference;
    private BigDecimal amount;
    private String frequency;
    private LocalDate nextExecutionDate;
    private Boolean autoDebit;
    private Boolean payNow;
}
