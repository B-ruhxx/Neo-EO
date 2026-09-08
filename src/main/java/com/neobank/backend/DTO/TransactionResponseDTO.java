package com.neobank.backend.DTO;

import com.neobank.backend.Model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDTO {
    private Long id;
    private String userEmail;
    private BigDecimal amount;
    private String recipientEmail;
    private TransactionType type;
    private String description;
    private LocalDateTime timestamp;
    private String category;
}
