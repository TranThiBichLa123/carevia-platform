package com.carevia.core.repository;

import com.carevia.core.domain.Refund;
import com.carevia.shared.constant.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    List<Refund> findByOrderId(Long orderId);

    List<Refund> findByBookingId(Long bookingId);

    Optional<Refund> findTopByOrderIdOrderByRequestedAtDesc(Long orderId);

    Optional<Refund> findTopByBookingIdOrderByRequestedAtDesc(Long bookingId);

    @Query("SELECT r FROM Refund r WHERE (r.order.account.id = :accountId OR r.booking.account.id = :accountId) ORDER BY r.requestedAt DESC")
    List<Refund> findByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT r FROM Refund r WHERE r.order.account.id = :accountId ORDER BY r.requestedAt DESC")
    List<Refund> findByOrderAccountId(@Param("accountId") Long accountId);

    @Query("SELECT r FROM Refund r WHERE r.booking.account.id = :accountId ORDER BY r.requestedAt DESC")
    List<Refund> findByBookingAccountId(@Param("accountId") Long accountId);

    List<Refund> findByStatus(RefundStatus status);
}
