package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.entity.PersonBase;

/**
 * Client entity with Rich Domain Model - inherits profile behaviors from
 * PersonBase
 */
@Entity
@Table(name = "clients")
@Getter
@Setter // Keep for backward compatibility with existing code
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Client extends PersonBase implements BaseProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "client_code", length = 50, unique = true)
    private String clientCode;

    // --- CÁC TRƯỜNG BỔ SUNG CHO ĐỒ ÁN ---

    @Column(name = "skin_type")
    private String skinType; // Ví dụ: Da dầu, Da khô, Da nhạy cảm

    @Column(name = "skin_concerns", columnDefinition = "TEXT")
    private String skinConcerns; // Ví dụ: Mụn, lão hóa, thâm nám

    @Column(name = "loyalty_points")
    @Builder.Default
    private Integer loyaltyPoints = 0; // Điểm tích lũy khi mua thiết bị

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_level")
    @Builder.Default
    private MembershipLevel membershipLevel = MembershipLevel.BASIC;

    @Column(name = "address", length = 500)
    private String address; // Địa chỉ mặc định để ship thiết bị

    // Enum định nghĩa hạng thành viên
    public enum MembershipLevel {
        BASIC, SILVER, GOLD, PLATINUM
    }

    // Logic nghiệp vụ: Ví dụ cộng điểm thưởng
    public void addPoints(int points) {
        if (this.loyaltyPoints == null)
            this.loyaltyPoints = 0;
        this.loyaltyPoints += points;
        updateMembershipLevel();
    }

    private void updateMembershipLevel() {
        if (this.loyaltyPoints >= 1000)
            this.membershipLevel = MembershipLevel.GOLD;
        else if (this.loyaltyPoints >= 500)
            this.membershipLevel = MembershipLevel.SILVER;
        else
            this.membershipLevel = MembershipLevel.BASIC;
    }
}
