package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "device_experience_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceExperienceStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(name = "step_title", nullable = false, length = 255)
    private String stepTitle;

    @Column(name = "step_content", nullable = false, columnDefinition = "text")
    private String stepContent;

    @Column(name = "icon_url", length = 512)
    private String iconUrl;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;
}
