package com.neobank.backend.Repository;

import com.neobank.backend.Model.User;
import com.neobank.backend.Model.Vault;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VaultRepository extends JpaRepository<Vault, Long> {
    List<Vault> findByUserAndDeletedFalse(User user);
    Optional<Vault> findByIdAndUserAndDeletedFalse(Long id, User user);
}
