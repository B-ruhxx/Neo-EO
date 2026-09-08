package com.neobank.backend.Service;

import com.neobank.backend.DTO.AuditLogDTO;
import com.neobank.backend.Mapper.AuditLogMapper;
import com.neobank.backend.Repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public List<AuditLogDTO> getAllLogs() {
        return auditLogRepository.findAll()
                .stream()
                .map(AuditLogMapper::toDTO)
                .collect(Collectors.toList());
    }
}
