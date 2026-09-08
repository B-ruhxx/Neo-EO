package com.neobank.backend.Service;

import com.neobank.backend.DTO.*;
import com.neobank.backend.Model.*;
import com.neobank.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanPaymentRepository loanPaymentRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final AuditLogRepository auditLogRepository;

    private static final BigDecimal ANNUAL_INTEREST_RATE = new BigDecimal("12.00"); // 12% annual

    public LoanSimulationResponseDTO simulate(BigDecimal amount, Integer termMonths) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a 0");
        }
        if (termMonths == null || termMonths <= 0) {
            termMonths = 12;
        }

        double p = amount.doubleValue();
        double r = ANNUAL_INTEREST_RATE.doubleValue() / 100.0 / 12.0; // monthly rate
        int n = termMonths;

        double monthlyPmt;
        if (r > 0) {
            monthlyPmt = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        } else {
            monthlyPmt = p / n;
        }

        BigDecimal monthly = BigDecimal.valueOf(monthlyPmt).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalRepayment = monthly.multiply(BigDecimal.valueOf(n)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalInterest = totalRepayment.subtract(amount).setScale(2, RoundingMode.HALF_UP);

        return LoanSimulationResponseDTO.builder()
                .amount(amount.setScale(2, RoundingMode.HALF_UP))
                .termMonths(termMonths)
                .annualInterestRate(ANNUAL_INTEREST_RATE)
                .monthlyPayment(monthly)
                .totalRepayment(totalRepayment)
                .totalInterest(totalInterest)
                .build();
    }

    @Transactional
    public LoanResponseDTO applyForLoan(User user, LoanApplicationDTO dto) {
        if ("FROZEN".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Tu cuenta está congelada. No puedes solicitar créditos.");
        }

        LoanSimulationResponseDTO sim = simulate(dto.getAmount(), dto.getTermMonths());

        Loan loan = Loan.builder()
                .user(user)
                .amount(sim.getAmount())
                .termMonths(sim.getTermMonths())
                .interestRate(sim.getAnnualInterestRate())
                .monthlyPayment(sim.getMonthlyPayment())
                .totalRepayment(sim.getTotalRepayment())
                .remainingBalance(sim.getTotalRepayment())
                .status(Loan.LoanStatus.PENDING)
                .purpose(dto.getPurpose() != null ? dto.getPurpose() : "Crédito Personal")
                .createdAt(LocalDateTime.now())
                .build();

        Loan saved = loanRepository.save(loan);

        notificationService.createNotification(user,
                "Tu solicitud de préstamo por $" + saved.getAmount() + " ha sido recibida y está en evaluación.");

        auditLogRepository.save(AuditLog.builder()
                .action("LOAN_APPLIED")
                .performedBy(user.getEmail())
                .description("Solicitud de crédito #" + saved.getId() + " por $" + saved.getAmount())
                .build());

        return toDTO(saved);
    }

    public List<LoanResponseDTO> getUserLoans(User user) {
        return loanRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<LoanResponseDTO> getAllLoans() {
        return loanRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LoanResponseDTO approveLoan(Long loanId, String adminEmail, String notes) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));

        if (loan.getStatus() != Loan.LoanStatus.PENDING) {
            throw new IllegalStateException("Solo se pueden aprobar préstamos en estado PENDIENTE");
        }

        loan.setStatus(Loan.LoanStatus.APPROVED);
        loan.setApprovedAt(LocalDateTime.now());
        loan.setAdminNotes(notes);
        loanRepository.save(loan);

        // Immediate fund disbursement to user
        User borrower = loan.getUser();
        borrower.setBalance(borrower.getBalance().add(loan.getAmount()));
        userRepository.save(borrower);

        // Create Deposit Transaction
        Transaction tx = Transaction.builder()
                .user(borrower)
                .amount(loan.getAmount())
                .type(TransactionType.DEPOSIT)
                .category(TransactionCategory.INVESTMENT)
                .description("Desembolso de Préstamo #" + loan.getId())
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);

        notificationService.createNotification(borrower,
                "¡Tu préstamo de $" + loan.getAmount() + " ha sido aprobado y depositado en tu balance!");

        auditLogRepository.save(AuditLog.builder()
                .action("LOAN_APPROVED")
                .performedBy(adminEmail)
                .description("Préstamo #" + loan.getId() + " aprobado por $" + loan.getAmount() + " para " + borrower.getEmail())
                .build());

        return toDTO(loan);
    }

    @Transactional
    public LoanResponseDTO rejectLoan(Long loanId, String adminEmail, String reason) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));

        if (loan.getStatus() != Loan.LoanStatus.PENDING) {
            throw new IllegalStateException("Solo se pueden rechazar préstamos en estado PENDIENTE");
        }

        loan.setStatus(Loan.LoanStatus.REJECTED);
        loan.setAdminNotes(reason != null ? reason : "Rechazado por administración");
        loanRepository.save(loan);

        notificationService.createNotification(loan.getUser(),
                "Tu solicitud de préstamo #" + loan.getId() + " ha sido rechazada. " + (reason != null ? "(" + reason + ")" : ""));

        auditLogRepository.save(AuditLog.builder()
                .action("LOAN_REJECTED")
                .performedBy(adminEmail)
                .description("Préstamo #" + loan.getId() + " rechazado para " + loan.getUser().getEmail())
                .build());

        return toDTO(loan);
    }

    @Transactional
    public LoanResponseDTO payLoanInstallment(User user, Long loanId, BigDecimal customAmount) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));

        if (!loan.getUser().getId().equals(user.getId())) {
            throw new SecurityException("No tienes permiso para abonar a este préstamo");
        }

        if (loan.getStatus() != Loan.LoanStatus.APPROVED) {
            throw new IllegalStateException("Solo préstamos activos y aprobados pueden recibir pagos");
        }

        BigDecimal payAmount;
        if (customAmount != null && customAmount.compareTo(BigDecimal.ZERO) > 0) {
            payAmount = customAmount;
        } else {
            payAmount = loan.getMonthlyPayment();
        }

        if (payAmount.compareTo(loan.getRemainingBalance()) > 0) {
            payAmount = loan.getRemainingBalance();
        }

        if (user.getBalance().compareTo(payAmount) < 0) {
            throw new IllegalStateException("Saldo insuficiente para realizar el pago de $" + payAmount);
        }

        user.setBalance(user.getBalance().subtract(payAmount));
        userRepository.save(user);

        loan.setRemainingBalance(loan.getRemainingBalance().subtract(payAmount));
        if (loan.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setRemainingBalance(BigDecimal.ZERO);
            loan.setStatus(Loan.LoanStatus.PAID);
            notificationService.createNotification(user,
                    "¡Felicitaciones! Has completado el pago total de tu préstamo #" + loan.getId());
        } else {
            notificationService.createNotification(user,
                    "Abono de $" + payAmount + " aplicado al préstamo #" + loan.getId() + ". Saldo restante: $" + loan.getRemainingBalance());
        }
        loanRepository.save(loan);

        // Record loan payment
        List<LoanPayment> existingPayments = loanPaymentRepository.findByLoanOrderByPaymentDateAsc(loan);
        LoanPayment lp = LoanPayment.builder()
                .loan(loan)
                .amount(payAmount)
                .installmentNumber(existingPayments.size() + 1)
                .paymentDate(LocalDateTime.now())
                .build();
        loanPaymentRepository.save(lp);

        // Record transaction
        Transaction tx = Transaction.builder()
                .user(user)
                .amount(payAmount)
                .type(TransactionType.WITHDRAWAL)
                .category(TransactionCategory.SERVICES)
                .description("Pago cuota préstamo #" + loan.getId())
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);

        return toDTO(loan);
    }

    private LoanResponseDTO toDTO(Loan loan) {
        String name = "Usuario";
        if (loan.getUser() != null) {
            name = (loan.getUser().getFirstName() != null ? loan.getUser().getFirstName() : "") + " " +
                   (loan.getUser().getLastName() != null ? loan.getUser().getLastName() : "");
            name = name.trim();
            if (name.isEmpty()) name = loan.getUser().getEmail();
        }

        return LoanResponseDTO.builder()
                .id(loan.getId())
                .userId(loan.getUser() != null ? loan.getUser().getId() : null)
                .userEmail(loan.getUser() != null ? loan.getUser().getEmail() : null)
                .userName(name)
                .amount(loan.getAmount())
                .termMonths(loan.getTermMonths())
                .interestRate(loan.getInterestRate())
                .monthlyPayment(loan.getMonthlyPayment())
                .totalRepayment(loan.getTotalRepayment())
                .remainingBalance(loan.getRemainingBalance())
                .status(loan.getStatus().name())
                .purpose(loan.getPurpose())
                .createdAt(loan.getCreatedAt())
                .approvedAt(loan.getApprovedAt())
                .adminNotes(loan.getAdminNotes())
                .build();
    }
}
