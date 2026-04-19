package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.entity.BaseEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "user_behaviors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBehavior extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType;

    @Column(name = "target_type", nullable = false, length = 100)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @JdbcTypeCode(SqlTypes.JSON) // Ép kiểu dữ liệu sang JSON cho Postgres
    @Column(name = "metadata", columnDefinition = "json")
    private String metadata; // Hoặc kiểu Map/Object nếu bạn đang dùng

}
