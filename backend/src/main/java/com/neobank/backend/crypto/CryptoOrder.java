package com.neobank.backend.crypto;

import com.neobank.backend.Model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false) private String symbol;  // BTC
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Side side; // BUY/SELL
    @Column(nullable = false, precision = 38, scale = 18) private BigDecimal quantity;    // crypto units
    @Column(nullable = false, precision = 38, scale = 8)  private BigDecimal price;       // quote per unit
    @Column(nullable = false, precision = 38, scale = 8)  private BigDecimal quoteAmount; // price*qty
    @Column(nullable = false) private LocalDateTime createdAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Status status;

    public enum Side { BUY, SELL }
    public enum Status { FILLED, REJECTED }
}
