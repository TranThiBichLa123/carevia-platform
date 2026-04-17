package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.ServiceStatus;
import com.carevia.shared.entity.BaseEntity;

import java.math.BigDecimal;

@Entity
@Table(name = "service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private ServiceStatus status = ServiceStatus.ACTIVE;

    public boolean isAvailable() {
        return this.status == ServiceStatus.ACTIVE;
    }

    public void activate() {
        this.status = ServiceStatus.ACTIVE;
    }

    public void deactivate() {
        this.status = ServiceStatus.INACTIVE;
    }

    public void archive() {
        this.status = ServiceStatus.ARCHIVED;
    }

    public BigDecimal getFinalPrice() {
        return this.basePrice;
    }
}
