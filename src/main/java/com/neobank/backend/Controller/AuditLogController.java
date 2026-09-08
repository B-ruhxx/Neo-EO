package com.neobank.backend.Controller;

import com.neobank.backend.DTO.AuditLogDTO;
import com.neobank.backend.Mapper.AuditLogMapper;
import com.neobank.backend.Model.AuditLog;
import com.neobank.backend.Repository.AuditLogRepository;
import com.neobank.backend.Service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {


    private final AuditLogService auditLogService;


    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<AuditLogDTO> getAllLogs() {
        return auditLogService.getAllLogs();
    }



}
