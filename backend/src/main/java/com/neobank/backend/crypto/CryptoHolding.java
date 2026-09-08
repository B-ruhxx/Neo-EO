package com.neobank.backend.crypto;

import com.neobank.backend.Model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoHolding {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 16)
    private String symbol; // BTC, ETH

    @Column(nullable = false, precision = 38, scale = 18)
    private BigDecimal quantity;
}
