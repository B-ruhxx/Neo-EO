package com.neobank.backend.Repository;

import com.neobank.backend.Model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    java.util.List<AuditLog> findAllByOrderByTimeStampDesc(org.springframework.data.domain.Pageable pageable);
}
