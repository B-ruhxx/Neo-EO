package com.neobank.backend.crypto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CryptoOrderResponseDTO {
    private Long id;
    private Long userId;           // or String userEmail
    private String symbol;
    private String side;           // BUY / SELL
    private BigDecimal quantity;   // 18 dp
    private BigDecimal price;      // 8 dp
    private BigDecimal quoteAmount;
    private String status;         // FILLED
    private LocalDateTime createdAt;
}
