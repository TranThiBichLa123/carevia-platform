package com.carevia.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Voucher;
import com.carevia.shared.constant.VoucherStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long>, JpaSpecificationExecutor<Voucher> {
    Optional<Voucher> findByCode(String code);
    List<Voucher> findByStatus(VoucherStatus status);
    boolean existsByCode(String code);
    List<Voucher> findByApplicableDeviceId(Long deviceId);
}
