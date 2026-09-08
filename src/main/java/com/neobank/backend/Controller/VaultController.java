package com.neobank.backend.Controller;

import com.neobank.backend.DTO.VaultDTO;
import com.neobank.backend.Model.User;
import com.neobank.backend.Service.UserService;
import com.neobank.backend.Service.VaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vaults")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class VaultController {

    private final VaultService vaultService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<VaultDTO>> getMyVaults(Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(vaultService.getUserVaults(user));
    }

    @PostMapping
    public ResponseEntity<VaultDTO> createVault(@Valid @RequestBody VaultDTO dto, Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(vaultService.createVault(user, dto));
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<VaultDTO> depositToVault(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> payload,
            Principal principal
    ) {
        BigDecimal amount = payload.get("amount");
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(vaultService.depositToVault(id, amount, user));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<VaultDTO> withdrawFromVault(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> payload,
            Principal principal
    ) {
        BigDecimal amount = payload.get("amount");
        User user = userService.getUserEntityByEmail(principal.getName());
        return ResponseEntity.ok(vaultService.withdrawFromVault(id, amount, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVault(@PathVariable Long id, Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        vaultService.deleteVault(id, user);
        return ResponseEntity.ok("Vault deleted and funds refunded to main balance");
    }
}
