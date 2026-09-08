package com.neobank.backend.crypto;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "crypto")
@Data
public class CryptoProps {
    private String quoteFiat = "USD";
    private int priceTtlSeconds = 30;
    private Exchange exchange = new Exchange();

    @Data
    public static class Exchange {
        private String provider = "paper";
        private String apiKey;
        private String apiSecret;
    }
}
