package com.neobank.backend.crypto;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties(CryptoProps.class)
public class CryptoConfig {

    @Bean
    public WebClient cryptoWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl("https://api.coingecko.com/api/v3")
                .defaultHeader(HttpHeaders.USER_AGENT, "neobank-backend/crypto")
                .build();
    }

    @Bean
    public Cache<String, Object> cryptoCache(CryptoProps props) {
        return Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(props.getPriceTtlSeconds()))
                .maximumSize(1000)
                .build();
    }
}
