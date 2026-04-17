package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "service_device_map")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ServiceDeviceMap.ServiceDeviceMapId.class)
public class ServiceDeviceMap {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @EqualsAndHashCode
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceDeviceMapId implements Serializable {
        private Long service;
        private Long device;
    }
}
