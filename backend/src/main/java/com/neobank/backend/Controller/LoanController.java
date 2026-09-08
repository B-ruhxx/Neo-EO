package com.neobank.backend.Controller;

import com.neobank.backend.DTO.*;
import com.neobank.backend.Model.User;
import com.neobank.backend.Service.LoanService;
import com.neobank.backend.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final UserService userService;

    @PostMapping("/simulate")
    public ResponseEntity<LoanSimulationResponseDTO> simulate(@RequestBody LoanSimulationRequestDTO dto) {
        return ResponseEntity.ok(loanService.simulate(dto.getAmount(), dto.getTermMonths()));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/apply")
    public ResponseEntity<LoanResponseDTO> apply(
            @RequestBody LoanApplicationDTO dto,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(loanService.applyForLoan(user, dto));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<LoanResponseDTO>> getMyLoans(Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(loanService.getUserLoans(user));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/{id}/pay")
    public ResponseEntity<LoanResponseDTO> payInstallment(
            @PathVariable Long id,
            @RequestBody(required = false) LoanPayRequestDTO payDto,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        java.math.BigDecimal amount = payDto != null ? payDto.getAmount() : null;
        return ResponseEntity.ok(loanService.payLoanInstallment(user, id, amount));
    }
}
