package com.neobank.backend.Service;

import com.neobank.backend.DTO.BudgetDTO;
import com.neobank.backend.DTO.CategorySpendingDTO;
import com.neobank.backend.DTO.MonthlyTrendDTO;
import com.neobank.backend.Model.Budget;
import com.neobank.backend.Model.Transaction;
import com.neobank.backend.Model.TransactionCategory;
import com.neobank.backend.Model.TransactionType;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.BudgetRepository;
import com.neobank.backend.Repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final NotificationService notificationService;

    public List<CategorySpendingDTO> getSpendingByCategory(User user, Integer month, Integer year) {
        LocalDate now = LocalDate.now();
        int targetMonth = (month != null && month >= 1 && month <= 12) ? month : now.getMonthValue();
        int targetYear = (year != null && year >= 2000) ? year : now.getYear();

        YearMonth ym = YearMonth.of(targetYear, targetMonth);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

        List<Transaction> transactions = transactionRepository.findByUserAndTimestampBetween(user, start, end);
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, targetMonth, targetYear);
        Map<TransactionCategory, BigDecimal> budgetMap = budgets.stream()
                .collect(Collectors.toMap(Budget::getCategory, Budget::getMonthlyLimit, (b1, b2) -> b2));

        Map<TransactionCategory, BigDecimal> spentMap = new EnumMap<>(TransactionCategory.class);
        Map<TransactionCategory, Long> countMap = new EnumMap<>(TransactionCategory.class);

        for (TransactionCategory cat : TransactionCategory.values()) {
            spentMap.put(cat, BigDecimal.ZERO);
            countMap.put(cat, 0L);
        }

        for (Transaction tx : transactions) {
            // Count expenses: WITHDRAWAL or TRANSFER originated by this user
            if (tx.getType() == TransactionType.WITHDRAWAL || tx.getType() == TransactionType.TRANSFER) {
                TransactionCategory cat = tx.getCategory() != null ? tx.getCategory() : TransactionCategory.OTHER;
                spentMap.put(cat, spentMap.get(cat).add(tx.getAmount()));
                countMap.put(cat, countMap.get(cat) + 1);
            }
        }

        List<CategorySpendingDTO> results = new ArrayList<>();
        for (TransactionCategory cat : TransactionCategory.values()) {
            BigDecimal spent = spentMap.get(cat);
            BigDecimal limit = budgetMap.get(cat);
            Long count = countMap.get(cat);

            // Include if there was spending or a budget was set
            if (spent.compareTo(BigDecimal.ZERO) > 0 || limit != null) {
                Double pct = null;
                if (limit != null && limit.compareTo(BigDecimal.ZERO) > 0) {
                    pct = spent.divide(limit, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                }

                results.add(CategorySpendingDTO.builder()
                        .category(cat.name())
                        .totalSpent(spent)
                        .budgetLimit(limit)
                        .percentage(pct)
                        .transactionCount(count)
                        .build());
            }
        }

        // If no spending yet, return standard categories with 0
        if (results.isEmpty()) {
            for (TransactionCategory cat : List.of(TransactionCategory.FOOD, TransactionCategory.SERVICES, TransactionCategory.SHOPPING, TransactionCategory.ENTERTAINMENT)) {
                results.add(CategorySpendingDTO.builder()
                        .category(cat.name())
                        .totalSpent(BigDecimal.ZERO)
                        .budgetLimit(budgetMap.get(cat))
                        .percentage(0.0)
                        .transactionCount(0L)
                        .build());
            }
        }

        return results;
    }

    public List<MonthlyTrendDTO> getMonthlyTrend(User user) {
        List<MonthlyTrendDTO> trend = new ArrayList<>();
        YearMonth currentYM = YearMonth.now();

        // 6 months back to now
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentYM.minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

            List<Transaction> txs = transactionRepository.findByUserAndTimestampBetween(user, start, end);

            BigDecimal income = BigDecimal.ZERO;
            BigDecimal expense = BigDecimal.ZERO;

            for (Transaction tx : txs) {
                if (tx.getType() == TransactionType.DEPOSIT) {
                    income = income.add(tx.getAmount());
                } else if (tx.getType() == TransactionType.WITHDRAWAL || tx.getType() == TransactionType.TRANSFER) {
                    expense = expense.add(tx.getAmount());
                }
            }

            String monthLabel = ym.getMonth().getDisplayName(TextStyle.SHORT, new Locale("es", "ES"));
            monthLabel = monthLabel.substring(0, 1).toUpperCase() + monthLabel.substring(1);

            trend.add(MonthlyTrendDTO.builder()
                    .month(monthLabel)
                    .income(income)
                    .expense(expense)
                    .net(income.subtract(expense))
                    .build());
        }

        return trend;
    }

    public List<BudgetDTO> getBudgets(User user, Integer month, Integer year) {
        LocalDate now = LocalDate.now();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear = (year != null) ? year : now.getYear();

        return budgetRepository.findByUserAndMonthAndYear(user, targetMonth, targetYear).stream()
                .map(b -> BudgetDTO.builder()
                        .id(b.getId())
                        .category(b.getCategory().name())
                        .monthlyLimit(b.getMonthlyLimit())
                        .month(b.getMonth())
                        .year(b.getYear())
                        .build())
                .collect(Collectors.toList());
    }

    public BudgetDTO setBudget(User user, BudgetDTO dto) {
        LocalDate now = LocalDate.now();
        int targetMonth = (dto.getMonth() != null) ? dto.getMonth() : now.getMonthValue();
        int targetYear = (dto.getYear() != null) ? dto.getYear() : now.getYear();
        TransactionCategory category = TransactionCategory.valueOf(dto.getCategory().toUpperCase());

        Budget budget = budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category, targetMonth, targetYear)
                .orElse(Budget.builder()
                        .user(user)
                        .category(category)
                        .month(targetMonth)
                        .year(targetYear)
                        .build());

        budget.setMonthlyLimit(dto.getMonthlyLimit());
        Budget saved = budgetRepository.save(budget);

        notificationService.createNotification(user, "Presupuesto asignado para " + category.name() + ": $" + dto.getMonthlyLimit());

        return BudgetDTO.builder()
                .id(saved.getId())
                .category(saved.getCategory().name())
                .monthlyLimit(saved.getMonthlyLimit())
                .month(saved.getMonth())
                .year(saved.getYear())
                .build();
    }

    public void deleteBudget(User user, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new SecurityException("No autorizado para eliminar este presupuesto");
        }
        budgetRepository.delete(budget);
    }
}
