package com.neobank.backend.Controller;

import com.neobank.backend.DTO.BudgetDTO;
import com.neobank.backend.DTO.CategorySpendingDTO;
import com.neobank.backend.DTO.MonthlyTrendDTO;
import com.neobank.backend.Model.User;
import com.neobank.backend.Service.AnalyticsService;
import com.neobank.backend.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/analytics/spending-by-category")
    public ResponseEntity<List<CategorySpendingDTO>> getSpendingByCategory(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(analyticsService.getSpendingByCategory(user, month, year));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/analytics/monthly-trend")
    public ResponseEntity<List<MonthlyTrendDTO>> getMonthlyTrend(Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(analyticsService.getMonthlyTrend(user));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/budgets")
    public ResponseEntity<List<BudgetDTO>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(analyticsService.getBudgets(user, month, year));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/budgets")
    public ResponseEntity<BudgetDTO> setBudget(
            @RequestBody BudgetDTO dto,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(analyticsService.setBudget(user, dto));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<String> deleteBudget(
            @PathVariable Long id,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        analyticsService.deleteBudget(user, id);
        return ResponseEntity.ok("Presupuesto eliminado exitosamente");
    }
}
