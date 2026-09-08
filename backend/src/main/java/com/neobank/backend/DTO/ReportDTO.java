package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private Long totalUsers;
    private BigDecimal totalBalance;
    private Map<String, Long> transactionCounts;
}
