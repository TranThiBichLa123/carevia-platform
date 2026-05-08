package com.carevia.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.shared.constant.DeviceStatus;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.device.CreateDeviceRequest;
import com.carevia.shared.dto.request.device.UpdateDeviceRequest;
import com.carevia.shared.dto.response.device.BrandResponse;
import com.carevia.shared.dto.response.device.DeviceResponse;
import com.carevia.shared.dto.response.device.ExperienceStepResponse;
import com.carevia.shared.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final DeviceExperienceStepRepository experienceStepRepository;

    private final WishlistRepository wishlistRepository;

    public DeviceService(DeviceRepository deviceRepository, CategoryRepository categoryRepository,
            BrandRepository brandRepository, DeviceExperienceStepRepository experienceStepRepository,
            WishlistRepository wishlistRepository) {
        this.deviceRepository = deviceRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.experienceStepRepository = experienceStepRepository;
        this.wishlistRepository = wishlistRepository;
    }

    public PageResponse<DeviceResponse> getAllDevices(Pageable pageable) {
        Page<Device> page = deviceRepository.findAllAvailable(pageable);
        return toPageResponse(page);
    }

    public PageResponse<DeviceResponse> getDevicesByCategory(Long categoryId, Pageable pageable) {
        Page<Device> page = deviceRepository.findByCategoryId(categoryId, pageable);
        return toPageResponse(page);
    }

    public PageResponse<DeviceResponse> getDevicesByBrand(Long brandId, Pageable pageable) {
        Page<Device> page = deviceRepository.findByBrandId(brandId, pageable);
        return toPageResponse(page);
    }

    public PageResponse<DeviceResponse> searchDevices(String keyword, Pageable pageable) {
        Page<Device> page = deviceRepository.searchByKeyword(keyword, pageable);
        return toPageResponse(page);
    }

    public List<String> getSkinTypes() {
        return deviceRepository.findDistinctSkinTypes();
    }

    public PageResponse<DeviceResponse> getFilteredDevices(
            String search, Long categoryId, Long brandId,
            BigDecimal minPrice, BigDecimal maxPrice, Boolean bookingAvailable,
            String skinType, Boolean onlyDiscounted, Pageable pageable) {

        Specification<Device> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("status"), DeviceStatus.AVAILABLE),
                cb.isNull(root.get("deletedAt"))
        );

        if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like)
            ));
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }
        if (brandId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("brand").get("id"), brandId));
        }
        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        if (bookingAvailable != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isBookingAvailable"), bookingAvailable));
        }
        if (skinType != null && !skinType.isBlank()) {
            String like = "%" + skinType.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("skinType")), like));
        }
        if (Boolean.TRUE.equals(onlyDiscounted)) {
            spec = spec.and((root, query, cb) -> cb.greaterThan(root.get("discountPercentage"), 0.0));
        }

        Page<Device> page = deviceRepository.findAll(spec, pageable);
        return toPageResponse(page);
    }

    public DeviceResponse getDeviceById(Long id) {
        // 1. Tìm device
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        // 2. Tăng view count (như cũ)
        device.incrementViewCount();
        deviceRepository.save(device);

        // 3. Chuyển sang DTO
        DeviceResponse response = toResponse(device);

        // 4. Đếm số lượt thích từ bảng wishlist và gán vào DTO (không lưu vào bảng
        // devices)
        long count = wishlistRepository.countByDeviceId(id);
        response.setWishlistCount(count);

        return response;
    }

    public DeviceResponse getDeviceBySlug(String slug) {
        Device device = deviceRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with slug: " + slug));
        device.incrementViewCount();
        deviceRepository.save(device);
        return toResponse(device);
    }

    @Transactional
    public DeviceResponse createDevice(CreateDeviceRequest request) {
        Device device = Device.builder()
                .name(request.getName())
                .slug(request.getSlug() != null ? request.getSlug() : generateSlug(request.getName()))
                .description(request.getDescription())
                .content(request.getContent())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice() != null ? request.getOriginalPrice() : request.getPrice())
                .discountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : 0.0)
                .stock(request.getStock() != null ? request.getStock() : 0)
                .image(request.getImage())
                .images(request.getImages() != null ? request.getImages() : List.of())
                .sku(request.getSku())
                .warrantyPeriod(request.getWarrantyPeriod())
                .warrantyPolicy(request.getWarrantyPolicy())
                .origin(request.getOrigin())
                .deviceCondition(request.getDeviceCondition() != null ? request.getDeviceCondition() : "new")
                .skinType(request.getSkinType())
                .skinConcerns(request.getSkinConcerns())
                .isBookingAvailable(request.getIsBookingAvailable() != null ? request.getIsBookingAvailable() : false)
                .bookingPrice(request.getBookingPrice())
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .videoUrl(request.getVideoUrl())
                .status(DeviceStatus.AVAILABLE)
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            device.setCategory(category);
        }
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
            device.setBrand(brand);
        }
        if (request.getSpecifications() != null) {
            device.setSpecifications(request.getSpecifications().stream()
                    .map(s -> DeviceSpecification.builder().label(s.getLabel()).value(s.getValue()).build())
                    .collect(Collectors.toList()));
        }

        return toResponse(deviceRepository.save(device));
    }

    @Transactional
    public DeviceResponse updateDevice(Long id, UpdateDeviceRequest request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        if (request.getName() != null)
            device.setName(request.getName());
        if (request.getDescription() != null)
            device.setDescription(request.getDescription());
        if (request.getContent() != null)
            device.setContent(request.getContent());
        if (request.getPrice() != null)
            device.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null)
            device.setOriginalPrice(request.getOriginalPrice());
        if (request.getDiscountPercentage() != null)
            device.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getStock() != null)
            device.setStock(request.getStock());
        if (request.getImage() != null)
            device.setImage(request.getImage());
        if (request.getImages() != null)
            device.setImages(request.getImages());
        if (request.getSku() != null)
            device.setSku(request.getSku());
        if (request.getWarrantyPeriod() != null)
            device.setWarrantyPeriod(request.getWarrantyPeriod());
        if (request.getWarrantyPolicy() != null)
            device.setWarrantyPolicy(request.getWarrantyPolicy());
        if (request.getOrigin() != null)
            device.setOrigin(request.getOrigin());
        if (request.getDeviceCondition() != null)
            device.setDeviceCondition(request.getDeviceCondition());
        if (request.getSkinType() != null)
            device.setSkinType(request.getSkinType());
        if (request.getSkinConcerns() != null)
            device.setSkinConcerns(request.getSkinConcerns());
        if (request.getIsBookingAvailable() != null)
            device.setIsBookingAvailable(request.getIsBookingAvailable());
        if (request.getBookingPrice() != null)
            device.setBookingPrice(request.getBookingPrice());
        if (request.getTags() != null)
            device.setTags(request.getTags());
        if (request.getVideoUrl() != null)
            device.setVideoUrl(request.getVideoUrl());
        if (request.getStatus() != null)
            device.setStatus(DeviceStatus.valueOf(request.getStatus()));
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            device.setCategory(category);
        }
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
            device.setBrand(brand);
        }
        if (request.getSpecifications() != null) {
            device.setSpecifications(request.getSpecifications().stream()
                    .map(s -> DeviceSpecification.builder().label(s.getLabel()).value(s.getValue()).build())
                    .collect(Collectors.toList()));
        }

        return toResponse(deviceRepository.save(device));
    }

    @Transactional
    public void deleteDevice(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        device.setStatus(DeviceStatus.INACTIVE);
        deviceRepository.save(device);
    }

    public List<DeviceResponse> getPopularDevices(int limit) {
        return deviceRepository.findPopularDevices(Pageable.ofSize(limit)).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<DeviceResponse> getSimilarDevices(Long deviceId, int limit) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        Long categoryId = device.getCategory() != null ? device.getCategory().getId() : null;
        if (categoryId == null)
            return List.of();
        return deviceRepository.findSimilarDevices(categoryId, deviceId, Pageable.ofSize(limit)).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ExperienceStepResponse> getExperienceSteps(Long deviceId) {
        return experienceStepRepository.findByDeviceIdOrderByStepNumberAsc(deviceId).stream()
                .map(s -> ExperienceStepResponse.builder()
                        .id(s.getId())
                        .stepNumber(s.getStepNumber())
                        .stepTitle(s.getStepTitle())
                        .stepContent(s.getStepContent())
                        .iconUrl(s.getIconUrl())
                        .durationMinutes(s.getDurationMinutes())
                        .build())
                .collect(Collectors.toList());
    }

    public List<DeviceResponse.SpecificationInfo> getSpecifications(Long deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));
        if (device.getSpecifications() == null) return List.of();
        return device.getSpecifications().stream()
                .map(s -> DeviceResponse.SpecificationInfo.builder()
                        .label(s.getLabel())
                        .value(s.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    // Categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Category createCategory(Category category) {
        if (category.getSlug() == null)
            category.setSlug(generateSlug(category.getName()));
        return categoryRepository.save(category);
    }

    // Brands
    public List<BrandResponse> getAllBrands() {
        Map<Long, Double> discountMap = buildMaxDiscountMap();
        return brandRepository.findAll().stream()
                .map(b -> toBrandResponse(b, discountMap))
                .collect(Collectors.toList());
    }

    public List<BrandResponse> getFeaturedBrands() {
        Map<Long, Double> discountMap = buildMaxDiscountMap();
        return brandRepository.findByIsFeaturedTrue().stream()
                .map(b -> toBrandResponse(b, discountMap))
                .collect(Collectors.toList());
    }

    private Map<Long, Double> buildMaxDiscountMap() {
        Map<Long, Double> map = new HashMap<>();
        for (Object[] row : deviceRepository.findMaxDiscountPerBrand()) {
            Long brandId = ((Number) row[0]).longValue();
            Double maxDiscount = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            map.put(brandId, maxDiscount);
        }
        return map;
    }

    private BrandResponse toBrandResponse(Brand b, Map<Long, Double> discountMap) {
        return BrandResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .slug(b.getSlug())
                .image(b.getImage())
                .description(b.getDescription())
                .isFeatured(b.getIsFeatured())
                .isActive(b.getIsActive())
                .maxDiscountPercentage(discountMap.getOrDefault(b.getId(), 0.0))
                .build();
    }

    @Transactional
    public Brand createBrand(Brand brand) {
        if (brand.getSlug() == null)
            brand.setSlug(generateSlug(brand.getName()));
        return brandRepository.save(brand);
    }

    private String generateSlug(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    private DeviceResponse toResponse(Device d) {
        return DeviceResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .slug(d.getSlug())
                .description(d.getDescription())
                .content(d.getContent())
                .price(d.getPrice())
                .originalPrice(d.getOriginalPrice())
                .discountPercentage(d.getDiscountPercentage())
                .stock(d.getStock())
                .averageRating(d.getAverageRating())
                .image(d.getImage())
                .images(d.getImages())
                .category(d.getCategory() != null ? DeviceResponse.CategoryInfo.builder()
                        .id(d.getCategory().getId())
                        .name(d.getCategory().getName())
                        .slug(d.getCategory().getSlug())
                        .image(d.getCategory().getImage())
                        .categoryType(d.getCategory().getCategoryType())
                        .build() : null)
                .brand(d.getBrand() != null ? DeviceResponse.BrandInfo.builder()
                        .id(d.getBrand().getId())
                        .name(d.getBrand().getName())
                        .slug(d.getBrand().getSlug())
                        .image(d.getBrand().getImage())
                        .build() : null)
                .sku(d.getSku())
                .warranty(DeviceResponse.WarrantyInfo.builder()
                        .period(d.getWarrantyPeriod())
                        .policy(d.getWarrantyPolicy())
                        .build())
                .origin(d.getOrigin())
                .deviceCondition(d.getDeviceCondition())
                .skinType(d.getSkinType())
                .skinConcerns(d.getSkinConcerns())
                .status(d.getStatus())
                .sold(d.getSold())
                .reviewCount(d.getReviewCount())
                .viewCount(d.getViewCount())
                .isBookingAvailable(d.getIsBookingAvailable())
                .bookingPrice(d.getBookingPrice())
                .tags(d.getTags())
                .videoUrl(d.getVideoUrl())
                .specifications(d.getSpecifications() != null ? d.getSpecifications().stream()
                        .map(s -> DeviceResponse.SpecificationInfo.builder()
                                .label(s.getLabel()).value(s.getValue()).build())
                        .collect(Collectors.toList()) : List.of())
                .createdAt(d.getCreatedAt())
                .build();
    }

    private PageResponse<DeviceResponse> toPageResponse(Page<Device> page) {
        return PageResponse.<DeviceResponse>builder()
                .items(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
