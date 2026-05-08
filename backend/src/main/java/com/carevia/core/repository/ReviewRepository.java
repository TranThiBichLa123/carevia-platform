package com.carevia.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Review;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByDeviceIdAndIsHiddenFalse(Long deviceId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.device.id = :deviceId AND r.isHidden = false")
    Optional<Double> findAverageRatingByDeviceId(@Param("deviceId") Long deviceId);

    long countByDeviceIdAndIsHiddenFalse(Long deviceId);

    boolean existsByAccountIdAndDeviceId(Long accountId, Long deviceId);
}
