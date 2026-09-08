package com.neobank.backend.crypto;


import com.neobank.backend.Model.User;
import com.neobank.backend.crypto.CryptoHolding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CryptoHoldingRepository extends JpaRepository<CryptoHolding, Long> {
    Optional<CryptoHolding> findByUserAndSymbol(User user, String symbol);
    List<CryptoHolding> findByUser(User user);
}
