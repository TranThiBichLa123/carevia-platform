package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.entity.PersonBase;
import com.carevia.shared.exception.InvalidStatusException;
import com.carevia.shared.exception.UnauthorizedException;

import java.time.Instant;

/**
 * Staff entity with Rich Domain Model - encapsulates staff-specific business logic
 */
@Entity
@Table(name = "staffs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff extends PersonBase implements BaseProfile{

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

}