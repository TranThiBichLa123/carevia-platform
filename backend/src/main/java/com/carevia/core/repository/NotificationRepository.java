package com.carevia.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Notification;
import com.carevia.shared.constant.NotificationStatus;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

    Page<Notification> findByAccountIdAndStatusOrderByCreatedAtDesc(Long accountId, NotificationStatus status, Pageable pageable);

    long countByAccountIdAndStatus(Long accountId, NotificationStatus status);

    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ' WHERE n.account.id = :accountId AND n.status = 'UNREAD'")
    int markAllAsRead(@Param("accountId") Long accountId);
}
