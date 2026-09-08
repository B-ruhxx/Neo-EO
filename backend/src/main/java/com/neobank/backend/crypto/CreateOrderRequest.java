package com.neobank.backend.crypto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateOrderRequest {
    @NotBlank private String symbol;                 // BTC
    @NotBlank private String side;                   // BUY or SELL
    @NotNull @DecimalMin("0.01") private BigDecimal quoteAmount; // spend/receive in quote fiat (USD)
}
