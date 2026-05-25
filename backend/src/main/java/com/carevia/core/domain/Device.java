package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.DeviceStatus;
import com.carevia.shared.entity.BaseEntity;
import org.hibernate.annotations.SQLDelete;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE devices SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
public class Device extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_percentage")
    @Builder.Default
    private Double discountPercentage = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "average_rating")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(length = 512)
    private String image;

    @Column(name = "image_public_id", length = 255)
    private String imagePublicId;

    @ElementCollection
    @CollectionTable(name = "device_images", joinColumns = @JoinColumn(name = "device_id"))
    @Column(name = "image_url", length = 512)
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(length = 50)
    private String sku;

    @Column(name = "warranty_period")
    private Integer warrantyPeriod;

    @Column(name = "warranty_policy", length = 500)
    private String warrantyPolicy;

    @Column(length = 100)
    private String origin;

    @Column(name = "device_condition", length = 20)
    @Builder.Default
    private String deviceCondition = "new";

    @Column(name = "skin_type", length = 100)
    private String skinType;

    @Column(name = "skin_concerns", length = 500)
    private String skinConcerns;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private DeviceStatus status = DeviceStatus.AVAILABLE;

    @Column
    @Builder.Default
    private Integer sold = 0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "is_booking_available")
    @Builder.Default
    private Boolean isBookingAvailable = false;

    @Column(name = "booking_price", precision = 12, scale = 2)
    private BigDecimal bookingPrice;

    @ElementCollection
    @CollectionTable(name = "device_tags", joinColumns = @JoinColumn(name = "device_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "video_url", length = 512)
    private String videoUrl;

    @Column(name = "maintenance_reason", length = 500)
    private String maintenanceReason;

    @Column(name = "maintenance_start_date")
    private LocalDate maintenanceStartDate;

    @Column(name = "maintenance_end_date")
    private LocalDate maintenanceEndDate;

    @Column(name = "maintenance_cost", precision = 12, scale = 2)
    private BigDecimal maintenanceCost;

    @ElementCollection
    @CollectionTable(name = "device_specifications", joinColumns = @JoinColumn(name = "device_id"))
    @Builder.Default
    private List<DeviceSpecification> specifications = new ArrayList<>();

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementSold(int quantity) {
        this.sold += quantity;
        this.stock -= quantity;
        if (this.stock <= 0) {
            this.stock = 0;
            this.status = DeviceStatus.OUT_OF_STOCK;
        }
    }

    public boolean isAvailable() {
        return this.status == DeviceStatus.AVAILABLE && this.stock > 0;
    }

    public void updateRating(double newRating) {
        double total = this.averageRating * this.reviewCount;
        this.reviewCount++;
        this.averageRating = (total + newRating) / this.reviewCount;
    }

    public void updateInventory(int newStock) {
        this.stock = Math.max(newStock, 0);
        if (this.status != DeviceStatus.MAINTENANCE) {
            this.status = this.stock > 0 ? DeviceStatus.AVAILABLE : DeviceStatus.OUT_OF_STOCK;
        }
    }

    public void startMaintenance(String reason, LocalDate startDate, LocalDate expectedEndDate, BigDecimal cost) {
        this.maintenanceReason = reason;
        this.maintenanceStartDate = startDate;
        this.maintenanceEndDate = expectedEndDate;
        this.maintenanceCost = cost;
        this.status = DeviceStatus.MAINTENANCE;
    }

    public void completeMaintenance(LocalDate endDate, BigDecimal cost) {
        this.maintenanceEndDate = endDate;
        if (cost != null) {
            this.maintenanceCost = cost;
        }
        this.status = this.stock > 0 ? DeviceStatus.AVAILABLE : DeviceStatus.OUT_OF_STOCK;
    }
}
