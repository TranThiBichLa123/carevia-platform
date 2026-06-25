package com.carevia.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.Device;
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
import java.time.Instant;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final DeviceRepository deviceRepository;
    private final StaffBrandAccessService staffBrandAccessService;

    public VoucherService(
            VoucherRepository voucherRepository,
            DeviceRepository deviceRepository,
            StaffBrandAccessService staffBrandAccessService) {
        this.voucherRepository = voucherRepository;
        this.deviceRepository = deviceRepository;
        this.staffBrandAccessService = staffBrandAccessService;
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
            Device device = deviceRepository.findById(request.getApplicableDeviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
            staffBrandAccessService.requireManageableDevice(device);
            voucher.setApplicableDevice(device);
        } else if (!staffBrandAccessService.hasGlobalAccess()) {
            throw new InvalidRequestException("Staff must attach vouchers to a device in their own brand");
        }

        return toResponse(voucherRepository.save(voucher));
    }

    public List<VoucherResponse> getAllVouchers() {
        if (staffBrandAccessService.hasGlobalAccess()) {
            return voucherRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        }

        return voucherRepository.findAll().stream()
                .filter(staffBrandAccessService::belongsToCurrentBrand)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<VoucherResponse> getActiveVouchers() {
        // Chỉ lấy các voucher có trạng thái ACTIVE và ngày kết thúc sau thời điểm hiện
        // tại
        return voucherRepository.findByStatusAndEndDateAfter(VoucherStatus.ACTIVE, Instant.now()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
        staffBrandAccessService.requireManageableVoucher(voucher);

        VoucherStatus nextStatus = VoucherStatus.valueOf(status);

        // Nếu staff bấm kích hoạt lại (ACTIVE), phải kiểm tra xem voucher đã quá hạn
        // hay chưa
        if (nextStatus == VoucherStatus.ACTIVE && voucher.getEndDate() != null
                && voucher.getEndDate().isBefore(Instant.now())) {
            throw new InvalidRequestException(
                    "Không thể kích hoạt voucher đã quá hạn! Vui lòng gia hạn ngày kết thúc trước.");
        }

        voucher.setStatus(nextStatus);
        return toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse assignVoucherToDevice(Long voucherId, Long deviceId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        staffBrandAccessService.requireManageableDevice(device);
        if (voucher.getApplicableDevice() != null) {
            staffBrandAccessService.requireManageableVoucher(voucher);
        }

        if (voucher.getStatus() == VoucherStatus.EXPIRED || voucher.getStatus() == VoucherStatus.USED_UP) {
            throw new InvalidRequestException("Voucher is no longer assignable to a device");
        }
        if (voucher.getEndDate() != null && voucher.getEndDate().isBefore(Instant.now())) {
            throw new InvalidRequestException("Voucher has already expired");
        }

        voucher.setApplicableDevice(device);
        return toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse removeVoucherFromDevice(Long voucherId, Long deviceId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
        staffBrandAccessService.requireManageableVoucher(voucher);

        if (voucher.getApplicableDevice() == null || !voucher.getApplicableDevice().getId().equals(deviceId)) {
            throw new InvalidRequestException("Voucher is not assigned to this device");
        }

        voucher.setApplicableDevice(null);
        return toResponse(voucherRepository.save(voucher));
    }

    public List<VoucherResponse> getVouchersForDevice(Long deviceId) {
        deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        Instant now = Instant.now(); // Lấy thời gian hiện tại

        return voucherRepository.findAll().stream()
                .filter(voucher -> voucher.getApplicableDevice() == null
                        || voucher.getApplicableDevice().getId().equals(deviceId))
                // Sửa điều kiện lọc: Phải ACTIVE và ngày kết thúc phải sau thời điểm hiện tại
                .filter(voucher -> voucher.getStatus() == VoucherStatus.ACTIVE && voucher.getEndDate().isAfter(now))
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
                .applicableDeviceImage(v.getApplicableDevice() != null ? v.getApplicableDevice().getImage() : null)
                .applicableCategoryId(v.getApplicableCategoryId())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
