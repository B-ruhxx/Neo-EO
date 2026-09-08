package com.neobank.backend.Repository;

import com.neobank.backend.Model.ScheduledPayment;
import com.neobank.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduledPaymentRepository extends JpaRepository<ScheduledPayment, Long> {
    List<ScheduledPayment> findByUserOrderByNextExecutionDateAsc(User user);
    List<ScheduledPayment> findByStatusAndNextExecutionDateLessThanEqual(ScheduledPayment.PaymentStatus status, LocalDate date);
}
