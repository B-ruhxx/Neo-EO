package com.neobank.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VirtualCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 16)
    private String cardNumber;

    @Column(nullable = false, length = 3)
    private String cvv;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardStatus status;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CardType cardType = CardType.VIRTUAL;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private java.math.BigDecimal dailyLimit = new java.math.BigDecimal("500.00");

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private java.math.BigDecimal monthlyLimit = new java.math.BigDecimal("2000.00");

    @Column(length = 4)
    @Builder.Default
    private String pin = "1234";

    @Builder.Default
    private Boolean onlinePaymentsEnabled = true;

    @Builder.Default
    private String color = "obsidian";

    private String cardHolder;

    public enum CardStatus {
        ACTIVE, FROZEN, DELETED
    }

    public enum CardType {
        VIRTUAL, PHYSICAL, DISPOSABLE
    }
}
