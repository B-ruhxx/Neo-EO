package com.neobank.backend.crypto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crypto")
@RequiredArgsConstructor
public class CryptoController {

    private final CryptoService cryptoService;


    @GetMapping("/tickers")
    public ResponseEntity<TickerResponse> getTickers(@RequestParam List<String> symbols) {
        return ResponseEntity.ok(cryptoService.getTickers(symbols));
    }

    @GetMapping("/convert")
    public ResponseEntity<Map<String,Object>> convert(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam BigDecimal amount
    ) {
        BigDecimal result = cryptoService.convert(from, to, amount);
        return ResponseEntity.ok(Map.of(
                "from", from.toUpperCase(),
                "to", to.toUpperCase(),
                "amount", amount,
                "result", result
        ));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me/holdings")
    public ResponseEntity<List<CryptoHoldingDTO>> myHoldings(Authentication auth) {
        var holdings = cryptoService.getMyHoldings(auth.getName()).stream()
                .map(h -> new CryptoHoldingDTO(h.getSymbol(), h.getQuantity()))
                .toList();
        return ResponseEntity.ok(holdings);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me/orders")
    public ResponseEntity<List<CryptoOrderResponseDTO>> myOrders(Authentication auth) {
        var orders = cryptoService.getMyOrders(auth.getName()).stream()
                .map(o -> CryptoOrderResponseDTO.builder()
                        .id(o.getId())
                        .userId(o.getUser().getId())
                        .symbol(o.getSymbol())
                        .side(o.getSide().name())
                        .quantity(o.getQuantity())
                        .price(o.getPrice())
                        .quoteAmount(o.getQuoteAmount())
                        .status(o.getStatus().name())
                        .createdAt(o.getCreatedAt())
                        .build())
                .toList();
        return ResponseEntity.ok(orders);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/order")
    public ResponseEntity<CryptoOrderResponseDTO> marketOrder(
            Authentication auth,
            @Valid @RequestBody CreateOrderRequest req
    ) {
        var side = CryptoOrder.Side.valueOf(req.getSide().toUpperCase());
        var order = cryptoService.placeMarketOrder(auth.getName(), req.getSymbol(), side, req.getQuoteAmount());

        var dto = CryptoOrderResponseDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .symbol(order.getSymbol())
                .side(order.getSide().name())
                .quantity(order.getQuantity())
                .price(order.getPrice())
                .quoteAmount(order.getQuoteAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .build();

        return ResponseEntity.ok(dto);
    }
}
