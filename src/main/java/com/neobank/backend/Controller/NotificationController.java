package com.neobank.backend.Controller;

import com.neobank.backend.DTO.NotificationDTO;
import com.neobank.backend.Model.Notification;
import com.neobank.backend.Model.User;
import com.neobank.backend.Service.NotificationService;
import com.neobank.backend.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(Principal principal) {
        User user = userService.getUserEntityByEmail(principal.getName());
        List<NotificationDTO> dtos = notificationService.getUserNotifications(user)
                .stream()
                .map(n -> new NotificationDTO(n.getId(), n.getMessage(), n.isRead(), n.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PatchMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Notification marked as read");
    }
}
