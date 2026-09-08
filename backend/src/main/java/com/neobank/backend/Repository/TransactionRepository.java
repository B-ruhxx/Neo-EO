package com.neobank.backend.Repository;


import com.neobank.backend.Model.Transaction;
import com.neobank.backend.Model.TransactionType;
import com.neobank.backend.Model.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser(User user);

    List<Transaction> findByUserAndTimestampBetween(User user, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByUserAndType(User user, String type);

    List<Transaction> findByUserAndAmountGreaterThan(User user, BigDecimal amount);

    List<Transaction> findByUserAndAmountLessThan(User user, BigDecimal amount);

    long countByType(TransactionType type);

    @Query("SELECT t FROM Transaction t ORDER BY t.timestamp DESC")
    List<Transaction> findTopNTransactions(Pageable pageable);

    default List<Transaction> findTopNTransactions(int limit) {
        return findTopNTransactions(PageRequest.of(0, limit));
    }

    @Query("SELECT DISTINCT t.recipient FROM Transaction t WHERE t.user = :user AND t.recipient IS NOT NULL AND t.recipient.deleted = false")
    List<User> findDistinctRecipientsByUser(@org.springframework.data.repository.query.Param("user") User user);
}
