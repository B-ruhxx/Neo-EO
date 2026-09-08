package com.neobank.backend.crypto;

import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaperExchangeService implements ExchangeGateway {

    private final UserRepository userRepo;
    private final CryptoHoldingRepository holdingRepo;
    private final CryptoOrderRepository orderRepo;

    @Transactional
    @Override
    public CryptoOrder placeMarketOrder(
            User user,
            CryptoOrder.Side side,
            String symbol,
            BigDecimal quoteAmount,
            BigDecimal priceNow
    ) {

        final String sym = symbol.toUpperCase();

        if (priceNow.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Bad price");
        }
        if (quoteAmount.compareTo(new BigDecimal("0.01")) < 0) {
            throw new IllegalArgumentException("Minimum 0.01");
        }

        BigDecimal qty = quoteAmount.divide(priceNow, 18, RoundingMode.HALF_UP);

        if (side == CryptoOrder.Side.BUY) {
            if (user.getBalance().compareTo(quoteAmount) < 0) {
                throw new IllegalArgumentException("Insufficient fiat balance");
            }

            user.setBalance(user.getBalance().subtract(quoteAmount));
            userRepo.save(user);


            CryptoHolding holding = holdingRepo.findByUserAndSymbol(user, sym)
                    .orElseGet(() -> CryptoHolding.builder()
                            .user(user)
                            .symbol(sym)
                            .quantity(BigDecimal.ZERO)
                            .build());
            holding.setQuantity(holding.getQuantity().add(qty));
            holdingRepo.save(holding);

        } else {
            CryptoHolding holding = holdingRepo.findByUserAndSymbol(user, sym)
                    .orElseThrow(() -> new IllegalArgumentException("No holdings for " + sym));
            if (holding.getQuantity().compareTo(qty) < 0) {
                throw new IllegalArgumentException("Insufficient crypto quantity");
            }
            holding.setQuantity(holding.getQuantity().subtract(qty));
            holdingRepo.save(holding);

            user.setBalance(user.getBalance().add(quoteAmount));
            userRepo.save(user);
        }

        CryptoOrder order = CryptoOrder.builder()
                .user(user)
                .symbol(sym)
                .side(side)
                .quantity(qty)
                .price(priceNow.setScale(8, RoundingMode.HALF_UP))
                .quoteAmount(quoteAmount.setScale(8, RoundingMode.HALF_UP))
                .status(CryptoOrder.Status.FILLED)
                .createdAt(LocalDateTime.now())
                .build();

        return orderRepo.save(order);
    }
}
