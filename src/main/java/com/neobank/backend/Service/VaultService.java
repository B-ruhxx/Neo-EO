package com.neobank.backend.Service;

import com.neobank.backend.DTO.VaultDTO;
import com.neobank.backend.Model.User;
import com.neobank.backend.Model.Vault;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Repository.VaultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VaultService {

    private final VaultRepository vaultRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<VaultDTO> getUserVaults(User user) {
        return vaultRepository.findByUserAndDeletedFalse(user)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public VaultDTO createVault(User user, VaultDTO dto) {
        Vault vault = Vault.builder()
                .user(user)
                .name(dto.getName())
                .targetAmount(dto.getTargetAmount() != null ? dto.getTargetAmount() : BigDecimal.ZERO)
                .currentAmount(BigDecimal.ZERO)
                .build();

        Vault saved = vaultRepository.save(vault);
        notificationService.createNotification(user, "Created saving vault '" + saved.getName() + "'.");
        return mapToDTO(saved);
    }

    @Transactional
    public VaultDTO depositToVault(Long vaultId, BigDecimal amount, User user) {
        if ("FROZEN".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Account is frozen. Operations not permitted.");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }
        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance to transfer into vault.");
        }

        Vault vault = vaultRepository.findByIdAndUserAndDeletedFalse(vaultId, user)
                .orElseThrow(() -> new RuntimeException("Vault not found"));

        user.setBalance(user.getBalance().subtract(amount));
        vault.setCurrentAmount(vault.getCurrentAmount().add(amount));

        userRepository.save(user);
        Vault savedVault = vaultRepository.save(vault);

        notificationService.createNotification(user,
                "Deposited $" + amount + " into vault '" + vault.getName() + "'.");

        return mapToDTO(savedVault);
    }

    @Transactional
    public VaultDTO withdrawFromVault(Long vaultId, BigDecimal amount, User user) {
        if ("FROZEN".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Account is frozen. Operations not permitted.");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        Vault vault = vaultRepository.findByIdAndUserAndDeletedFalse(vaultId, user)
                .orElseThrow(() -> new RuntimeException("Vault not found"));

        if (vault.getCurrentAmount().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient vault balance.");
        }

        vault.setCurrentAmount(vault.getCurrentAmount().subtract(amount));
        user.setBalance(user.getBalance().add(amount));

        vaultRepository.save(vault);
        userRepository.save(user);

        notificationService.createNotification(user,
                "Withdrew $" + amount + " from vault '" + vault.getName() + "' back to main balance.");

        return mapToDTO(vault);
    }

    @Transactional
    public void deleteVault(Long vaultId, User user) {
        Vault vault = vaultRepository.findByIdAndUserAndDeletedFalse(vaultId, user)
                .orElseThrow(() -> new RuntimeException("Vault not found"));

        // If vault has funds, return them to user balance
        if (vault.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0) {
            user.setBalance(user.getBalance().add(vault.getCurrentAmount()));
            userRepository.save(user);
        }

        vault.setDeleted(true);
        vaultRepository.save(vault);

        notificationService.createNotification(user,
                "Deleted vault '" + vault.getName() + "'. Remaining funds were refunded to main balance.");
    }

    private VaultDTO mapToDTO(Vault vault) {
        Double progress = null;
        if (vault.getTargetAmount() != null && vault.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = vault.getCurrentAmount()
                    .divide(vault.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            if (progress > 100.0) progress = 100.0;
        }

        return VaultDTO.builder()
                .id(vault.getId())
                .name(vault.getName())
                .targetAmount(vault.getTargetAmount())
                .currentAmount(vault.getCurrentAmount())
                .progressPercentage(progress)
                .createdAt(vault.getCreatedAt())
                .build();
    }
}
