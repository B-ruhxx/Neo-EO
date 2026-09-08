package com.neobank.backend;

import com.neobank.backend.Model.Notification;
import com.neobank.backend.Model.User;
import com.neobank.backend.Repository.NotificationRepository;
import com.neobank.backend.Service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    private NotificationRepository notificationRepository;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationRepository = mock(NotificationRepository.class);
        notificationService = new NotificationService(notificationRepository);
    }

    @Test
    void createNotification_shouldSaveNotification() {
        User user = new User();
        user.setId(1L);

        notificationService.createNotification(user, "Test message");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getMessage()).isEqualTo("Test message");
        assertThat(saved.isRead()).isFalse();
    }

    @Test
    void getUserNotifications_shouldReturnNotifications() {
        User user = new User();
        user.setId(1L);

        Notification n1 = new Notification(1L, user, "Msg1", false, LocalDateTime.now());
        Notification n2 = new Notification(2L, user, "Msg2", true, LocalDateTime.now());

        when(notificationRepository.findByUserOrderByCreatedAtDesc(user))
                .thenReturn(Arrays.asList(n1, n2));

        List<Notification> notifications = notificationService.getUserNotifications(user);

        assertThat(notifications).hasSize(2);
        assertThat(notifications.get(0).getMessage()).isEqualTo("Msg1");
    }

    @Test
    void markAsRead_shouldUpdateNotification() {
        User user = new User();
        user.setId(1L);
        Notification notification = new Notification(1L, user, "Hello", false, LocalDateTime.now());

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));


        notificationService.markAsRead(1L);

        assertThat(notification.isRead()).isTrue();
        verify(notificationRepository).save(notification);
    }
}
