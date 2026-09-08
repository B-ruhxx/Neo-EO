package com.neobank.backend;


import com.neobank.backend.Model.User;
import com.neobank.backend.Model.VirtualCard;
import com.neobank.backend.Repository.UserRepository;
import com.neobank.backend.Repository.VirtualCardRepository;
import com.neobank.backend.Service.VirtualCardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VirtualCardTests {

    @Mock
    private VirtualCardRepository virtualCardRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.neobank.backend.Service.NotificationService notificationService;

    @InjectMocks
    private VirtualCardService virtualCardService;

    private User testUser;
    private VirtualCard testCard;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testCard = VirtualCard.builder()
                .id(1L)
                .user(testUser)
                .cardNumber("4567123412341234")
                .cvv("123")
                .expiryDate(LocalDate.now().plusYears(3))
                .status(VirtualCard.CardStatus.ACTIVE)
                .build();
    }

    @Test
    void testCreateCard() {

        when(virtualCardRepository.save(any(VirtualCard.class))).thenReturn(testCard);


        VirtualCard createdCard = virtualCardService.createCard(testUser);


        assertNotNull(createdCard);
        assertEquals(testUser, createdCard.getUser());
        assertEquals(VirtualCard.CardStatus.ACTIVE, createdCard.getStatus());
        verify(virtualCardRepository, times(1)).save(any(VirtualCard.class));
    }

    @Test
    void testFreezeCard() {

        when(virtualCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(virtualCardRepository.save(any(VirtualCard.class))).thenReturn(testCard);


        VirtualCard frozenCard = virtualCardService.freezeCard(1L);


        assertEquals(VirtualCard.CardStatus.FROZEN, frozenCard.getStatus());
        verify(virtualCardRepository).save(testCard);
    }

    @Test
    void testUnfreezeCard() {

        testCard.setStatus(VirtualCard.CardStatus.FROZEN);
        when(virtualCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(virtualCardRepository.save(any(VirtualCard.class))).thenReturn(testCard);


        VirtualCard unfrozenCard = virtualCardService.unfreezeCard(1L);


        assertEquals(VirtualCard.CardStatus.ACTIVE, unfrozenCard.getStatus());
        verify(virtualCardRepository).save(testCard);
    }

    @Test
    void testDeleteCard() {

        when(virtualCardRepository.findById(1L)).thenReturn(Optional.of(testCard));


        virtualCardService.deleteCard(1L);


        assertEquals(VirtualCard.CardStatus.DELETED, testCard.getStatus());
        verify(virtualCardRepository).save(testCard);
    }

    @Test
    void testGetUserCards() {

        when(virtualCardRepository.findByUser(testUser)).thenReturn(List.of(testCard));


        List<VirtualCard> cards = virtualCardService.getUserCards(testUser);


        assertEquals(1, cards.size());
        assertEquals(testCard, cards.get(0));
        verify(virtualCardRepository).findByUser(testUser);
    }

    @Test
    void testFreezeCard_NotFound() {

        when(virtualCardRepository.findById(99L)).thenReturn(Optional.empty());


        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> virtualCardService.freezeCard(99L));
        assertEquals("Card not found", exception.getMessage());
    }
}
