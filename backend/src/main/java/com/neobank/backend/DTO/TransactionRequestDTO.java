package com.neobank.backend.DTO;

import com.neobank.backend.Model.TransactionType;
import com.neobank.backend.Model.User;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;


    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;


    private String description;

    private Long recipientId;

    private String category;

    public TransactionRequestDTO(Long userId, BigDecimal amount, TransactionType type, String description, Long recipientId) {
        this.userId = userId;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.recipientId = recipientId;
        this.category = "OTHER";
    }
}
