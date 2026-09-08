package com.neobank.backend.Controller;

import com.neobank.backend.DTO.ReportDTO;
import com.neobank.backend.Model.Transaction;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.TransactionRepository;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Service.ReportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    private final UserRepository userRepository;

    private final TransactionRepository transactionRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ReportDTO> getAdminReport() {
        return ResponseEntity.ok(reportService.getAdminReport());
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public void exportReport(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"admin_report.csv\"");

        ReportDTO report = reportService.getAdminReport();

        // Write CSV to response
        PrintWriter writer = response.getWriter();
        writer.println("Metric,Value");

        // Basic metrics
        writer.println("Total Users," + report.getTotalUsers());
        writer.println("Total Balance," + report.getTotalBalance());

        // Transaction counts
        writer.println();
        writer.println("Transaction Type,Count");
        for (Map.Entry<String, Long> entry : report.getTransactionCounts().entrySet()) {
            writer.println(entry.getKey() + "," + entry.getValue());
        }

        writer.flush();
        writer.close();
    }


    @GetMapping("/user/{userId}/export")
    @PreAuthorize("hasRole('ADMIN')")
    public void exportUserReport(@PathVariable Long userId, HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"user_" + userId + "_report.csv\"");

        // Fetch user and transactions
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Transaction> transactions = transactionRepository.findByUser(user);

        PrintWriter writer = response.getWriter();


        writer.println("User Report for:," + user.getFirstName() + " " + user.getLastName());
        writer.println("Email," + user.getEmail());
        writer.println("Status," + user.getStatus());
        writer.println("Balance," + user.getBalance());
        writer.println();


        writer.println("Transaction ID,Type,Amount,Timestamp");
        for (Transaction tx : transactions) {
            writer.println(
                    tx.getId() + "," +
                            tx.getType() + "," +
                            tx.getAmount() + "," +
                            tx.getTimestamp()
            );
        }

        writer.flush();
        writer.close();
    }



}
