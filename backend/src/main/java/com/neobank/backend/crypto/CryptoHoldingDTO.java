package com.neobank.backend.crypto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class CryptoHoldingDTO {
    private String symbol;
    private BigDecimal quantity;
}
