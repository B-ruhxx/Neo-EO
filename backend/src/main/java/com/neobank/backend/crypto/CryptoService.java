package com.neobank.backend.crypto;

import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.UserRepository; // adjust package if needed
import com.neobank.backend.crypto.CryptoProps;
import com.neobank.backend.crypto.CryptoHolding;
import com.neobank.backend.crypto.CryptoOrder;
import com.neobank.backend.crypto.TickerResponse;
import com.neobank.backend.crypto.ExchangeGateway;
import com.neobank.backend.crypto.CryptoHoldingRepository;
import com.neobank.backend.crypto.CryptoOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CryptoService {

    private final MarketDataService marketData;
    private final ExchangeGateway exchangeGateway;
    private final UserRepository userRepository;
    private final CryptoHoldingRepository holdingRepository;
    private final CryptoOrderRepository orderRepository;
    private final CryptoProps props;

    public TickerResponse getTickers(List<String> symbols) {
        return marketData.getTickers(symbols, props.getQuoteFiat());
    }

    public BigDecimal convert(String from, String to, BigDecimal amount) {
        return marketData.convert(from, to, amount);
    }

    @Transactional
    public CryptoOrder placeMarketOrder(String userEmail, String symbol, CryptoOrder.Side side, BigDecimal quoteAmount) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        TickerResponse t = marketData.getTickers(List.of(symbol), props.getQuoteFiat());
        if (t.getTickers().isEmpty()) throw new IllegalArgumentException("Unsupported symbol");
        BigDecimal priceNow = t.getTickers().get(0).getPrice();
        return exchangeGateway.placeMarketOrder(user, side, symbol, quoteAmount, priceNow);
    }

    public List<CryptoHolding> getMyHoldings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return holdingRepository.findByUser(user);
    }

    public List<CryptoOrder> getMyOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
