package com.neobank.backend;

import com.neobank.backend.Model.Transaction;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.TransactionRepository;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Service.AdminService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private AdminService adminService;

    @Test
    void testGetTotalBalance() {

        User user1 = new User();
        user1.setBalance(BigDecimal.valueOf(100));

        User user2 = new User();
        user2.setBalance(BigDecimal.valueOf(200));

        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));


        BigDecimal totalBalance = adminService.getTotalBalance();


        assertEquals(BigDecimal.valueOf(300), totalBalance);
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testGetUserStats() {

        when(userRepository.countByStatus("ACTIVE")).thenReturn(5L);
        when(userRepository.countByStatus("FROZEN")).thenReturn(2L);
        when(userRepository.countByDeletedTrue()).thenReturn(1L);


        Map<String, Long> stats = adminService.getUserStats();


        assertEquals(5L, stats.get("active"));
        assertEquals(2L, stats.get("frozen"));
        assertEquals(1L, stats.get("deleted"));

        verify(userRepository, times(1)).countByStatus("ACTIVE");
        verify(userRepository, times(1)).countByStatus("FROZEN");
        verify(userRepository, times(1)).countByDeletedTrue();
    }

    @Test
    void testGetRecentTransactions() {

        Transaction t1 = new Transaction();
        t1.setId(1L);
        Transaction t2 = new Transaction();
        t2.setId(2L);

        List<Transaction> transactions = Arrays.asList(t1, t2);

        when(transactionRepository.findTopNTransactions(2)).thenReturn(transactions);


        List<Transaction> result = adminService.getRecentTransactions(2);


        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getId());
        verify(transactionRepository, times(1)).findTopNTransactions(2);
    }
}
