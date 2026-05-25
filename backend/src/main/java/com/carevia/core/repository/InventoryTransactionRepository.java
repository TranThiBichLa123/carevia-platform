package com.carevia.core.repository;

import com.carevia.core.domain.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    Page<InventoryTransaction> findByDeviceIdOrderByCreatedAtDesc(Long deviceId, Pageable pageable);

    Page<InventoryTransaction> findByDeviceIdAndDeviceBrandIdOrderByCreatedAtDesc(Long deviceId, Long brandId, Pageable pageable);

    Page<InventoryTransaction> findByDeviceBrandIdOrderByCreatedAtDesc(Long brandId, Pageable pageable);

    Page<InventoryTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);
}