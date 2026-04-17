package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.Gender;
import com.carevia.shared.constant.MembershipLevel;
import com.carevia.shared.entity.BaseEntity;

import java.time.LocalDate;

@Entity
@Table(name = "user_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column
    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(length = 500)
    private String address;

    @Column(name = "skin_type", length = 100)
    private String skinType;

    @Column(name = "skin_concerns", length = 500)
    private String skinConcerns;

    @Column(name = "loyalty_points", nullable = false)
    @Builder.Default
    private Integer loyaltyPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_level", nullable = false, length = 20)
    @Builder.Default
    private MembershipLevel membershipLevel = MembershipLevel.BASIC;

    public void addLoyaltyPoints(int points) {
        if (points <= 0) {
            throw new IllegalArgumentException("Points must be positive");
        }
        this.loyaltyPoints += points;
        upgradeMembership();
    }

    public void upgradeMembership() {
        if (this.loyaltyPoints >= 10000) {
            this.membershipLevel = MembershipLevel.PLATINUM;
        } else if (this.loyaltyPoints >= 5000) {
            this.membershipLevel = MembershipLevel.GOLD;
        } else if (this.loyaltyPoints >= 1000) {
            this.membershipLevel = MembershipLevel.SILVER;
        } else {
            this.membershipLevel = MembershipLevel.BASIC;
        }
    }

    public void updateSkinProfile(String skinType, String skinConcerns) {
        this.skinType = skinType;
        this.skinConcerns = skinConcerns;
    }
}
