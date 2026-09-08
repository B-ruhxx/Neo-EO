package com.neobank.backend.Repository;

import com.neobank.backend.Model.Loan;
import com.neobank.backend.Model.LoanPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanPaymentRepository extends JpaRepository<LoanPayment, Long> {
    List<LoanPayment> findByLoanOrderByPaymentDateAsc(Loan loan);
}
