package com.carevia.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Device;
import com.carevia.shared.constant.DeviceStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long>, JpaSpecificationExecutor<Device> {
    Optional<Device> findBySlug(String slug);

    Page<Device> findByStatus(DeviceStatus status, Pageable pageable);

    Page<Device> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Device> findByBrandId(Long brandId, Pageable pageable);

    @Query("SELECT d FROM Device d WHERE d.status = 'AVAILABLE' AND d.deletedAt IS NULL")
    Page<Device> findAllAvailable(Pageable pageable);

    @Query("SELECT d FROM Device d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Device> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT d FROM Device d WHERE d.skinType LIKE %:skinType% AND d.status = 'AVAILABLE'")
    List<Device> findBySkinType(@Param("skinType") String skinType);

    @Query("SELECT d FROM Device d WHERE d.isBookingAvailable = true AND d.status = 'AVAILABLE'")
    List<Device> findBookableDevices();

    @Query("SELECT d FROM Device d WHERE d.status = 'AVAILABLE' ORDER BY d.viewCount DESC")
    List<Device> findPopularDevices(Pageable pageable);

    @Query("SELECT d FROM Device d WHERE d.status = 'AVAILABLE' ORDER BY d.sold DESC")
    List<Device> findBestSellingDevices(Pageable pageable);

    @Query("SELECT d FROM Device d WHERE d.category.id = :categoryId AND d.id != :deviceId AND d.status = 'AVAILABLE'")
    List<Device> findSimilarDevices(@Param("categoryId") Long categoryId, @Param("deviceId") Long deviceId, Pageable pageable);

    boolean existsBySlug(String slug);
}
