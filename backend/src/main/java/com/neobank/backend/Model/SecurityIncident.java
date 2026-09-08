package com.neobank.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventType; // SUSPICIOUS_TRANSACTION, ACCOUNT_LOCKOUT, UNUSUAL_VOLUME, ADMIN_OVERRIDE, NEW_DEVICE

    @Column(nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, length = 1000)
    private String description;

    private String targetUserEmail;

    @Builder.Default
    private Boolean resolved = false;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    private String resolutionNotes;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.resolved == null) {
            this.resolved = false;
        }
    }
}
