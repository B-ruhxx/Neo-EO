package com.neobank.backend.Repository;

import com.neobank.backend.Model.Budget;
import com.neobank.backend.Model.TransactionCategory;
import com.neobank.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    List<Budget> findByUserAndMonthAndYear(User user, Integer month, Integer year);
    Optional<Budget> findByUserAndCategoryAndMonthAndYear(User user, TransactionCategory category, Integer month, Integer year);
}
