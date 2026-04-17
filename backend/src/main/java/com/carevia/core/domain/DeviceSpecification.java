package com.carevia.core.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceSpecification {

    @Column(name = "spec_label", length = 100)
    private String label;

    @Column(name = "spec_value", length = 500)
    private String value;
}
