package com.neobank.backend.Repository;

import com.neobank.backend.Model.SecurityIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityIncidentRepository extends JpaRepository<SecurityIncident, Long> {
    List<SecurityIncident> findByOrderByCreatedAtDesc();
    List<SecurityIncident> findTop5ByOrderByCreatedAtDesc();
    long countByResolvedFalse();
    long countBySeverity(String severity);
}
