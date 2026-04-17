package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.SessionStatus;
import com.carevia.shared.entity.BaseEntity;
import com.carevia.shared.exception.InvalidStatusException;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "experience_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceSession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "branch_name", length = 255)
    private String branchName;

    @Column(name = "location_detail", length = 500)
    private String locationDetail;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "max_slots", nullable = false)
    @Builder.Default
    private Integer maxSlots = 10;

    @Column(name = "booked_slots")
    @Builder.Default
    private Integer bookedSlots = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private SessionStatus status = SessionStatus.OPEN;

    @Column(name = "price_per_slot", precision = 12)
    private java.math.BigDecimal pricePerSlot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff assignedStaff;

    public int getAvailableSlots() {
        return maxSlots - bookedSlots;
    }

    public boolean hasAvailableSlots() {
        return getAvailableSlots() > 0 && status == SessionStatus.OPEN;
    }

    public void bookSlot() {
        if (!hasAvailableSlots()) {
            throw new InvalidStatusException("No available slots in this session");
        }
        this.bookedSlots++;
        if (this.bookedSlots >= this.maxSlots) {
            this.status = SessionStatus.FULL;
        }
    }

    public void releaseSlot() {
        if (this.bookedSlots > 0) {
            this.bookedSlots--;
            if (this.status == SessionStatus.FULL) {
                this.status = SessionStatus.OPEN;
            }
        }
    }

    public void cancel() {
        this.status = SessionStatus.CANCELLED;
    }

    public void close() {
        this.status = SessionStatus.CLOSED;
    }
}
