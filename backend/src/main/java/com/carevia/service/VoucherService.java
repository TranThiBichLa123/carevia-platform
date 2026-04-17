package com.carevia.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.Voucher;
import com.carevia.core.repository.DeviceRepository;
import com.carevia.core.repository.VoucherRepository;
import com.carevia.shared.constant.VoucherStatus;
import com.carevia.shared.constant.VoucherType;
import com.carevia.shared.dto.request.voucher.CreateVoucherRequest;
import com.carevia.shared.dto.response.voucher.VoucherResponse;
import com.carevia.shared.exception.InvalidRequestException;
import com.carevia.shared.exception.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final DeviceRepository deviceRepository;

    public VoucherService(VoucherRepository voucherRepository, DeviceRepository deviceRepository) {
        this.voucherRepository = voucherRepository;
        this.deviceRepository = deviceRepository;
    }

    @Transactional
    public VoucherResponse createVoucher(CreateVoucherRequest request) {
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new InvalidRequestException("Voucher code already exists");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new InvalidRequestException("End date must be after start date");
        }

        Voucher voucher = Voucher.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .voucherType(VoucherType.valueOf(request.getVoucherType()))
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscount(request.getMaxDiscount())
                .totalQuantity(request.getTotalQuantity())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .applicableCategoryId(request.getApplicableCategoryId())
                .build();

        if (request.getApplicableDeviceId() != null) {
            voucher.setApplicableDevice(deviceRepository.findById(request.getApplicableDeviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Device not found")));
        }

        return toResponse(voucherRepository.save(voucher));
    }

    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<VoucherResponse> getActiveVouchers() {
        return voucherRepository.findByStatus(VoucherStatus.ACTIVE).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public VoucherResponse getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
        return toResponse(voucher);
    }

    @Transactional
    public VoucherResponse updateVoucherStatus(Long id, String status) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
        voucher.setStatus(VoucherStatus.valueOf(status));
        return toResponse(voucherRepository.save(voucher));
    }

    public List<VoucherResponse> getVouchersForDevice(Long deviceId) {
        return voucherRepository.findByApplicableDeviceId(deviceId).stream()
                .filter(Voucher::isValid)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private VoucherResponse toResponse(Voucher v) {
        return VoucherResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .description(v.getDescription())
                .voucherType(v.getVoucherType())
                .discountValue(v.getDiscountValue())
                .minOrderValue(v.getMinOrderValue())
                .maxDiscount(v.getMaxDiscount())
                .totalQuantity(v.getTotalQuantity())
                .usedQuantity(v.getUsedQuantity())
                .remainingQuantity(v.getTotalQuantity() - v.getUsedQuantity())
                .startDate(v.getStartDate())
                .endDate(v.getEndDate())
                .status(v.getStatus())
                .applicableDeviceId(v.getApplicableDevice() != null ? v.getApplicableDevice().getId() : null)
                .applicableDeviceName(v.getApplicableDevice() != null ? v.getApplicableDevice().getName() : null)
                .applicableCategoryId(v.getApplicableCategoryId())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
