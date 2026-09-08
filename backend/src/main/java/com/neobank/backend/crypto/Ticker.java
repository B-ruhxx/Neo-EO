package com.neobank.backend.crypto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class Ticker {
    private String symbol;
    private BigDecimal price;
    private BigDecimal change24hPercent;
    private BigDecimal high24h;
    private BigDecimal low24h;
    private String image;
}
