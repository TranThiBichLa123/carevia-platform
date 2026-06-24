package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import com.carevia.shared.entity.BaseEntity;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "effectiveness_rating", nullable = false)
    private Integer effectivenessRating;

    @Column(name = "safety_rating", nullable = false)
    private Integer safetyRating;

    @Column(name = "ergonomics_rating", nullable = false)
    private Integer ergonomicsRating;

    @Column(name = "durability_rating", nullable = false)
    private Integer durabilityRating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "media_urls", columnDefinition = "json")
    private List<String> mediaUrls;

    @Column(name = "is_verified_purchase", nullable = false)
    @Builder.Default
    private Boolean isVerifiedPurchase = false;

    @Column(name = "admin_reply", columnDefinition = "TEXT")
    private String adminReply;

    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private Boolean isHidden = false;

    public void hide() {
        this.isHidden = true;
    }

    public void show() {
        this.isHidden = false;
    }

    public void addAdminReply(String reply) {
        this.adminReply = reply;
    }

    public void verifyPurchase() {
        this.isVerifiedPurchase = true;
    }
}
