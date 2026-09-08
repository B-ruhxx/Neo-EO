package com.neobank.backend.Controller;

import com.neobank.backend.DTO.AdjustBalanceDTO;
import com.neobank.backend.DTO.AdminOverviewDTO;
import com.neobank.backend.DTO.UserResponseDTO;
import com.neobank.backend.Mapper.UserMapper;
import com.neobank.backend.Model.SecurityIncident;
import com.neobank.backend.Model.Transaction;
import com.neobank.backend.Model.User;
import com.neobank.backend.Service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/admin", "/api/admin"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/overview")
    public AdminOverviewDTO getOverview() {
        return adminService.getAdminOverview();
    }

    @GetMapping("/total-balance")
    public BigDecimal getTotalBalance() {
        return adminService.getTotalBalance();
    }

    @GetMapping("/user-stats")
    public Map<String, Long> getUserStats() {
        return adminService.getUserStats();
    }

    @GetMapping("/recent-transactions")
    public List<Transaction> getRecentTransactions(@RequestParam(defaultValue = "10") int limit) {
        return adminService.getRecentTransactions(limit);
    }

    @PostMapping("/users/{id}/adjust-balance")
    public UserResponseDTO adjustUserBalance(
            @PathVariable Long id,
            @Valid @RequestBody AdjustBalanceDTO dto,
            Principal principal
    ) {
        User user = adminService.adjustUserBalance(id, dto, principal != null ? principal.getName() : "ADMIN");
        return UserMapper.toDTO(user);
    }

    @PatchMapping("/security-incidents/{id}/resolve")
    public SecurityIncident resolveIncident(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal
    ) {
        String notes = body != null ? body.get("notes") : null;
        String user = principal != null ? principal.getName() : "ADMIN";
        return adminService.resolveSecurityIncident(id, notes, user);
    }
}
