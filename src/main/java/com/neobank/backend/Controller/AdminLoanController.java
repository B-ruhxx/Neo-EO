package com.neobank.backend.Controller;

import com.neobank.backend.DTO.LoanAdminActionDTO;
import com.neobank.backend.DTO.LoanResponseDTO;
import com.neobank.backend.Service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/loans")
@RequiredArgsConstructor
public class AdminLoanController {

    private final LoanService loanService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<LoanResponseDTO>> getAllLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<LoanResponseDTO> approveLoan(
            @PathVariable Long id,
            @RequestBody(required = false) LoanAdminActionDTO dto,
            Principal principal) {
        String notes = dto != null ? dto.getNotes() : "Aprobado por el Administrador";
        return ResponseEntity.ok(loanService.approveLoan(id, principal.getName(), notes));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<LoanResponseDTO> rejectLoan(
            @PathVariable Long id,
            @RequestBody(required = false) LoanAdminActionDTO dto,
            Principal principal) {
        String reason = dto != null ? dto.getNotes() : "Rechazado por el Administrador";
        return ResponseEntity.ok(loanService.rejectLoan(id, principal.getName(), reason));
    }
}
