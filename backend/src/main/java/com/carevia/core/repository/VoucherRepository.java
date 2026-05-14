package com.carevia.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Voucher;
import com.carevia.shared.constant.VoucherStatus;

import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long>, JpaSpecificationExecutor<Voucher> {
    Optional<Voucher> findByCode(String code);
    List<Voucher> findByStatus(VoucherStatus status);
    boolean existsByCode(String code);
    List<Voucher> findByApplicableDeviceId(Long deviceId);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(v) FROM Voucher v WHERE v.status = com.carevia.shared.constant.VoucherStatus.ACTIVE AND v.endDate BETWEEN :now AND :threshold")
        long countExpiringBetween(@org.springframework.data.repository.query.Param("now") Instant now,
            @org.springframework.data.repository.query.Param("threshold") Instant threshold);

        @org.springframework.data.jpa.repository.Query("SELECT v FROM Voucher v WHERE v.status = com.carevia.shared.constant.VoucherStatus.ACTIVE AND v.endDate BETWEEN :now AND :threshold ORDER BY v.endDate ASC")
        List<Voucher> findExpiringBetween(@org.springframework.data.repository.query.Param("now") Instant now,
            @org.springframework.data.repository.query.Param("threshold") Instant threshold,
            Pageable pageable);
}
