package com.neobank.backend.Service;

import com.neobank.backend.DTO.ScheduledPaymentRequestDTO;
import com.neobank.backend.DTO.ScheduledPaymentResponseDTO;
import com.neobank.backend.Model.*;
import com.neobank.backend.Repository.AuditLogRepository;
import com.neobank.backend.Repository.ScheduledPaymentRepository;
import com.neobank.backend.Repository.TransactionRepository;
import com.neobank.backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduledPaymentService {

    private final ScheduledPaymentRepository scheduledPaymentRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final AuditLogRepository auditLogRepository;

    public List<ScheduledPaymentResponseDTO> getScheduledPayments(User user) {
        return scheduledPaymentRepository.findByUserOrderByNextExecutionDateAsc(user).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ScheduledPaymentResponseDTO createScheduledPayment(User user, ScheduledPaymentRequestDTO dto) {
        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a 0");
        }
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("El título del servicio es requerido");
        }

        ScheduledPayment.ServiceType sType = ScheduledPayment.ServiceType.OTHER;
        if (dto.getServiceType() != null) {
            try {
                sType = ScheduledPayment.ServiceType.valueOf(dto.getServiceType().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        ScheduledPayment.PaymentFrequency freq = ScheduledPayment.PaymentFrequency.MONTHLY;
        if (dto.getFrequency() != null) {
            try {
                freq = ScheduledPayment.PaymentFrequency.valueOf(dto.getFrequency().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        LocalDate nextDate = dto.getNextExecutionDate() != null ? dto.getNextExecutionDate() : LocalDate.now();

        ScheduledPayment payment = ScheduledPayment.builder()
                .user(user)
                .title(dto.getTitle().trim())
                .serviceType(sType)
                .accountReference(dto.getAccountReference() != null ? dto.getAccountReference().trim() : "")
                .amount(dto.getAmount())
                .frequency(freq)
                .nextExecutionDate(nextDate)
                .autoDebit(dto.getAutoDebit() != null ? dto.getAutoDebit() : true)
                .status(ScheduledPayment.PaymentStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        if (Boolean.TRUE.equals(dto.getPayNow())) {
            // Execute immediate first payment
            if (user.getBalance().compareTo(dto.getAmount()) < 0) {
                throw new IllegalStateException("Saldo insuficiente para pagar este servicio ahora");
            }
            user.setBalance(user.getBalance().subtract(dto.getAmount()));
            userRepository.save(user);

            payment.setLastExecutedAt(LocalDateTime.now());
            if (freq == ScheduledPayment.PaymentFrequency.ONE_TIME) {
                payment.setStatus(ScheduledPayment.PaymentStatus.COMPLETED);
            } else {
                payment.setNextExecutionDate(calculateNextDate(nextDate, freq));
            }

            Transaction tx = Transaction.builder()
                    .user(user)
                    .amount(dto.getAmount())
                    .type(TransactionType.WITHDRAWAL)
                    .category(TransactionCategory.SERVICES)
                    .description("Pago de servicio: " + payment.getTitle() + " (" + payment.getAccountReference() + ")")
                    .timestamp(LocalDateTime.now())
                    .build();
            transactionRepository.save(tx);

            notificationService.createNotification(user,
                    "Pago de $" + dto.getAmount() + " procesado exitosamente para: " + payment.getTitle());
        } else {
            notificationService.createNotification(user,
                    "Servicio '" + payment.getTitle() + "' programado para pago el " + payment.getNextExecutionDate());
        }

        ScheduledPayment saved = scheduledPaymentRepository.save(payment);
        return toDTO(saved);
    }

    @Transactional
    public ScheduledPaymentResponseDTO executePayment(User user, Long paymentId) {
        ScheduledPayment payment = scheduledPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Pago programado no encontrado"));

        if (!payment.getUser().getId().equals(user.getId())) {
            throw new SecurityException("No autorizado para pagar este servicio");
        }

        if (payment.getStatus() == ScheduledPayment.PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Este pago ya fue completado");
        }

        if (user.getBalance().compareTo(payment.getAmount()) < 0) {
            throw new IllegalStateException("Saldo insuficiente para procesar el pago de $" + payment.getAmount());
        }

        user.setBalance(user.getBalance().subtract(payment.getAmount()));
        userRepository.save(user);

        payment.setLastExecutedAt(LocalDateTime.now());

        if (payment.getFrequency() == ScheduledPayment.PaymentFrequency.ONE_TIME) {
            payment.setStatus(ScheduledPayment.PaymentStatus.COMPLETED);
        } else {
            payment.setNextExecutionDate(calculateNextDate(payment.getNextExecutionDate(), payment.getFrequency()));
        }

        scheduledPaymentRepository.save(payment);

        Transaction tx = Transaction.builder()
                .user(user)
                .amount(payment.getAmount())
                .type(TransactionType.WITHDRAWAL)
                .category(TransactionCategory.SERVICES)
                .description("Pago de servicio: " + payment.getTitle() + " (" + payment.getAccountReference() + ")")
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);

        notificationService.createNotification(user,
                "Pago ejecutado por $" + payment.getAmount() + " para: " + payment.getTitle());

        return toDTO(payment);
    }

    @Transactional
    public ScheduledPaymentResponseDTO togglePause(User user, Long paymentId) {
        ScheduledPayment payment = scheduledPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Pago programado no encontrado"));

        if (!payment.getUser().getId().equals(user.getId())) {
            throw new SecurityException("No autorizado");
        }

        if (payment.getStatus() == ScheduledPayment.PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Un pago completado no puede pausarse");
        }

        if (payment.getStatus() == ScheduledPayment.PaymentStatus.ACTIVE) {
            payment.setStatus(ScheduledPayment.PaymentStatus.PAUSED);
            notificationService.createNotification(user, "Pago automático pausado para " + payment.getTitle());
        } else {
            payment.setStatus(ScheduledPayment.PaymentStatus.ACTIVE);
            notificationService.createNotification(user, "Pago automático reanudado para " + payment.getTitle());
        }

        return toDTO(scheduledPaymentRepository.save(payment));
    }

    @Transactional
    public void deleteScheduledPayment(User user, Long paymentId) {
        ScheduledPayment payment = scheduledPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Pago programado no encontrado"));

        if (!payment.getUser().getId().equals(user.getId())) {
            throw new SecurityException("No autorizado");
        }

        scheduledPaymentRepository.delete(payment);
        notificationService.createNotification(user, "Servicio programado eliminado: " + payment.getTitle());
    }

    private LocalDate calculateNextDate(LocalDate current, ScheduledPayment.PaymentFrequency freq) {
        if (current == null) current = LocalDate.now();
        return switch (freq) {
            case WEEKLY -> current.plusWeeks(1);
            case BIWEEKLY -> current.plusWeeks(2);
            case MONTHLY -> current.plusMonths(1);
            default -> current;
        };
    }

    private ScheduledPaymentResponseDTO toDTO(ScheduledPayment p) {
        return ScheduledPaymentResponseDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .serviceType(p.getServiceType() != null ? p.getServiceType().name() : "OTHER")
                .accountReference(p.getAccountReference())
                .amount(p.getAmount())
                .frequency(p.getFrequency() != null ? p.getFrequency().name() : "MONTHLY")
                .nextExecutionDate(p.getNextExecutionDate())
                .status(p.getStatus() != null ? p.getStatus().name() : "ACTIVE")
                .autoDebit(p.getAutoDebit())
                .lastExecutedAt(p.getLastExecutedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
