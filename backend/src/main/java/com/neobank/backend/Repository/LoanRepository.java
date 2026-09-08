package com.neobank.backend.Repository;

import com.neobank.backend.Model.Loan;
import com.neobank.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserOrderByCreatedAtDesc(User user);
    List<Loan> findAllByOrderByCreatedAtDesc();
    List<Loan> findByStatusOrderByCreatedAtDesc(Loan.LoanStatus status);
}
