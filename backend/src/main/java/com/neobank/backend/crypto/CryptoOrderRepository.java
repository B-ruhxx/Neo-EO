package com.neobank.backend.crypto;

import com.neobank.backend.Model.User;
import com.neobank.backend.crypto.CryptoOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CryptoOrderRepository extends JpaRepository<CryptoOrder, Long> {
    List<CryptoOrder> findByUserOrderByCreatedAtDesc(User user);
}
