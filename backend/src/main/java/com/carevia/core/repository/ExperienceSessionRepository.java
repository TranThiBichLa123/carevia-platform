package com.carevia.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.ExperienceSession;
import com.carevia.shared.constant.SessionStatus;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExperienceSessionRepository extends JpaRepository<ExperienceSession, Long>, JpaSpecificationExecutor<ExperienceSession> {

    List<ExperienceSession> findByDeviceIdAndSessionDate(Long deviceId, LocalDate date);

    List<ExperienceSession> findByDeviceIdAndStatus(Long deviceId, SessionStatus status);

    @Query("SELECT s FROM ExperienceSession s WHERE s.device.id = :deviceId AND s.sessionDate >= :fromDate AND s.status = 'OPEN'")
    List<ExperienceSession> findAvailableSessions(@Param("deviceId") Long deviceId, @Param("fromDate") LocalDate fromDate);

    Page<ExperienceSession> findByAssignedStaffId(Long staffId, Pageable pageable);

    @Query("SELECT s FROM ExperienceSession s WHERE s.sessionDate = :date AND s.status IN ('OPEN', 'FULL')")
    List<ExperienceSession> findSessionsByDate(@Param("date") LocalDate date);
}
