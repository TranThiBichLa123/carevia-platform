package com.carevia.core.repository;

import com.carevia.core.domain.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {

    Optional<SystemSetting> findByKeyName(String keyName);

    List<SystemSetting> findByKeyNameIn(List<String> keyNames);
}