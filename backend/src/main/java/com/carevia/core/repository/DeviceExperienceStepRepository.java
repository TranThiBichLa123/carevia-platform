package com.carevia.core.repository;

import com.carevia.core.domain.DeviceExperienceStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceExperienceStepRepository extends JpaRepository<DeviceExperienceStep, Long> {
    List<DeviceExperienceStep> findByDeviceIdOrderByStepNumberAsc(Long deviceId);
}
