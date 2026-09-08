package com.neobank.backend.Service;


import com.neobank.backend.DTO.ReportDTO;
import com.neobank.backend.Model.TransactionType;
import com.neobank.backend.Repository.TransactionRepository;
import com.neobank.backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public ReportDTO getAdminReport() {

        long totalUsers = userRepository.count();


        BigDecimal totalBalance = userRepository.findAll().stream()
                .map(user -> user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);


        Map<String, Long> transactionCounts = new HashMap<>();
        for (TransactionType type : TransactionType.values()) {
            long count = transactionRepository.countByType(type);
            transactionCounts.put(type.name(), count);
        }

        return new ReportDTO(totalUsers, totalBalance, transactionCounts);
    }
}
