package com.neobank.backend.Service;

import com.neobank.backend.DTO.TransactionRequestDTO;
import com.neobank.backend.DTO.TransactionResponseDTO;
import com.neobank.backend.Exceptions.UserNotFoundException;
import com.neobank.backend.Model.AuditLog;
import com.neobank.backend.Model.Transaction;
import com.neobank.backend.Model.TransactionType;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.AuditLogRepository;
import com.neobank.backend.Repository.TransactionRepository;
import com.neobank.backend.Repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    @Transactional
    public Transaction createTransaction(TransactionRequestDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("FROZEN".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Account is frozen. Transactions are not permitted.");
        }

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(dto.getAmount());
        transaction.setType(dto.getType());
        transaction.setDescription(dto.getDescription());
        transaction.setTimestamp(LocalDateTime.now());
        if (dto.getCategory() != null && !dto.getCategory().isBlank()) {
            try {
                transaction.setCategory(com.neobank.backend.Model.TransactionCategory.valueOf(dto.getCategory().toUpperCase()));
            } catch (Exception e) {
                transaction.setCategory(com.neobank.backend.Model.TransactionCategory.OTHER);
            }
        } else {
            transaction.setCategory(com.neobank.backend.Model.TransactionCategory.OTHER);
        }

        switch (dto.getType()) {
            case DEPOSIT -> {
                User target = user;
                if (dto.getRecipientId() != null) {
                    target = userRepository.findById(dto.getRecipientId())
                            .orElseThrow(() -> new RuntimeException("Recipient not found"));
                    if ("FROZEN".equalsIgnoreCase(target.getStatus())) {
                        throw new IllegalStateException("Recipient account is frozen. Deposit not permitted.");
                    }
                }

                target.setBalance(target.getBalance().add(dto.getAmount()));

                if (dto.getRecipientId() != null && !dto.getRecipientId().equals(user.getId())) {
                    transaction.setRecipient(target);
                    userRepository.save(target);
                    logAction("DEPOSIT", user.getEmail(),
                            "Deposited " + dto.getAmount() + " into account of " + target.getEmail());
                    notificationService.createNotification(target,
                            "You received a deposit of $" + dto.getAmount() + " from " + user.getFirstName() + " " + user.getLastName() + ".");
                    notificationService.createNotification(user,
                            "You deposited $" + dto.getAmount() + " to " + target.getFirstName() + " " + target.getLastName() + ".");
                } else {
                    logAction("DEPOSIT", user.getEmail(),
                            "Deposited " + dto.getAmount() + " into account");
                    notificationService.createNotification(user,
                            "You deposited $" + dto.getAmount() + " into your account.");
                }
            }
            case WITHDRAWAL -> {
                if (user.getBalance().compareTo(dto.getAmount()) < 0) {
                    throw new RuntimeException("Insufficient balance");
                }
                user.setBalance(user.getBalance().subtract(dto.getAmount()));
                logAction("WITHDRAWAL", user.getEmail(),
                        "Withdrew " + dto.getAmount() + " from account");
                notificationService.createNotification(user,
                        "You withdrew $" + dto.getAmount() + " from your account.");
            }
            case TRANSFER -> {
                if (user.getBalance().compareTo(dto.getAmount()) < 0) {
                    throw new RuntimeException("Insufficient balance for transfer");
                }

                User recipient = userRepository.findById(dto.getRecipientId())
                        .orElseThrow(() -> new RuntimeException("Recipient not found"));

                if ("FROZEN".equalsIgnoreCase(recipient.getStatus())) {
                    throw new IllegalStateException("Recipient account is frozen. Transfer not permitted.");
                }

                user.setBalance(user.getBalance().subtract(dto.getAmount()));
                recipient.setBalance(recipient.getBalance().add(dto.getAmount()));

                transaction.setRecipient(recipient);
                userRepository.save(recipient);

                logAction("TRANSFER", user.getEmail(),
                        "Transferred " + dto.getAmount() + " to " + recipient.getEmail());

                notificationService.createNotification(recipient,
                        "You received a transfer of $" + dto.getAmount() + " from " + user.getFirstName() + " " + user.getLastName() + " (" + user.getEmail() + ").");
                notificationService.createNotification(user,
                        "You successfully transferred $" + dto.getAmount() + " to " + recipient.getFirstName() + " " + recipient.getLastName() + " (" + recipient.getEmail() + ").");
            }
        }

        userRepository.save(user);
        return transactionRepository.save(transaction);
    }

    private void logAction(String action, String performedBy, String description) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .description(description)
                .build();
        auditLogRepository.save(log);
    }



    public List<TransactionResponseDTO> getTransactionsByUser(Long userId) {
        User user= userRepository.findById(userId).orElseThrow(()-> new UserNotFoundException("User not found"));

        return transactionRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }

    public List<TransactionResponseDTO> getTransactionsByDate(Long userId, LocalDateTime start, LocalDateTime end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return transactionRepository.findByUserAndTimestampBetween(user, start, end)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponseDTO> getTransactionsAboveAmount(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return transactionRepository.findByUserAndAmountGreaterThan(user, amount)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponseDTO mapToResponse(Transaction transaction) {
        return new TransactionResponseDTO(
                transaction.getId(),
                transaction.getUser().getEmail(),
                transaction.getAmount(),
                transaction.getRecipient() != null ? transaction.getRecipient().getEmail() : null,
                transaction.getType(),
                transaction.getDescription(),
                transaction.getTimestamp(),
                transaction.getCategory() != null ? transaction.getCategory().name() : "OTHER"
        );
    }





    public List<TransactionResponseDTO> getTransactionsBelowAmount(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return transactionRepository.findByUserAndAmountLessThan(user, amount)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


}
