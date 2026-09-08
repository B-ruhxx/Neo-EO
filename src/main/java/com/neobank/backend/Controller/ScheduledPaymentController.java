package com.neobank.backend.Controller;

import com.neobank.backend.DTO.ScheduledPaymentRequestDTO;
import com.neobank.backend.DTO.ScheduledPaymentResponseDTO;
import com.neobank.backend.Model.User;
import com.neobank.backend.Service.ScheduledPaymentService;
import com.neobank.backend.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/scheduled-payments")
@RequiredArgsConstructor
public class ScheduledPaymentController {

    private final ScheduledPaymentService scheduledPaymentService;
    private final UserService userService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<ScheduledPaymentResponseDTO>> getScheduledPayments(Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(scheduledPaymentService.getScheduledPayments(user));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<ScheduledPaymentResponseDTO> createScheduledPayment(
            @RequestBody ScheduledPaymentRequestDTO dto,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(scheduledPaymentService.createScheduledPayment(user, dto));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/{id}/execute")
    public ResponseEntity<ScheduledPaymentResponseDTO> executePayment(
            @PathVariable Long id,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(scheduledPaymentService.executePayment(user, id));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PatchMapping("/{id}/toggle-pause")
    public ResponseEntity<ScheduledPaymentResponseDTO> togglePause(
            @PathVariable Long id,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(scheduledPaymentService.togglePause(user, id));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteScheduledPayment(
            @PathVariable Long id,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        scheduledPaymentService.deleteScheduledPayment(user, id);
        return ResponseEntity.ok("Pago programado cancelado correctamente");
    }
}
