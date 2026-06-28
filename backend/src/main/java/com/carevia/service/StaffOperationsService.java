package com.carevia.service;


import com.carevia.core.domain.Device;
import com.carevia.core.domain.InventoryTransaction;
import com.carevia.core.domain.Brand;
import com.carevia.core.domain.Voucher;
import com.carevia.core.repository.BrandRepository;
import com.carevia.core.repository.BookingRepository;
import com.carevia.core.repository.DeviceRepository;
import com.carevia.core.repository.InventoryTransactionRepository;
import com.carevia.core.repository.OrderRepository;
import com.carevia.core.repository.VoucherRepository;
import com.carevia.shared.constant.BookingStatus;
import com.carevia.shared.constant.DeviceStatus;
import com.carevia.shared.constant.OrderStatus;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.device.CreateDeviceRequest;
import com.carevia.shared.dto.request.device.UpdateDeviceRequest;
import com.carevia.shared.dto.request.staff.AdjustInventoryRequest;
import com.carevia.shared.dto.request.staff.UpdateStaffBrandRequest;
import com.carevia.shared.dto.request.staff.UpdateMaintenanceRequest;
import com.carevia.shared.dto.response.device.BrandResponse;
import com.carevia.shared.dto.response.device.DeviceImageUploadResponse;
import com.carevia.shared.dto.response.device.DeviceResponse;
import com.carevia.shared.dto.response.staff.InventoryTransactionResponse;
import com.carevia.shared.dto.response.staff.StaffDashboardResponse;
import com.carevia.shared.dto.response.voucher.VoucherResponse;
import com.carevia.shared.exception.InvalidFileException;
import com.carevia.shared.exception.InvalidRequestException;
import com.carevia.shared.exception.ResourceNotFoundException;
import com.carevia.service.storage.CloudinaryStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
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
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class StaffOperationsService {


    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final int DASHBOARD_ALERT_LIMIT = 5;
    private static final int VOUCHER_EXPIRY_DAYS = 7;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");


    private final BrandRepository brandRepository;
    private final DeviceRepository deviceRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final VoucherRepository voucherRepository;
    private final DeviceService deviceService;
    private final VoucherService voucherService;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final StaffBrandAccessService staffBrandAccessService;


    @Value("${app.avatar.max-size-bytes}")
    private long maxSizeBytes;


    public StaffOperationsService(
            BrandRepository brandRepository,
            DeviceRepository deviceRepository,
            InventoryTransactionRepository inventoryTransactionRepository,
            BookingRepository bookingRepository,
            OrderRepository orderRepository,
            VoucherRepository voucherRepository,
            DeviceService deviceService,
            VoucherService voucherService,
            CloudinaryStorageService cloudinaryStorageService,
            StaffBrandAccessService staffBrandAccessService) {
        this.brandRepository = brandRepository;
        this.deviceRepository = deviceRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.bookingRepository = bookingRepository;
        this.orderRepository = orderRepository;
        this.voucherRepository = voucherRepository;
        this.deviceService = deviceService;
        this.voucherService = voucherService;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.staffBrandAccessService = staffBrandAccessService;
    }


    public PageResponse<DeviceResponse> getStaffDevices(
            String search,
            DeviceStatus status,
            Boolean lowStockOnly,
            Boolean maintenanceOnly,
            Pageable pageable) {
        Specification<Device> spec = (root, query, cb) -> cb.isNull(root.get("deletedAt"));
        Long scopedBrandId = staffBrandAccessService.getScopedBrandIdOrNull();


        if (scopedBrandId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("brand").get("id"), scopedBrandId));
        }


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
        Long scopedBrandId = staffBrandAccessService.getScopedBrandIdOrNull();
        if (scopedBrandId == null) {
            return deviceService.getAllBrands();
        }


        return deviceService.getAllBrands().stream()
                .filter(brand -> brand instanceof com.carevia.shared.dto.response.device.BrandResponse
                        && ((com.carevia.shared.dto.response.device.BrandResponse) brand).getId().equals(scopedBrandId))
                .collect(Collectors.toList());
    }


    public List<VoucherResponse> getVouchers() {
        return voucherService.getAllVouchers();
    }


    public BrandResponse getMyBrand() {
        return deviceService.toBrandResponse(staffBrandAccessService.requireCurrentStaffBrand());
    }


    @Transactional
    public BrandResponse updateMyBrand(UpdateStaffBrandRequest request) {
        Brand brand = brandRepository.findById(staffBrandAccessService.requireCurrentStaffBrand().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));


        brand.setName(request.getName().trim());
        brand.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        brand.setSlug(generateUniqueBrandSlug(brand.getId(), request.getName()));


        return deviceService.toBrandResponse(brandRepository.save(brand));
    }


    @Transactional
    public DeviceImageUploadResponse uploadMyBrandImage(MultipartFile file) {
        validateImageFile(file);


        Brand brand = brandRepository.findById(staffBrandAccessService.requireCurrentStaffBrand().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));


        CloudinaryStorageService.UploadResult uploadResult = cloudinaryStorageService.uploadBrandImage(
                file,
                brand.getId(),
                brand.getImagePublicId());


        brand.setImage(uploadResult.getUrl());
        brand.setImagePublicId(uploadResult.getPublicId());
        brandRepository.save(brand);


        return DeviceImageUploadResponse.builder()
                .imageUrl(uploadResult.getUrl())
                .imagePublicId(uploadResult.getPublicId())
                .build();
    }


    @Transactional
    public DeviceImageUploadResponse uploadDeviceImage(Long deviceId, String currentPublicId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("Image file is required");
        }


        String existingPublicId = currentPublicId;
        Device device = null;
        if (deviceId != null) {
            device = deviceRepository.findById(deviceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
            staffBrandAccessService.requireManageableDevice(device);
            if (existingPublicId == null || existingPublicId.isBlank()) {
                existingPublicId = device.getImagePublicId();
            }
        }


        CloudinaryStorageService.UploadResult uploadResult = cloudinaryStorageService.uploadDeviceImage(
                file,
                deviceId,
                existingPublicId);


        if (device != null) {
            device.setImage(uploadResult.getUrl());
            device.setImagePublicId(uploadResult.getPublicId());
            deviceRepository.save(device);
        }


        return DeviceImageUploadResponse.builder()
                .imageUrl(uploadResult.getUrl())
                .imagePublicId(uploadResult.getPublicId())
                .build();
    }


    @Transactional
    public DeviceResponse createDevice(CreateDeviceRequest request) {
        if (!staffBrandAccessService.hasGlobalAccess()) {
            Long brandId = staffBrandAccessService.requireCurrentStaffBrand().getId();
            if (request.getBrandId() != null && !request.getBrandId().equals(brandId)) {
                throw new InvalidRequestException("You can only create devices for your own brand");
            }
            request.setBrandId(brandId);
        }
        return deviceService.createDevice(request);
    }


    @Transactional
    public DeviceResponse updateDevice(Long deviceId, UpdateDeviceRequest request) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        staffBrandAccessService.requireManageableDevice(device);


        if (!staffBrandAccessService.hasGlobalAccess()) {
            Long brandId = staffBrandAccessService.requireCurrentStaffBrand().getId();
            if (request.getBrandId() != null && !request.getBrandId().equals(brandId)) {
                throw new InvalidRequestException("You can only keep devices within your own brand");
            }
            request.setBrandId(brandId);
        }
        return deviceService.updateDevice(deviceId, request);
    }


    @Transactional
    public void deleteDevice(Long deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        staffBrandAccessService.requireManageableDevice(device);
        deviceService.deleteDevice(deviceId);
    }


    @Transactional
    public VoucherResponse assignVoucherToDevice(Long deviceId, Long voucherId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        staffBrandAccessService.requireManageableDevice(device);
        return voucherService.assignVoucherToDevice(voucherId, deviceId);
    }


    @Transactional
    public VoucherResponse removeVoucherFromDevice(Long deviceId, Long voucherId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        staffBrandAccessService.requireManageableDevice(device);
        return voucherService.removeVoucherFromDevice(voucherId, deviceId);
    }


    @Transactional
    public DeviceResponse adjustInventory(Long deviceId, AdjustInventoryRequest request) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        staffBrandAccessService.requireManageableDevice(device);


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
        staffBrandAccessService.requireManageableDevice(device);


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
        Long scopedBrandId = staffBrandAccessService.getScopedBrandIdOrNull();
        Page<InventoryTransaction> page;
        if (scopedBrandId == null) {
            page = deviceId != null
                    ? inventoryTransactionRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId, pageable)
                    : inventoryTransactionRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            page = deviceId != null
                    ? inventoryTransactionRepository.findByDeviceIdAndDeviceBrandIdOrderByCreatedAtDesc(deviceId,
                            scopedBrandId, pageable)
                    : inventoryTransactionRepository.findByDeviceBrandIdOrderByCreatedAtDesc(scopedBrandId, pageable);
        }


        return PageResponse.<InventoryTransactionResponse>builder()
                .items(page.getContent().stream().map(this::toInventoryTransactionResponse)
                        .collect(Collectors.toList()))
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
        Long scopedBrandId = staffBrandAccessService.getScopedBrandIdOrNull();


        List<StaffDashboardResponse.DeviceAlert> lowStockAlerts = deviceRepository.findAll(
                (root, query, cb) -> cb.and(
                        cb.isNull(root.get("deletedAt")),
                        scopedBrandId != null ? cb.equal(root.get("brand").get("id"), scopedBrandId) : cb.conjunction(),
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
                        scopedBrandId != null ? cb.equal(root.get("brand").get("id"), scopedBrandId) : cb.conjunction(),
                        cb.equal(root.get("status"), DeviceStatus.MAINTENANCE)),
                PageRequest.of(0, DASHBOARD_ALERT_LIMIT, Sort.by(Sort.Direction.DESC, "updatedAt")))
                .getContent()
                .stream()
                .map(this::toDeviceAlert)
                .collect(Collectors.toList());


        List<StaffDashboardResponse.VoucherAlert> voucherAlerts = voucherRepository.findAll(
                (root, query, cb) -> cb.and(
                        cb.equal(root.get("status"), com.carevia.shared.constant.VoucherStatus.ACTIVE),
                        cb.between(root.get("endDate"), now, voucherThreshold),
                        scopedBrandId != null
                                ? cb.equal(root.get("applicableDevice").get("brand").get("id"), scopedBrandId)
                                : cb.conjunction()),
                PageRequest.of(0, DASHBOARD_ALERT_LIMIT, Sort.by(Sort.Direction.ASC, "endDate")))
                .getContent()
                .stream()
                .map(this::toVoucherAlert)
                .collect(Collectors.toList());


        long pendingOrders = orderRepository.count((root, query, cb) -> {
            query.distinct(true);
            jakarta.persistence.criteria.Join<Object, Object> itemJoin = root.join("items");
            jakarta.persistence.criteria.Join<Object, Object> deviceJoin = itemJoin.join("device");
            return cb.and(
                    scopedBrandId != null ? cb.equal(deviceJoin.get("brand").get("id"), scopedBrandId)
                            : cb.conjunction(),
                    root.get("status").in(OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.PROCESSING));
        });


        // ==========================================
        // 🌟 TÍNH DOANH THU THÁNG HIỆN TẠI (CURRENT MONTH)
        // ==========================================
        LocalDate firstDayOfCurrentMonth = today.withDayOfMonth(1);
        java.time.ZoneId sysZone = java.time.ZoneId.systemDefault();


        // 1a. Đơn hàng Thiết bị - THÁNG NÀY
        java.math.BigDecimal currentDeviceRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus().name().matches("PAID|PROCESSING|SHIPPING|COMPLETED"))
                .filter(order -> order.getCreatedAt() != null
                        && !LocalDate.ofInstant(order.getCreatedAt(), sysZone).isBefore(firstDayOfCurrentMonth))
                .flatMap(order -> order.getItems().stream())
                .filter(item -> item.getDevice() != null && item.getDevice().getBrand() != null
                        && (scopedBrandId == null || scopedBrandId.equals(item.getDevice().getBrand().getId())))
                .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);


        // 1b. Lịch hẹn Dịch vụ - THÁNG NÀY
        java.math.BigDecimal currentBookingRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus().name().matches("CONFIRMED|CHECKED_IN|COMPLETED"))
                .filter(b -> b.getAppointmentDate() != null && !b.getAppointmentDate().isBefore(firstDayOfCurrentMonth))
                .filter(b -> b.getDevice() != null && b.getDevice().getBrand() != null
                        && (scopedBrandId == null || scopedBrandId.equals(b.getDevice().getBrand().getId())))
                .map(b -> b.getTotalPrice() != null ? b.getTotalPrice() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);


        java.math.BigDecimal currentMonthTotalRevenue = currentDeviceRevenue.add(currentBookingRevenue);


        // TỔNG TRỌN ĐỜI (Sử dụng logic cũ của bạn để lấy tổng tất cả thời gian)
        // TỔNG TRỌN ĐỜI (Sửa lỗi tại đây)
        java.math.BigDecimal totalDeviceRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus().name().matches("PAID|PROCESSING|SHIPPING|COMPLETED"))
                .flatMap(order -> order.getItems().stream())
                .filter(item -> item.getDevice() != null && item.getDevice().getBrand() != null
                        && (scopedBrandId == null || scopedBrandId.equals(item.getDevice().getBrand().getId())))
                .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);


        java.math.BigDecimal totalBookingRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus().name().matches("CONFIRMED|CHECKED_IN|COMPLETED"))
                .filter(b -> b.getDevice() != null && b.getDevice().getBrand() != null
                        && (scopedBrandId == null || scopedBrandId.equals(b.getDevice().getBrand().getId())))
                .map(b -> b.getTotalPrice() != null ? b.getTotalPrice() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);


        java.math.BigDecimal totalRevenue = totalDeviceRevenue.add(totalBookingRevenue);
        // ==========================================
        // 🌟 TÍNH DOANH THU THÁNG TRƯỚC (PREVIOUS MONTH)
        // ==========================================
        LocalDate firstDayOfLastMonth = firstDayOfCurrentMonth.minusMonths(1);
        LocalDate lastDayOfLastMonth = firstDayOfCurrentMonth.minusDays(1);


        // 2a. Đơn hàng Thiết bị - THÁNG TRƯỚC
        java.math.BigDecimal lastDeviceRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus().name().matches("PAID|PROCESSING|SHIPPING|COMPLETED"))
                .filter(order -> order.getCreatedAt() != null)
                .filter(order -> {
                    LocalDate date = LocalDate.ofInstant(order.getCreatedAt(), sysZone);
                    return !date.isBefore(firstDayOfLastMonth) && !date.isAfter(lastDayOfLastMonth);
                })
                .flatMap(order -> order.getItems().stream())
                .filter(item -> item.getDevice() != null && item.getDevice().getBrand() != null
                        && (scopedBrandId == null || scopedBrandId.equals(item.getDevice().getBrand().getId())))
                .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);


        // 2b. Lịch hẹn Dịch vụ - THÁNG TRƯỚC
        java.math.BigDecimal lastBookingRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus().name().matches("CONFIRMED|CHECKED_IN|COMPLETED"))
                .filter(b -> b.getAppointmentDate() != null && !b.getAppointmentDate().isBefore(firstDayOfLastMonth)
                        && !b.getAppointmentDate().isAfter(lastDayOfLastMonth))
                .filter(b -> b.getDevice() != null && b.getDevice().getBrand() != null
                        && (scopedBrandId == null || scopedBrandId.equals(b.getDevice().getBrand().getId())))
                .map(b -> b.getTotalPrice() != null ? b.getTotalPrice() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);


        java.math.BigDecimal lastMonthTotalRevenue = lastDeviceRevenue.add(lastBookingRevenue);


        // ==========================================
        // 🌟 TÍNH % BIẾN ĐỘNG CHÍNH XÁC
        // ==========================================
        java.math.BigDecimal revenueChangePercentage = java.math.BigDecimal.ZERO;
        if (lastMonthTotalRevenue.compareTo(java.math.BigDecimal.ZERO) > 0) {
            revenueChangePercentage = currentMonthTotalRevenue.subtract(lastMonthTotalRevenue)
                    .multiply(java.math.BigDecimal.valueOf(100))
                    .divide(lastMonthTotalRevenue, 2, java.math.RoundingMode.HALF_UP);
        } else if (currentMonthTotalRevenue.compareTo(java.math.BigDecimal.ZERO) > 0) {
            revenueChangePercentage = java.math.BigDecimal.valueOf(100.00);
        }
        // Đặt đoạn này ngay trước khi return builder trong getDashboard()
        List<StaffDashboardResponse.MonthlyRevenue> monthlyRevenueData = new java.util.ArrayList<>();
        LocalDate currentMonth = today.withDayOfMonth(1);


        for (int i = 3; i >= 0; i--) {
            LocalDate monthStart = currentMonth.minusMonths(i);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);


            // Tính Purchase Revenue (Order) cho tháng này
            java.math.BigDecimal mPurchase = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus().name().matches("PAID|PROCESSING|SHIPPING|COMPLETED"))
                    .filter(o -> {
                        LocalDate d = LocalDate.ofInstant(o.getCreatedAt(), java.time.ZoneId.systemDefault());
                        return !d.isBefore(monthStart) && !d.isAfter(monthEnd);
                    })
                    .flatMap(o -> o.getItems().stream())
                    .filter(item -> item.getDevice() != null
                            && (scopedBrandId == null || scopedBrandId.equals(item.getDevice().getBrand().getId())))
                    .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : java.math.BigDecimal.ZERO)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);


            // Tính Experience Revenue (Booking) cho tháng này
            java.math.BigDecimal mExp = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus().name().matches("CONFIRMED|CHECKED_IN|COMPLETED"))
                    .filter(b -> b.getAppointmentDate() != null && !b.getAppointmentDate().isBefore(monthStart)
                            && !b.getAppointmentDate().isAfter(monthEnd))
                    .filter(b -> b.getDevice() != null
                            && (scopedBrandId == null || scopedBrandId.equals(b.getDevice().getBrand().getId())))
                    .map(b -> b.getTotalPrice() != null ? b.getTotalPrice() : java.math.BigDecimal.ZERO)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);


            monthlyRevenueData.add(new StaffDashboardResponse.MonthlyRevenue(
                    monthStart.getMonthValue() + "/" + monthStart.getYear(),
                    mExp,
                    mPurchase));
        }


        return StaffDashboardResponse.builder()
                .date(today)
                .bookingsToday(bookingRepository.count((root, query, cb) -> cb.and(
                        cb.equal(root.get("appointmentDate"), today),
                        scopedBrandId != null ? cb.equal(root.get("device").get("brand").get("id"), scopedBrandId)
                                : cb.conjunction(),
                        cb.not(root.get("status").in(BookingStatus.CANCELLED, BookingStatus.EXPIRED)))))
                .pendingBookings(bookingRepository.count((root, query, cb) -> cb.and(
                        cb.equal(root.get("appointmentDate"), today),
                        cb.equal(root.get("status"), BookingStatus.PENDING_CONFIRM),
                        scopedBrandId != null ? cb.equal(root.get("device").get("brand").get("id"), scopedBrandId)
                                : cb.conjunction())))
                .checkedInToday(bookingRepository.count((root, query, cb) -> cb.and(
                        cb.equal(root.get("appointmentDate"), today),
                        cb.equal(root.get("status"), BookingStatus.CHECKED_IN),
                        scopedBrandId != null ? cb.equal(root.get("device").get("brand").get("id"), scopedBrandId)
                                : cb.conjunction())))
                .pendingOrders(pendingOrders)
                .lowStockDevices(deviceRepository.count((root, query, cb) -> cb.and(
                        cb.isNull(root.get("deletedAt")),
                        scopedBrandId != null ? cb.equal(root.get("brand").get("id"), scopedBrandId) : cb.conjunction(),
                        cb.notEqual(root.get("status"), DeviceStatus.INACTIVE),
                        cb.lessThanOrEqualTo(root.get("stock"), LOW_STOCK_THRESHOLD))))
                .maintenanceDevices(deviceRepository.count((root, query, cb) -> cb.and(
                        cb.isNull(root.get("deletedAt")),
                        scopedBrandId != null ? cb.equal(root.get("brand").get("id"), scopedBrandId) : cb.conjunction(),
                        cb.equal(root.get("status"), DeviceStatus.MAINTENANCE))))
                .vouchersExpiringSoon(voucherRepository.count((root, query, cb) -> cb.and(
                        cb.equal(root.get("status"), com.carevia.shared.constant.VoucherStatus.ACTIVE),
                        cb.between(root.get("endDate"), now, voucherThreshold),
                        scopedBrandId != null
                                ? cb.equal(root.get("applicableDevice").get("brand").get("id"), scopedBrandId)
                                : cb.conjunction())))
                .lowStockAlerts(lowStockAlerts)
                .maintenanceAlerts(maintenanceAlerts)
                .voucherAlerts(voucherAlerts)
                .totalRevenue(totalRevenue)
                .revenueChangePercentage(revenueChangePercentage)
                .monthlyRevenueData(monthlyRevenueData)
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


    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new InvalidFileException("Only JPG, PNG, WEBP are allowed");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new InvalidFileException("File size exceeds " + (maxSizeBytes / 1024 / 1024) + "MB");
        }
    }


    private String generateUniqueBrandSlug(Long brandId, String name) {
        String baseSlug = name.trim().toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (baseSlug.isBlank()) {
            baseSlug = "brand";
        }


        String candidate = baseSlug;
        int suffix = 2;
        while (brandRepository.findBySlug(candidate)
                .filter(existing -> !existing.getId().equals(brandId))
                .isPresent()) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }
        return candidate;
    }
}

