package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewDTO {
    private AdminKpis kpis;
    private List<DailyCashflow> cashflow7Days;
    private List<AssetSlice> assetDistribution;
    private List<TransactionBreakdown> transactionTypeBreakdown;
    private List<com.neobank.backend.Model.SecurityIncident> recentIncidents;
    private List<com.neobank.backend.Model.AuditLog> recentAuditLogs;
    private List<com.neobank.backend.Model.Transaction> recentTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminKpis {
        private long totalUsers;
        private long activeUsers;
        private long frozenUsers;
        private BigDecimal totalDeposits;
        private BigDecimal totalLoansVolume;
        private long activeLoansCount;
        private BigDecimal totalVaultSavings;
        private long vaultsCount;
        private long transactions24h;
        private BigDecimal volume24h;
        private long unresolvedIncidents;
        private long openTickets;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyCashflow {
        private String date;
        private BigDecimal deposits;
        private BigDecimal withdrawals;
        private BigDecimal transfers;
        private BigDecimal totalVolume;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssetSlice {
        private String name;
        private BigDecimal value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionBreakdown {
        private String type;
        private long count;
        private BigDecimal volume;
    }
}
