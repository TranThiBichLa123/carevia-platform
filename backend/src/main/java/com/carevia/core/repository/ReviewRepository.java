package com.carevia.core.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Review;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long>, JpaSpecificationExecutor<Review> {

    interface DeviceAspectAverages {
        Double getEffectivenessScore();
        Double getSafetyScore();
        Double getErgonomicsScore();
        Double getDurabilityScore();
    }

    interface DeviceAspectAverageRow extends DeviceAspectAverages {
        Long getDeviceId();
    }

    @EntityGraph(attributePaths = { "account" })
    Page<Review> findByDeviceIdAndIsHiddenFalse(Long deviceId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.device.id = :deviceId AND r.isHidden = false")
    Optional<Double> findAverageRatingByDeviceId(@Param("deviceId") Long deviceId);

    long countByDeviceIdAndIsHiddenFalse(Long deviceId);

    long countByDeviceId(Long deviceId);

    @Query("""
            SELECT
                COALESCE(AVG(r.effectivenessRating), 0) AS effectivenessScore,
                COALESCE(AVG(r.safetyRating), 0) AS safetyScore,
                COALESCE(AVG(r.ergonomicsRating), 0) AS ergonomicsScore,
                COALESCE(AVG(r.durabilityRating), 0) AS durabilityScore
            FROM Review r
            WHERE r.device.id = :deviceId AND r.isHidden = false
            """)
    DeviceAspectAverages findAspectAveragesByDeviceId(@Param("deviceId") Long deviceId);

    @Query("""
            SELECT
                r.device.id AS deviceId,
                COALESCE(AVG(r.effectivenessRating), 0) AS effectivenessScore,
                COALESCE(AVG(r.safetyRating), 0) AS safetyScore,
                COALESCE(AVG(r.ergonomicsRating), 0) AS ergonomicsScore,
                COALESCE(AVG(r.durabilityRating), 0) AS durabilityScore
            FROM Review r
            WHERE r.device.id IN :deviceIds AND r.isHidden = false
            GROUP BY r.device.id
            """)
    List<DeviceAspectAverageRow> findAspectAveragesByDeviceIds(@Param("deviceIds") Collection<Long> deviceIds);

    boolean existsByAccountIdAndDeviceId(Long accountId, Long deviceId);
}
