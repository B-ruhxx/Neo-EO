package com.neobank.backend.Service;

import com.neobank.backend.Model.User;
import com.neobank.backend.Model.VirtualCard;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Repository.VirtualCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class VirtualCardService {

    private final VirtualCardRepository virtualCardRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;


    public VirtualCard createCard(User user) {
        return createCard(user, null);
    }

    public VirtualCard createCard(User user, com.neobank.backend.DTO.CardRequestDTO req) {
        VirtualCard.CardType type = VirtualCard.CardType.VIRTUAL;
        java.math.BigDecimal daily = new java.math.BigDecimal("500.00");
        java.math.BigDecimal monthly = new java.math.BigDecimal("2000.00");
        String pin = "1234";
        String color = "obsidian";
        String cardHolder = (user.getFirstName() != null ? user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "") : "NEO CARDHOLDER").toUpperCase().trim();

        if (req != null) {
            if (req.getCardType() != null) {
                try {
                    type = VirtualCard.CardType.valueOf(req.getCardType().toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }
            if (req.getDailyLimit() != null && req.getDailyLimit().compareTo(java.math.BigDecimal.ZERO) > 0) {
                daily = req.getDailyLimit();
            }
            if (req.getMonthlyLimit() != null && req.getMonthlyLimit().compareTo(java.math.BigDecimal.ZERO) > 0) {
                monthly = req.getMonthlyLimit();
            }
            if (req.getPin() != null && req.getPin().matches("\\d{4}")) {
                pin = req.getPin();
            }
            if (req.getColor() != null && !req.getColor().isBlank()) {
                color = req.getColor();
            }
            if (req.getCardHolder() != null && !req.getCardHolder().isBlank()) {
                cardHolder = req.getCardHolder().toUpperCase().trim();
            }
        }

        VirtualCard card = VirtualCard.builder()
                .user(user)
                .cardNumber(generateCardNumber())
                .cvv(generateCVV())
                .expiryDate(LocalDate.now().plusYears(type == VirtualCard.CardType.DISPOSABLE ? 1 : 3))
                .status(VirtualCard.CardStatus.ACTIVE)
                .cardType(type)
                .dailyLimit(daily)
                .monthlyLimit(monthly)
                .pin(pin)
                .onlinePaymentsEnabled(true)
                .color(color)
                .cardHolder(cardHolder)
                .build();

        VirtualCard savedCard = virtualCardRepository.save(card);

        notificationService.createNotification(user, "Nueva tarjeta " + type.name().toLowerCase() + " creada con terminación " +
                savedCard.getCardNumber().substring(savedCard.getCardNumber().length() - 4));

        return savedCard;
    }

    public VirtualCard updateLimits(Long cardId, com.neobank.backend.DTO.CardLimitsDTO limits) {
        VirtualCard card = virtualCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));
        if (limits.getDailyLimit() != null) {
            card.setDailyLimit(limits.getDailyLimit());
        }
        if (limits.getMonthlyLimit() != null) {
            card.setMonthlyLimit(limits.getMonthlyLimit());
        }
        VirtualCard saved = virtualCardRepository.save(card);
        notificationService.createNotification(card.getUser(), "Límites actualizados para tu tarjeta *" +
                card.getCardNumber().substring(card.getCardNumber().length() - 4));
        return saved;
    }

    public VirtualCard updatePin(Long cardId, String pin) {
        VirtualCard card = virtualCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));
        if (pin == null || !pin.matches("\\d{4}")) {
            throw new IllegalArgumentException("El PIN debe constar de 4 dígitos numéricos");
        }
        card.setPin(pin);
        VirtualCard saved = virtualCardRepository.save(card);
        notificationService.createNotification(card.getUser(), "PIN actualizado exitosamente para tu tarjeta *" +
                card.getCardNumber().substring(card.getCardNumber().length() - 4));
        return saved;
    }

    public VirtualCard toggleOnlinePayments(Long cardId) {
        VirtualCard card = virtualCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));
        boolean newState = card.getOnlinePaymentsEnabled() == null || !card.getOnlinePaymentsEnabled();
        card.setOnlinePaymentsEnabled(newState);
        VirtualCard saved = virtualCardRepository.save(card);
        notificationService.createNotification(card.getUser(), "Compras por internet " + (newState ? "habilitadas" : "deshabilitadas") + " para tarjeta *" +
                card.getCardNumber().substring(card.getCardNumber().length() - 4));
        return saved;
    }

    public VirtualCard regenerateCard(Long cardId) {
        VirtualCard card = virtualCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));
        card.setCardNumber(generateCardNumber());
        card.setCvv(generateCVV());
        card.setExpiryDate(LocalDate.now().plusYears(card.getCardType() == VirtualCard.CardType.DISPOSABLE ? 1 : 3));
        VirtualCard saved = virtualCardRepository.save(card);
        notificationService.createNotification(card.getUser(), "Credenciales regeneradas para tarjeta *" +
                saved.getCardNumber().substring(saved.getCardNumber().length() - 4));
        return saved;
    }

    public List<VirtualCard> getUserCards(User user) {
        return virtualCardRepository.findByUser(user);
    }

    public VirtualCard freezeCard(Long cardId) {
        VirtualCard card = virtualCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setStatus(VirtualCard.CardStatus.FROZEN);

        VirtualCard savedCard = virtualCardRepository.save(card);


        notificationService.createNotification(card.getUser(), "Your card ending in " +
                card.getCardNumber().substring(card.getCardNumber().length() - 4) + " has been frozen.");

        return savedCard;
    }

    public VirtualCard unfreezeCard(Long cardId) {
        VirtualCard card = virtualCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setStatus(VirtualCard.CardStatus.ACTIVE);

        VirtualCard savedCard = virtualCardRepository.save(card);


        notificationService.createNotification(card.getUser(), "Your card ending in " +
                card.getCardNumber().substring(card.getCardNumber().length() - 4) + " is active again.");

        return savedCard;
    }

    public void deleteCard(Long cardId) {
        VirtualCard card = virtualCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setStatus(VirtualCard.CardStatus.DELETED);
        virtualCardRepository.save(card);


        notificationService.createNotification(card.getUser(), "Your card ending in " +
                card.getCardNumber().substring(card.getCardNumber().length() - 4) + " has been deleted.");
    }


    private String generateCardNumber() {
        Random random = new Random();
        StringBuilder cardNumber = new StringBuilder("4567");
        for (int i = 0; i < 12; i++) {
            cardNumber.append(random.nextInt(10));
        }
        return cardNumber.toString();
    }

    private String generateCVV() {
        Random random = new Random();
        int cvv = 100 + random.nextInt(900);
        return String.valueOf(cvv);
    }
}
