package com.neobank.backend.Repository;

import com.neobank.backend.Model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByOrderByCreatedAtDesc();
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByStatus(String status);
}
