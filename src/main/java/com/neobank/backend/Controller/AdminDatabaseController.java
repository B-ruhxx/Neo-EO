package com.neobank.backend.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin/database")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDatabaseController {

    private final JdbcTemplate jdbcTemplate;

    private static final Pattern FORBIDDEN_SQL = Pattern.compile(
            "\\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|GRANT|REVOKE|EXEC|CREATE)\\b",
            Pattern.CASE_INSENSITIVE
    );

    @GetMapping("/overview")
    public Map<String, Object> getDatabaseOverview() {
        Map<String, Object> result = new HashMap<>();
        result.put("databaseType", "H2 Database Engine (Embedded)");
        result.put("databaseUrl", "jdbc:h2:file:./data/testdb");
        result.put("h2ConsoleUrl", "/h2-console");
        result.put("status", "ONLINE");
        result.put("environment", "Production / Development Standalone");

        List<Map<String, Object>> tablesList = new ArrayList<>();

        try {
            List<String> discoveredTables = jdbcTemplate.queryForList(
                    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME",
                    String.class
            );

            for (String table : discoveredTables) {
                Map<String, Object> tableInfo = new HashMap<>();
                tableInfo.put("name", table);
                tableInfo.put("tableName", table);

                try {
                    Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM \"" + table + "\"", Long.class);
                    tableInfo.put("rowCount", count != null ? count : 0);

                    List<String> colNames = jdbcTemplate.queryForList(
                            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
                            String.class,
                            table
                    );
                    tableInfo.put("columns", colNames);
                    tableInfo.put("exists", true);
                } catch (Exception e) {
                    tableInfo.put("rowCount", 0);
                    tableInfo.put("columns", Collections.emptyList());
                    tableInfo.put("exists", false);
                }
                tablesList.add(tableInfo);
            }
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }

        result.put("tables", tablesList);
        return result;
    }

    @GetMapping("/tables/{tableName}")
    public ResponseEntity<?> getTableData(
            @PathVariable String tableName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        String cleanName = tableName.trim().toUpperCase();

        try {
            Long totalElements = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM \"" + cleanName + "\"", Long.class);
            if (totalElements == null) totalElements = 0L;

            List<String> columns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
                    String.class,
                    cleanName
            );

            int offset = Math.max(0, page) * Math.max(1, size);
            String querySql;
            List<Map<String, Object>> rows;

            if (search != null && !search.trim().isEmpty() && !columns.isEmpty()) {
                StringBuilder where = new StringBuilder(" WHERE ");
                List<Object> params = new ArrayList<>();
                for (int i = 0; i < columns.size(); i++) {
                    if (i > 0) where.append(" OR ");
                    where.append("CAST(\"").append(columns.get(i)).append("\" AS VARCHAR) ILIKE ?");
                    params.add("%" + search.trim() + "%");
                }
                params.add(size);
                params.add(offset);

                querySql = "SELECT * FROM \"" + cleanName + "\"" + where + " LIMIT ? OFFSET ?";
                rows = jdbcTemplate.queryForList(querySql, params.toArray());

                Long filteredTotal = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM \"" + cleanName + "\"" + where,
                        Long.class,
                        params.subList(0, params.size() - 2).toArray()
                );
                totalElements = filteredTotal != null ? filteredTotal : 0L;
            } else {
                querySql = "SELECT * FROM \"" + cleanName + "\" LIMIT ? OFFSET ?";
                rows = jdbcTemplate.queryForList(querySql, size, offset);
            }

            int totalPages = (int) Math.ceil((double) totalElements / size);

            Map<String, Object> response = new HashMap<>();
            response.put("tableName", cleanName);
            response.put("columns", columns);
            response.put("rows", rows);
            response.put("page", page);
            response.put("size", size);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "No se pudo consultar la tabla: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/query")
    public ResponseEntity<?> executeQuery(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "La consulta SQL no puede estar vacía."));
        }

        String trimmed = query.trim();

        if (!trimmed.toUpperCase().startsWith("SELECT") && !trimmed.toUpperCase().startsWith("EXPLAIN")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Operación bloqueada: Solo se permiten consultas de lectura (SELECT / EXPLAIN)."));
        }

        if (FORBIDDEN_SQL.matcher(trimmed).find()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Sentencia no autorizada detectada (DROP, DELETE, UPDATE, etc. están prohibidos)."));
        }

        // Limpiar punto y coma final
        String cleanQuery = trimmed.replaceAll(";+\\s*$", "");

        // Auto-limit si no tiene LIMIT
        if (!cleanQuery.toUpperCase().contains(" LIMIT ")) {
            cleanQuery += " LIMIT 50";
        }

        long start = System.currentTimeMillis();
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(cleanQuery);
            long elapsed = System.currentTimeMillis() - start;

            List<String> columns = rows.isEmpty() ? Collections.emptyList() : new ArrayList<>(rows.get(0).keySet());

            Map<String, Object> res = new HashMap<>();
            res.put("columns", columns);
            res.put("rows", rows);
            res.put("rowCount", rows.size());
            res.put("executionTimeMs", elapsed);
            res.put("query", cleanQuery);

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error SQL: " + e.getMessage()));
        }
    }
}
