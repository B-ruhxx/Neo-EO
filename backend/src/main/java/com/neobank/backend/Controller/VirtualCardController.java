package com.neobank.backend.Controller;

import com.neobank.backend.DTO.CardLimitsDTO;
import com.neobank.backend.DTO.CardPinDTO;
import com.neobank.backend.DTO.CardRequestDTO;
import com.neobank.backend.DTO.VirtualCardDTO;
import com.neobank.backend.Model.User;
import com.neobank.backend.Model.VirtualCard;
import com.neobank.backend.Service.UserService;
import com.neobank.backend.Service.VirtualCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class VirtualCardController {

    private final VirtualCardService virtualCardService;
    private final UserService userService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<VirtualCardDTO> createCard(
            @RequestBody(required = false) CardRequestDTO request,
            Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        VirtualCard card = virtualCardService.createCard(user, request);
        return ResponseEntity.ok(toDTO(card));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<VirtualCardDTO>> getMyCards(Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        List<VirtualCardDTO> cards = virtualCardService.getUserCards(user).stream()
                .filter(c -> c.getStatus() != VirtualCard.CardStatus.DELETED)
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cards);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PatchMapping("/{id}/freeze")
    public ResponseEntity<VirtualCardDTO> freezeCard(@PathVariable Long id) {
        VirtualCard card = virtualCardService.freezeCard(id);
        return ResponseEntity.ok(toDTO(card));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/virtual-cards/{id}/freeze")
    public ResponseEntity<VirtualCardDTO> freezeCardLegacy(@PathVariable Long id) {
        return freezeCard(id);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PatchMapping("/{id}/unfreeze")
    public ResponseEntity<VirtualCardDTO> unfreezeCard(@PathVariable Long id) {
        VirtualCard card = virtualCardService.unfreezeCard(id);
        return ResponseEntity.ok(toDTO(card));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PatchMapping("/{id}/limits")
    public ResponseEntity<VirtualCardDTO> updateLimits(
            @PathVariable Long id,
            @RequestBody CardLimitsDTO limits) {
        VirtualCard card = virtualCardService.updateLimits(id, limits);
        return ResponseEntity.ok(toDTO(card));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PatchMapping("/{id}/pin")
    public ResponseEntity<VirtualCardDTO> updatePin(
            @PathVariable Long id,
            @RequestBody CardPinDTO pinDto) {
        VirtualCard card = virtualCardService.updatePin(id, pinDto.getPin());
        return ResponseEntity.ok(toDTO(card));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PatchMapping("/{id}/toggle-online")
    public ResponseEntity<VirtualCardDTO> toggleOnline(@PathVariable Long id) {
        VirtualCard card = virtualCardService.toggleOnlinePayments(id);
        return ResponseEntity.ok(toDTO(card));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/{id}/regenerate")
    public ResponseEntity<VirtualCardDTO> regenerate(@PathVariable Long id) {
        VirtualCard card = virtualCardService.regenerateCard(id);
        return ResponseEntity.ok(toDTO(card));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCard(@PathVariable Long id) {
        virtualCardService.deleteCard(id);
        return ResponseEntity.ok("Card deleted successfully");
    }

    private VirtualCardDTO toDTO(VirtualCard card) {
        return new VirtualCardDTO(
                card.getId(),
                card.getCardNumber(),
                card.getCvv(),
                card.getExpiryDate(),
                card.getStatus().name(),
                card.getCardType() != null ? card.getCardType().name() : "VIRTUAL",
                card.getDailyLimit(),
                card.getMonthlyLimit(),
                card.getPin(),
                card.getOnlinePaymentsEnabled(),
                card.getColor(),
                card.getCardHolder()
        );
    }
}

