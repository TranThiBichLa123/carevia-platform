package com.carevia.service;

import com.carevia.core.domain.Device;
import com.carevia.core.domain.InventoryTransaction;
import com.carevia.core.domain.Voucher;
import com.carevia.core.repository.BookingRepository;
import com.carevia.core.repository.DeviceRepository;
import com.carevia.core.repository.InventoryTransactionRepository;
import com.carevia.core.repository.OrderRepository;
import com.carevia.core.repository.VoucherRepository;
import com.carevia.shared.constant.BookingStatus;
import com.carevia.shared.constant.DeviceStatus;
import com.carevia.shared.constant.InventoryTransactionType;
import com.carevia.shared.constant.OrderStatus;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.device.CreateDeviceRequest;
import com.carevia.shared.dto.request.device.UpdateDeviceRequest;
import com.carevia.shared.dto.request.staff.AdjustInventoryRequest;
import com.carevia.shared.dto.request.staff.UpdateMaintenanceRequest;
import com.carevia.shared.dto.response.device.DeviceResponse;
import com.carevia.shared.dto.response.staff.InventoryTransactionResponse;
import com.carevia.shared.dto.response.staff.StaffDashboardResponse;
import com.carevia.shared.dto.response.voucher.VoucherResponse;
import com.carevia.shared.exception.InvalidRequestException;
import com.carevia.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffOperationsService {

    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final int DASHBOARD_ALERT_LIMIT = 5;
    private static final int VOUCHER_EXPIRY_DAYS = 7;

    private final DeviceRepository deviceRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final VoucherRepository voucherRepository;
    private final DeviceService deviceService;
    private final VoucherService voucherService;

    public StaffOperationsService(
            DeviceRepository deviceRepository,
            InventoryTransactionRepository inventoryTransactionRepository,
            BookingRepository bookingRepository,
            OrderRepository orderRepository,
            VoucherRepository voucherRepository,
            DeviceService deviceService,
            VoucherService voucherService) {
        this.deviceRepository = deviceRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.bookingRepository = bookingRepository;
        this.orderRepository = orderRepository;
        this.voucherRepository = voucherRepository;
        this.deviceService = deviceService;
        this.voucherService = voucherService;
    }

    public PageResponse<DeviceResponse> getStaffDevices(
            String search,
            DeviceStatus status,
            Boolean lowStockOnly,
            Boolean maintenanceOnly,
            Pageable pageable) {
        Specification<Device> spec = (root, query, cb) -> cb.isNull(root.get("deletedAt"));

        if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("sku")), like),
                    cb.like(cb.lower(root.get("slug")), like)));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (Boolean.TRUE.equals(lowStockOnly)) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("stock"), LOW_STOCK_THRESHOLD));
            spec = spec.and((root, query, cb) -> cb.notEqual(root.get("status"), DeviceStatus.INACTIVE));
        }
        if (Boolean.TRUE.equals(maintenanceOnly)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), DeviceStatus.MAINTENANCE));
        }

        Page<Device> page = deviceRepository.findAll(spec, pageable);
        return PageResponse.<DeviceResponse>builder()
                .items(page.getContent().stream().map(deviceService::toResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    public List<?> getDeviceCategories() {
        return deviceService.getAllCategories();
    }

    public List<?> getDeviceBrands() {
        return deviceService.getAllBrands();
    }

    public List<VoucherResponse> getVouchers() {
        return voucherService.getAllVouchers();
    }

    @Transactional
    public DeviceResponse createDevice(CreateDeviceRequest request) {
        return deviceService.createDevice(request);
    }

    @Transactional
    public DeviceResponse updateDevice(Long deviceId, UpdateDeviceRequest request) {
        return deviceService.updateDevice(deviceId, request);
    }

    @Transactional
    public void deleteDevice(Long deviceId) {
        deviceService.deleteDevice(deviceId);
    }

    @Transactional
    public VoucherResponse assignVoucherToDevice(Long deviceId, Long voucherId) {
        deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        return voucherService.assignVoucherToDevice(voucherId, deviceId);
    }

    @Transactional
    public VoucherResponse removeVoucherFromDevice(Long deviceId, Long voucherId) {
        deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        return voucherService.removeVoucherFromDevice(voucherId, deviceId);
    }

    @Transactional
    public DeviceResponse adjustInventory(Long deviceId, AdjustInventoryRequest request) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        int currentStock = device.getStock() != null ? device.getStock() : 0;
        int quantity = request.getQuantity() != null ? request.getQuantity() : 0;
        int newStock;
        int quantityChange;

        switch (request.getTransactionType()) {
            case IMPORT -> {
                if (quantity <= 0) {
                    throw new InvalidRequestException("Import quantity must be greater than 0");
                }
                quantityChange = quantity;
                newStock = currentStock + quantity;
            }
            case EXPORT -> {
                if (quantity <= 0) {
                    throw new InvalidRequestException("Export quantity must be greater than 0");
                }
                if (quantity > currentStock) {
                    throw new InvalidRequestException("Export quantity exceeds current stock");
                }
                quantityChange = -quantity;
                newStock = currentStock - quantity;
            }
            case AUDIT_ADJUSTMENT -> {
                quantityChange = quantity - currentStock;
                newStock = quantity;
            }
            default -> throw new InvalidRequestException("Unsupported inventory transaction type");
        }

        device.updateInventory(newStock);
        Device savedDevice = deviceRepository.save(device);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .device(savedDevice)
                .transactionType(request.getTransactionType())
                .quantityChange(quantityChange)
                .previousStock(currentStock)
                .newStock(newStock)
                .reason(request.getReason().trim())
                .note(request.getNote())
                .build();
        inventoryTransactionRepository.save(transaction);

        return deviceService.toResponse(savedDevice);
    }

    @Transactional
    public DeviceResponse updateMaintenance(Long deviceId, UpdateMaintenanceRequest request) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        boolean markCompleted = Boolean.TRUE.equals(request.getMarkCompleted());
        if (markCompleted) {
            device.completeMaintenance(
                    request.getMaintenanceEndDate() != null ? request.getMaintenanceEndDate() : LocalDate.now(),
                    request.getMaintenanceCost());
        } else {
            if (request.getMaintenanceReason() == null || request.getMaintenanceReason().isBlank()) {
                throw new InvalidRequestException("Maintenance reason is required when starting maintenance");
            }
            device.startMaintenance(
                    request.getMaintenanceReason().trim(),
                    request.getMaintenanceStartDate() != null ? request.getMaintenanceStartDate() : LocalDate.now(),
                    request.getMaintenanceEndDate(),
                    request.getMaintenanceCost());
        }

        return deviceService.toResponse(deviceRepository.save(device));
    }

    public PageResponse<InventoryTransactionResponse> getInventoryTransactions(Long deviceId, Pageable pageable) {
        Page<InventoryTransaction> page = deviceId != null
                ? inventoryTransactionRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId, pageable)
                : inventoryTransactionRepository.findAllByOrderByCreatedAtDesc(pageable);

        return PageResponse.<InventoryTransactionResponse>builder()
                .items(page.getContent().stream().map(this::toInventoryTransactionResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    public StaffDashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        Instant now = Instant.now();
        Instant voucherThreshold = now.plusSeconds(VOUCHER_EXPIRY_DAYS * 24L * 60L * 60L);

        List<StaffDashboardResponse.DeviceAlert> lowStockAlerts = deviceRepository.findAll(
                        (root, query, cb) -> cb.and(
                                cb.isNull(root.get("deletedAt")),
                                cb.lessThanOrEqualTo(root.get("stock"), LOW_STOCK_THRESHOLD),
                                cb.notEqual(root.get("status"), DeviceStatus.INACTIVE)),
                        PageRequest.of(0, DASHBOARD_ALERT_LIMIT, Sort.by(Sort.Direction.ASC, "stock")))
                .getContent()
                .stream()
                .map(this::toDeviceAlert)
                .collect(Collectors.toList());

        List<StaffDashboardResponse.DeviceAlert> maintenanceAlerts = deviceRepository.findAll(
                        (root, query, cb) -> cb.and(
                                cb.isNull(root.get("deletedAt")),
                                cb.equal(root.get("status"), DeviceStatus.MAINTENANCE)),
                        PageRequest.of(0, DASHBOARD_ALERT_LIMIT, Sort.by(Sort.Direction.DESC, "updatedAt")))
                .getContent()
                .stream()
                .map(this::toDeviceAlert)
                .collect(Collectors.toList());

        List<StaffDashboardResponse.VoucherAlert> voucherAlerts = voucherRepository
                .findExpiringBetween(now, voucherThreshold, PageRequest.of(0, DASHBOARD_ALERT_LIMIT))
                .stream()
                .map(this::toVoucherAlert)
                .collect(Collectors.toList());

        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT)
                + orderRepository.countByStatus(OrderStatus.PAID)
                + orderRepository.countByStatus(OrderStatus.PROCESSING);

        return StaffDashboardResponse.builder()
                .date(today)
                .bookingsToday(bookingRepository.countOperationalBookingsByDate(today))
                .pendingBookings(bookingRepository.countByAppointmentDateAndStatus(today, BookingStatus.PENDING_CONFIRM))
                .checkedInToday(bookingRepository.countByAppointmentDateAndStatus(today, BookingStatus.CHECKED_IN))
                .pendingOrders(pendingOrders)
                .lowStockDevices(deviceRepository.countLowStockDevices(LOW_STOCK_THRESHOLD))
                .maintenanceDevices(deviceRepository.countDevicesInMaintenance())
                .vouchersExpiringSoon(voucherRepository.countExpiringBetween(now, voucherThreshold))
                .lowStockAlerts(lowStockAlerts)
                .maintenanceAlerts(maintenanceAlerts)
                .voucherAlerts(voucherAlerts)
                .build();
    }

    private InventoryTransactionResponse toInventoryTransactionResponse(InventoryTransaction transaction) {
        return InventoryTransactionResponse.builder()
                .id(transaction.getId())
                .deviceId(transaction.getDevice().getId())
                .deviceName(transaction.getDevice().getName())
                .transactionType(transaction.getTransactionType())
                .quantityChange(transaction.getQuantityChange())
                .previousStock(transaction.getPreviousStock())
                .newStock(transaction.getNewStock())
                .reason(transaction.getReason())
                .note(transaction.getNote())
                .createdBy(transaction.getCreatedBy())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private StaffDashboardResponse.DeviceAlert toDeviceAlert(Device device) {
        return StaffDashboardResponse.DeviceAlert.builder()
                .deviceId(device.getId())
                .deviceName(device.getName())
                .stock(device.getStock())
                .status(device.getStatus().name())
                .maintenanceReason(device.getMaintenanceReason())
                .build();
    }

    private StaffDashboardResponse.VoucherAlert toVoucherAlert(Voucher voucher) {
        return StaffDashboardResponse.VoucherAlert.builder()
                .voucherId(voucher.getId())
                .code(voucher.getCode())
                .endDate(voucher.getEndDate())
                .remainingQuantity(voucher.getTotalQuantity() - voucher.getUsedQuantity())
                .build();
    }
}