package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.entity.PersonBase;
import com.carevia.shared.exception.InvalidStatusException;
import com.carevia.shared.exception.UnauthorizedException;

import java.time.Instant;

/**
 * Staff entity with Rich Domain Model - encapsulates staff-specific business
 * logic
 */
@Entity
@Table(name = "staffs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff extends PersonBase implements BaseProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "staff_code", unique = true, length = 50)
    private String staffCode;

    @Column(length = 255)
    private String specialty;

    @Column(length = 128)
    private String degree;

    @Column(nullable = false)
    @Builder.Default
    private boolean approved = false;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectReason;

    /**
     * Validate staff is approved for actions
     */
    public void requireApproved() {
        if (!this.approved) {
            throw new UnauthorizedException("Staff is not approved");
        }
    }

    /**
     * Approve staff by admin
     */
    public void approve(Long adminId) {
        if (this.approvedBy != null) {
            throw new InvalidStatusException("Staff already approved");
        }
        this.approved = true;
        this.approvedAt = Instant.now();
        this.approvedBy = adminId;
        this.rejectReason = null;

        this.account.activate();
    }

    /**
     * Reject staff by admin with reason
     */
    public void reject(Long adminId, String reason) {
        this.approved = false;
        this.approvedAt = Instant.now();
        this.approvedBy = adminId;
        this.rejectReason = reason;
    }

    /**
     * Check if staff has been reviewed (approved or rejected)
     */
    public boolean hasBeenReviewed() {
        return this.approvedBy != null && this.approvedAt != null;
    }

    /**
     * Check if staff is pending approval
     */
    public boolean isPendingApproval() {
        return !this.approved && !hasBeenReviewed();
    }

    // --- THÊM CÁC TRƯỜNG PHỤC VỤ BOOKING & QUẢN LÝ ---

    @Column(name = "is_available")
    @Builder.Default
    private boolean isAvailable = true; // Nhân viên có sẵn sàng để khách đặt lịch hay không

    @Column(columnDefinition = "TEXT")
    private String bio; // Giới thiệu ngắn để khách hàng tin tưởng khi đặt lịch

    @Column(name = "rating")
    @Builder.Default
    private Double rating = 5.0; // Điểm đánh giá từ khách hàng

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0; // Tổng số lượt đánh giá

    /**
     * Cập nhật điểm rating dựa trên đánh giá mới của khách hàng
     */
    public void updateRating(double newRating) {
        double currentTotalScore = this.rating * this.totalReviews;
        this.totalReviews++;
        this.rating = (currentTotalScore + newRating) / this.totalReviews;
    }

    /**
     * Chuyển đổi trạng thái sẵn sàng làm việc (ví dụ khi nhân viên xin nghỉ phép)
     */
    public void toggleAvailability() {
        this.isAvailable = !this.isAvailable;
    }

}