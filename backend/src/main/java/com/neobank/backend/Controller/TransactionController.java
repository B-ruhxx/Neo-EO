package com.neobank.backend.Controller;

import com.neobank.backend.DTO.TransactionRequestDTO;
import com.neobank.backend.DTO.TransactionResponseDTO;
import com.neobank.backend.Model.Transaction;
import com.neobank.backend.Service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponseDTO> createTransaction(@RequestBody TransactionRequestDTO dto) {
        Transaction transaction = transactionService.createTransaction(dto);

        TransactionResponseDTO response = new TransactionResponseDTO();
        response.setId(transaction.getId());
        response.setUserEmail(transaction.getUser().getEmail());
        response.setRecipientEmail(transaction.getRecipient() != null ? transaction.getRecipient().getEmail() : null);
        response.setAmount(transaction.getAmount());
        response.setType(transaction.getType());
        response.setDescription(transaction.getDescription());
        response.setTimestamp(transaction.getTimestamp());

        return ResponseEntity.ok(response);
    }




    @GetMapping("/user/{userId}")
    public List<TransactionResponseDTO> getTransactionsByUser(@PathVariable Long userId) {
        return transactionService.getTransactionsByUser(userId);
    }

    @GetMapping("/user/{userId}/date-range")
    public List<TransactionResponseDTO> getTransactionsByDate(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return transactionService.getTransactionsByDate(userId, start, end);
    }

    @GetMapping("/user/{userId}/above")
    public List<TransactionResponseDTO> getTransactionsAboveAmount(
            @PathVariable Long userId,
            @RequestParam BigDecimal amount) {
        return transactionService.getTransactionsAboveAmount(userId, amount);
    }


    @GetMapping("/user/{userId}/below")
    public List<TransactionResponseDTO> getTransactionsBelowAmount(
            @PathVariable Long userId,
            @RequestParam BigDecimal amount) {
        return transactionService.getTransactionsBelowAmount(userId, amount);
    }

}
