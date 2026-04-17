package com.carevia.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.WishlistItem;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByAccountId(Long accountId);
    Optional<WishlistItem> findByAccountIdAndDeviceId(Long accountId, Long deviceId);
    boolean existsByAccountIdAndDeviceId(Long accountId, Long deviceId);
    void deleteByAccountIdAndDeviceId(Long accountId, Long deviceId);
}
