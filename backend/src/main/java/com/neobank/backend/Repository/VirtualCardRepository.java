package com.neobank.backend.Repository;


import com.neobank.backend.Model.User;
import com.neobank.backend.Model.VirtualCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VirtualCardRepository extends JpaRepository<VirtualCard, Long> {

    List<VirtualCard> findByUser(User user);
}
