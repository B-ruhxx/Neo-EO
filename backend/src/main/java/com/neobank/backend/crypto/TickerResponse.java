package com.neobank.backend.crypto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TickerResponse {
    private String vsCurrency;
    private List<Ticker> tickers;
}
