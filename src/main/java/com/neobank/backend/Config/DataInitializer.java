package com.neobank.backend.Config;

import com.neobank.backend.Model.*;
import com.neobank.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdmin(
            UserRepository userRepository,
            SecurityIncidentRepository securityIncidentRepository,
            SupportTicketRepository supportTicketRepository,
            TransactionRepository transactionRepository,
            AuditLogRepository auditLogRepository
    ) {
        return args -> {
            // 1. Admin user
            User admin = userRepository.findByEmail("admin@bank.com").orElse(null);
            if (admin == null) {
                admin = User.builder()
                        .firstName("Admin")
                        .lastName("Master")
                        .email("admin@bank.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .balance(BigDecimal.ZERO)
                        .isVerified(true)
                        .status("ACTIVE")
                        .build();
                admin = userRepository.save(admin);
                System.out.println("✅ Admin user created: admin@bank.com / admin123");
            }

            // 2. Demo client user
            User demo = userRepository.findByEmail("demo@bank.com").orElse(null);
            if (demo == null) {
                demo = User.builder()
                        .firstName("Carlos")
                        .lastName("Gómez")
                        .email("demo@bank.com")
                        .password(passwordEncoder.encode("demo123"))
                        .role(Role.USER)
                        .balance(new BigDecimal("14500.00"))
                        .isVerified(true)
                        .status("ACTIVE")
                        .phoneNumber("+51 987 654 321")
                        .address("Av. Javier Prado Este 2465, San Borja")
                        .city("Lima")
                        .postalCode("15036")
                        .country("Perú")
                        .build();
                demo = userRepository.save(demo);
                System.out.println("✅ Demo user created: demo@bank.com / demo123");
            }

            // 3. Seed transactions if empty
            if (transactionRepository.count() == 0 && demo != null) {
                transactionRepository.save(Transaction.builder()
                        .user(demo)
                        .amount(new BigDecimal("8000.00"))
                        .type(TransactionType.DEPOSIT)
                        .description("Depósito inicial de nómina")
                        .timestamp(LocalDateTime.now().minusDays(5))
                        .build());

                transactionRepository.save(Transaction.builder()
                        .user(demo)
                        .amount(new BigDecimal("1200.00"))
                        .type(TransactionType.WITHDRAWAL)
                        .description("Pago alquiler inmobiliario")
                        .timestamp(LocalDateTime.now().minusDays(4))
                        .build());

                transactionRepository.save(Transaction.builder()
                        .user(demo)
                        .amount(new BigDecimal("5000.00"))
                        .type(TransactionType.DEPOSIT)
                        .description("Transferencia bancaria recibida")
                        .timestamp(LocalDateTime.now().minusDays(2))
                        .build());

                transactionRepository.save(Transaction.builder()
                        .user(demo)
                        .amount(new BigDecimal("350.00"))
                        .type(TransactionType.TRANSFER)
                        .description("Envío a cuenta de ahorros familiar")
                        .timestamp(LocalDateTime.now().minusHours(12))
                        .build());

                transactionRepository.save(Transaction.builder()
                        .user(demo)
                        .amount(new BigDecimal("2700.00"))
                        .type(TransactionType.DEPOSIT)
                        .description("Rendimientos de inversión")
                        .timestamp(LocalDateTime.now().minusHours(4))
                        .build());
            }

            // 4. Security incidents
            if (securityIncidentRepository.count() == 0) {
                securityIncidentRepository.save(SecurityIncident.builder()
                        .eventType("SUSPICIOUS_LOGIN_ATTEMPT")
                        .severity("HIGH")
                        .targetUserEmail("demo@bank.com")
                        .description("Múltiples intentos fallidos de inicio de sesión desde IP no reconocida (194.26.29.112)")
                        .resolved(false)
                        .createdAt(LocalDateTime.now().minusHours(3))
                        .build());

                securityIncidentRepository.save(SecurityIncident.builder()
                        .eventType("LARGE_WITHDRAWAL_ALERT")
                        .severity("MEDIUM")
                        .targetUserEmail("demo@bank.com")
                        .description("Transferencia por importe superior al umbral configurado ($5,000.00 USD)")
                        .resolved(true)
                        .resolutionNotes("Verificado telefónicamente con el titular de la cuenta.")
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build());

                securityIncidentRepository.save(SecurityIncident.builder()
                        .eventType("API_RATE_LIMIT_EXCEEDED")
                        .severity("LOW")
                        .targetUserEmail("system@bank.com")
                        .description("Ráfaga anómala de solicitudes en el endpoint /api/cards/virtual")
                        .resolved(false)
                        .createdAt(LocalDateTime.now().minusHours(1))
                        .build());
            }

            // 5. Support tickets
            if (supportTicketRepository.count() == 0 && demo != null) {
                supportTicketRepository.save(SupportTicket.builder()
                        .user(demo)
                        .subject("Solicitud de aumento de límite de tarjeta")
                        .category("CARDS")
                        .priority("MEDIUM")
                        .status("OPEN")
                        .description("Deseo incrementar el límite diario de compras en el extranjero.")
                        .createdAt(LocalDateTime.now().minusHours(5))
                        .build());

                supportTicketRepository.save(SupportTicket.builder()
                        .user(demo)
                        .subject("Aclaración de comisión en transferencia internacional")
                        .category("TRANSFERS")
                        .priority("LOW")
                        .status("IN_PROGRESS")
                        .description("No reconozco el cargo de 2.50 USD por comisión de cambio.")
                        .adminNotes("Revisando con el departamento de compensación.")
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .build());
            }

            // 6. Audit logs
            if (auditLogRepository.count() == 0) {
                auditLogRepository.save(AuditLog.builder()
                        .action("SYSTEM_INITIALIZATION")
                        .performedBy("SYSTEM")
                        .description("Inicialización del sistema bancario y configuración de seguridad")
                        .build());

                auditLogRepository.save(AuditLog.builder()
                        .action("ADMIN_LOGIN")
                        .performedBy("admin@bank.com")
                        .description("Inicio de sesión de administrador exitoso")
                        .build());
            }
        };
    }
}
