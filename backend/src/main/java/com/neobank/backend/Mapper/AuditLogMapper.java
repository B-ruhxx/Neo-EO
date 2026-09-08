package com.neobank.backend.Mapper;

import com.neobank.backend.DTO.AuditLogDTO;
import com.neobank.backend.Model.AuditLog;

public class AuditLogMapper {
    public static AuditLogDTO toDTO(AuditLog auditLog) {
        return new AuditLogDTO(
                auditLog.getAction(),
                auditLog.getPerformedBy(),
                auditLog.getDescription(),
                auditLog.getTimeStamp()
        );
    }
}
