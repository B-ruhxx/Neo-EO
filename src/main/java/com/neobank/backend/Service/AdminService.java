package com.neobank.backend.Service;

import com.neobank.backend.DTO.AdjustBalanceDTO;
import com.neobank.backend.DTO.AdminOverviewDTO;
import com.neobank.backend.Model.*;
import com.neobank.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;
    private final SecurityIncidentRepository securityIncidentRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final LoanRepository loanRepository;
    private final VaultRepository vaultRepository;

    public BigDecimal getTotalBalance() {
        return userRepository.findAll()
                .stream()
                .map(user -> user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Map<String, Long> getUserStats() {
        long active = userRepository.countByStatus("ACTIVE");
        long frozen = userRepository.countByStatus("FROZEN");
        long deleted = userRepository.countByDeletedTrue();

        Map<String, Long> stats = new HashMap<>();
        stats.put("active", active);
        stats.put("frozen", frozen);
        stats.put("deleted", deleted);
        return stats;
    }

    public List<Transaction> getRecentTransactions(int limit) {
        return transactionRepository.findTopNTransactions(limit);
    }

    public AdminOverviewDTO getAdminOverview() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("ACTIVE");
        long frozenUsers = userRepository.countByStatus("FROZEN");
        BigDecimal totalDeposits = getTotalBalance();

        List<Loan> allLoans = loanRepository.findAll();
        List<Loan> approvedLoans = allLoans.stream()
                .filter(l -> l.getStatus() == Loan.LoanStatus.APPROVED)
                .collect(Collectors.toList());
        BigDecimal totalLoansVolume = approvedLoans.stream()
                .map(l -> l.getRemainingBalance() != null ? l.getRemainingBalance() : l.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Vault> allVaults = vaultRepository.findAll();
        List<Vault> activeVaults = allVaults.stream()
                .filter(v -> Boolean.FALSE.equals(v.getDeleted()))
                .collect(Collectors.toList());
        BigDecimal totalVaultSavings = activeVaults.stream()
                .map(v -> v.getCurrentAmount() != null ? v.getCurrentAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime since24h = LocalDateTime.now().minusHours(24);
        List<Transaction> allTx = transactionRepository.findAll();
        List<Transaction> tx24h = allTx.stream()
                .filter(t -> t.getTimestamp() != null && t.getTimestamp().isAfter(since24h))
                .collect(Collectors.toList());
        long transactions24h = tx24h.size();
        BigDecimal volume24h = tx24h.stream()
                .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long unresolvedIncidents = securityIncidentRepository.countByResolvedFalse();
        long openTickets = supportTicketRepository.countByStatus("OPEN");

        AdminOverviewDTO.AdminKpis kpis = AdminOverviewDTO.AdminKpis.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .frozenUsers(frozenUsers)
                .totalDeposits(totalDeposits)
                .totalLoansVolume(totalLoansVolume)
                .activeLoansCount(approvedLoans.size())
                .totalVaultSavings(totalVaultSavings)
                .vaultsCount(activeVaults.size())
                .transactions24h(transactions24h)
                .volume24h(volume24h)
                .unresolvedIncidents(unresolvedIncidents)
                .openTickets(openTickets)
                .build();

        // 7-day cashflow
        LocalDate today = LocalDate.now();
        List<AdminOverviewDTO.DailyCashflow> cashflow7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String dateStr = d.format(DateTimeFormatter.ISO_DATE);
            BigDecimal dep = BigDecimal.ZERO;
            BigDecimal with = BigDecimal.ZERO;
            BigDecimal trans = BigDecimal.ZERO;

            for (Transaction t : allTx) {
                if (t.getTimestamp() != null && t.getTimestamp().toLocalDate().equals(d)) {
                    BigDecimal amt = t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO;
                    if (t.getType() == TransactionType.DEPOSIT) {
                        dep = dep.add(amt);
                    } else if (t.getType() == TransactionType.WITHDRAWAL) {
                        with = with.add(amt);
                    } else if (t.getType() == TransactionType.TRANSFER) {
                        trans = trans.add(amt);
                    }
                }
            }
            cashflow7Days.add(AdminOverviewDTO.DailyCashflow.builder()
                    .date(dateStr)
                    .deposits(dep)
                    .withdrawals(with)
                    .transfers(trans)
                    .totalVolume(dep.add(with).add(trans))
                    .build());
        }

        // Asset distribution
        List<AdminOverviewDTO.AssetSlice> assetDistribution = List.of(
                AdminOverviewDTO.AssetSlice.builder().name("Depósitos en Cuenta").value(totalDeposits).build(),
                AdminOverviewDTO.AssetSlice.builder().name("Bóvedas de Ahorro").value(totalVaultSavings).build(),
                AdminOverviewDTO.AssetSlice.builder().name("Cartera de Créditos").value(totalLoansVolume).build()
        );

        // Transaction breakdown by type
        Map<TransactionType, Long> typeCounts = allTx.stream()
                .filter(t -> t.getType() != null)
                .collect(Collectors.groupingBy(Transaction::getType, Collectors.counting()));
        Map<TransactionType, BigDecimal> typeVolumes = allTx.stream()
                .filter(t -> t.getType() != null && t.getAmount() != null)
                .collect(Collectors.groupingBy(Transaction::getType,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        List<AdminOverviewDTO.TransactionBreakdown> transactionTypeBreakdown = new ArrayList<>();
        for (TransactionType type : TransactionType.values()) {
            transactionTypeBreakdown.add(AdminOverviewDTO.TransactionBreakdown.builder()
                    .type(type.name())
                    .count(typeCounts.getOrDefault(type, 0L))
                    .volume(typeVolumes.getOrDefault(type, BigDecimal.ZERO))
                    .build());
        }

        List<SecurityIncident> recentIncidents = securityIncidentRepository.findTop5ByOrderByCreatedAtDesc();
        List<AuditLog> recentAuditLogs = auditLogRepository.findAllByOrderByTimeStampDesc(PageRequest.of(0, 10));
        List<Transaction> recentTransactions = transactionRepository.findTopNTransactions(10);

        return AdminOverviewDTO.builder()
                .kpis(kpis)
                .cashflow7Days(cashflow7Days)
                .assetDistribution(assetDistribution)
                .transactionTypeBreakdown(transactionTypeBreakdown)
                .recentIncidents(recentIncidents)
                .recentAuditLogs(recentAuditLogs)
                .recentTransactions(recentTransactions)
                .build();
    }

    @Transactional
    public SecurityIncident resolveSecurityIncident(Long id, String notes, String performedBy) {
        SecurityIncident incident = securityIncidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Security incident not found: " + id));
        incident.setResolved(true);
        incident.setResolutionNotes(notes != null ? notes : "Resuelto por administrador");
        SecurityIncident saved = securityIncidentRepository.save(incident);

        AuditLog log = AuditLog.builder()
                .action("RESOLVE_SECURITY_INCIDENT")
                .performedBy(performedBy)
                .description("Incidente de seguridad #" + id + " marcado como resuelto. Notas: " + incident.getResolutionNotes())
                .build();
        auditLogRepository.save(log);

        return saved;
    }

    @Transactional
    public User adjustUserBalance(Long userId, AdjustBalanceDTO dto, String performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isCredit = "CREDIT".equalsIgnoreCase(dto.getType());
        if (!isCredit && !"DEBIT".equalsIgnoreCase(dto.getType())) {
            throw new IllegalArgumentException("Invalid adjustment type. Must be CREDIT or DEBIT.");
        }

        if (!isCredit && user.getBalance().compareTo(dto.getAmount()) < 0) {
            throw new RuntimeException("Insufficient user balance for debit adjustment");
        }

        if (isCredit) {
            user.setBalance(user.getBalance().add(dto.getAmount()));
        } else {
            user.setBalance(user.getBalance().subtract(dto.getAmount()));
        }

        User savedUser = userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setUser(savedUser);
        tx.setAmount(dto.getAmount());
        tx.setType(isCredit ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL);
        tx.setDescription("Admin Adjustment (" + dto.getType() + "): " + dto.getReason());
        tx.setTimestamp(LocalDateTime.now());
        transactionRepository.save(tx);

        AuditLog log = AuditLog.builder()
                .action("ADMIN_ADJUSTMENT")
                .performedBy(performedBy)
                .description("Adjusted balance for " + user.getEmail() + " (" + dto.getType() + " $" + dto.getAmount() + "). Reason: " + dto.getReason())
                .build();
        auditLogRepository.save(log);

        notificationService.createNotification(savedUser,
                "Admin balance adjustment (" + dto.getType() + "): $" + dto.getAmount() + ". Reason: " + dto.getReason());

        return savedUser;
    }
}
