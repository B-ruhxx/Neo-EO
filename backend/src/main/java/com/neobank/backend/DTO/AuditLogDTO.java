package com.neobank.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuditLogDTO {

    private String action;
    private String performedBy;
    private String description;
    private LocalDateTime timestamp;


}
