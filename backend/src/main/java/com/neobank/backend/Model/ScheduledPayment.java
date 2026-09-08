package com.neobank.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType serviceType;

    @Column(nullable = false)
    private String accountReference;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentFrequency frequency;

    @Column(nullable = false)
    private LocalDate nextExecutionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.ACTIVE;

    @Builder.Default
    private Boolean autoDebit = true;

    private LocalDateTime lastExecutedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ServiceType {
        ELECTRICITY,
        WATER,
        INTERNET,
        PHONE,
        STREAMING,
        RENT,
        OTHER
    }

    public enum PaymentFrequency {
        ONE_TIME,
        WEEKLY,
        BIWEEKLY,
        MONTHLY
    }

    public enum PaymentStatus {
        ACTIVE,
        PAUSED,
        COMPLETED
    }
}
