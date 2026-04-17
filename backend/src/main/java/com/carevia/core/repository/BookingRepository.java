package com.carevia.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Booking;
import com.carevia.shared.constant.BookingStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    Optional<Booking> findByBookingCode(String bookingCode);

    Page<Booking> findByAccountId(Long accountId, Pageable pageable);

    Page<Booking> findByAccountIdAndStatus(Long accountId, BookingStatus status, Pageable pageable);

    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.account.id = :accountId AND b.appointmentDate = :date AND b.status NOT IN ('CANCELLED', 'EXPIRED')")
    long countByAccountAndDate(@Param("accountId") Long accountId, @Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.account.id = :accountId AND b.session.id = :sessionId AND b.status NOT IN ('CANCELLED', 'EXPIRED')")
    List<Booking> findConflictingBookings(@Param("accountId") Long accountId, @Param("sessionId") Long sessionId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING_CONFIRM' AND b.createdAt < :threshold")
    List<Booking> findExpiredPendingBookings(@Param("threshold") Instant threshold);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.session.assignedStaff.id = :staffId AND b.status = 'COMPLETED'")
    long countCompletedByStaff(@Param("staffId") Long staffId);

    @Query("SELECT b FROM Booking b WHERE b.appointmentDate BETWEEN :startDate AND :endDate")
    List<Booking> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
