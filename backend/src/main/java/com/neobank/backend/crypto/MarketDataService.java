package com.neobank.backend.crypto;

import com.github.benmanes.caffeine.cache.Cache;
import com.neobank.backend.crypto.Ticker;
import com.neobank.backend.crypto.TickerResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketDataService {
    private final WebClient cryptoWebClient;
    private final Cache<String, Object> cryptoCache;

    public TickerResponse getTickers(List<String> symbols, String vsCurrency) {
        String cacheKey = "tickers:" + String.join(",", symbols).toLowerCase() + ":" + vsCurrency.toLowerCase();
        @SuppressWarnings("unchecked")
        TickerResponse cached = (TickerResponse) cryptoCache.getIfPresent(cacheKey);
        if (cached != null) return cached;

        String ids = symbols.stream().map(String::toLowerCase).collect(Collectors.joining(","));
        List<Map<String, Object>> data = cryptoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/coins/markets")
                        .queryParam("vs_currency", vsCurrency)
                        .queryParam("ids", ids)
                        .queryParam("order", "market_cap_desc")
                        .queryParam("per_page", symbols.size())
                        .queryParam("page", 1)
                        .queryParam("price_change_percentage", "24h")
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String,Object>>>(){})
                .block();

        if (data == null) data = List.of();

        List<Ticker> tickers = data.stream().map(d -> new Ticker(
                String.valueOf(d.getOrDefault("symbol","")).toUpperCase(),
                new BigDecimal(String.valueOf(d.getOrDefault("current_price","0"))),
                new BigDecimal(String.valueOf(d.getOrDefault("price_change_percentage_24h","0"))),
                new BigDecimal(String.valueOf(d.getOrDefault("high_24h","0"))),
                new BigDecimal(String.valueOf(d.getOrDefault("low_24h","0"))),
                String.valueOf(d.getOrDefault("image", ""))
        )).toList();

        TickerResponse resp = new TickerResponse(vsCurrency.toUpperCase(), tickers);
        cryptoCache.put(cacheKey, resp);
        return resp;
    }

    public BigDecimal convert(String fromSymbol, String toSymbol, BigDecimal amount) {
        if (fromSymbol.equalsIgnoreCase(toSymbol)) return amount;
        Map<String, BigDecimal> pricesUsd = getSimplePrices(List.of(fromSymbol, toSymbol), "usd");
        BigDecimal fromUsd = pricesUsd.get(fromSymbol.toLowerCase());
        BigDecimal toUsd   = pricesUsd.get(toSymbol.toLowerCase());
        if (fromUsd == null || toUsd == null) {
            throw new IllegalArgumentException("Unsupported symbol(s)");
        }
        return amount.multiply(fromUsd).divide(toUsd, 8, RoundingMode.HALF_UP);
    }

    private Map<String, BigDecimal> getSimplePrices(List<String> symbols, String vs) {
        String key = "simple:" + String.join(",", symbols).toLowerCase() + ":" + vs.toLowerCase();
        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> cached = (Map<String, BigDecimal>) cryptoCache.getIfPresent(key);
        if (cached != null) return cached;

        String ids = symbols.stream().map(String::toLowerCase).collect(Collectors.joining(","));
        Map<String, Map<String, Object>> data = cryptoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/simple/price")
                        .queryParam("ids", ids)
                        .queryParam("vs_currencies", vs)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Map<String,Object>>>(){})
                .block();

        Map<String, BigDecimal> out = new HashMap<>();
        if (data != null) {
            data.forEach((coin, map) -> out.put(coin, new BigDecimal(String.valueOf(map.get(vs)))));
        }
        cryptoCache.put(key, out);
        return out;
    }
}
