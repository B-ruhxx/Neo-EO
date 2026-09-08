package com.neobank.backend;


import com.neobank.backend.DTO.TransactionRequestDTO;
import com.neobank.backend.Model.Transaction;
import com.neobank.backend.Model.TransactionType;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.TransactionRepository;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.neobank.backend.Repository.AuditLogRepository auditLogRepository;

    @Mock
    private com.neobank.backend.Service.NotificationService notificationService;

    @InjectMocks
    private TransactionService transactionService;

    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(1L);
        user.setBalance(BigDecimal.ZERO);
    }

    @Test
    void testDepositIncreasesBalance() {
        // Arrange
        TransactionRequestDTO dto = new TransactionRequestDTO(1L, BigDecimal.valueOf(200), TransactionType.DEPOSIT, "Deposit test", null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        transactionService.createTransaction(dto);

        // Assert
        assertEquals(BigDecimal.valueOf(200), user.getBalance());
        verify(userRepository).save(user);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void testWithdrawalDecreasesBalance() {

        user.setBalance(BigDecimal.valueOf(300));
        TransactionRequestDTO dto = new TransactionRequestDTO(1L, BigDecimal.valueOf(100), TransactionType.WITHDRAWAL, "Withdraw test", null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));


        transactionService.createTransaction(dto);


        assertEquals(BigDecimal.valueOf(200), user.getBalance());
        verify(userRepository).save(user);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void testWithdrawalFailsIfInsufficientFunds() {

        user.setBalance(BigDecimal.valueOf(50));
        TransactionRequestDTO dto = new TransactionRequestDTO(1L, BigDecimal.valueOf(100), TransactionType.WITHDRAWAL, "Withdraw fail", null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));


        RuntimeException ex = assertThrows(RuntimeException.class, () -> transactionService.createTransaction(dto));
        assertEquals("Insufficient balance", ex.getMessage());
        assertEquals(BigDecimal.valueOf(50), user.getBalance());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testTransferUpdatesBothUsers() {

        User recipient = new User();
        recipient.setId(2L);
        recipient.setBalance(BigDecimal.valueOf(100));

        user.setBalance(BigDecimal.valueOf(500));
        TransactionRequestDTO dto = new TransactionRequestDTO(1L, BigDecimal.valueOf(200), TransactionType.TRANSFER, "Transfer test", 2L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));


        transactionService.createTransaction(dto);


        assertEquals(BigDecimal.valueOf(300), user.getBalance());
        assertEquals(BigDecimal.valueOf(300), recipient.getBalance());
        verify(userRepository, times(1)).save(user);
        verify(userRepository, times(1)).save(recipient);
        verify(transactionRepository).save(any(Transaction.class));
    }
}
