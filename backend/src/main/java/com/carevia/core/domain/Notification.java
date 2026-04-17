package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.entity.BaseEntity;
@Entity
@Table(name = "notifications") // Nên để số nhiều cho chuẩn DB
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // THÊM MỚI: Liên kết với tài khoản nhận thông báo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // THÊM MỚI: Trạng thái đọc/chưa đọc
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private com.carevia.shared.constant.NotificationStatus status; 

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(name = "target_url", length = 512)
    private String targetUrl;

    @Column(name = "reference_type", length = 100)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;
}
