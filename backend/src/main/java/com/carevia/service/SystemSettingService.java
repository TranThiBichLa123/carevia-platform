package com.carevia.service;

import com.carevia.core.domain.SystemSetting;
import com.carevia.core.repository.SystemSettingRepository;
import com.carevia.shared.dto.request.system.UpdateBusinessSettingsRequest;
import com.carevia.shared.dto.response.system.BusinessSettingsResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SystemSettingService {

    private static final String BUSINESS_NAME = "business.name";
    private static final String HOTLINE = "business.hotline";
    private static final String SUPPORT_EMAIL = "business.support_email";
    private static final String STORE_ADDRESS = "business.store_address";
    private static final String STORE_HOURS = "business.store_hours";
    private static final String SUPPORT_NOTE = "business.support_note";

    private static final List<String> BUSINESS_SETTING_KEYS = List.of(
            BUSINESS_NAME,
            HOTLINE,
            SUPPORT_EMAIL,
            STORE_ADDRESS,
            STORE_HOURS,
            SUPPORT_NOTE
    );

    private final SystemSettingRepository systemSettingRepository;

    public SystemSettingService(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    @Transactional(readOnly = true)
    public BusinessSettingsResponse getBusinessSettings() {
        Map<String, SystemSetting> settings = systemSettingRepository.findByKeyNameIn(BUSINESS_SETTING_KEYS).stream()
                .collect(Collectors.toMap(SystemSetting::getKeyName, Function.identity()));

        return BusinessSettingsResponse.builder()
                .businessName(getSettingValue(settings, BUSINESS_NAME, "Carevia SkinTech Center"))
                .hotline(getSettingValue(settings, HOTLINE, "1900 6868"))
                .supportEmail(getSettingValue(settings, SUPPORT_EMAIL, "support@carevia.vn"))
                .storeAddress(getSettingValue(settings, STORE_ADDRESS, "12 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City"))
                .storeHours(getSettingValue(settings, STORE_HOURS, "08:00 - 21:00 | Mon - Sun"))
                .supportNote(getSettingValue(settings, SUPPORT_NOTE, "Dat lich trai nghiem truoc khi den cua hang de duoc chuan bi may demo va ky thuat vien phu hop."))
                .build();
    }

    @Transactional
    public BusinessSettingsResponse updateBusinessSettings(UpdateBusinessSettingsRequest request) {
        upsert(BUSINESS_NAME, request.getBusinessName(), "Displayed company or store name across the website");
        upsert(HOTLINE, request.getHotline(), "Primary hotline displayed to clients");
        upsert(SUPPORT_EMAIL, request.getSupportEmail(), "Support email displayed to clients");
        upsert(STORE_ADDRESS, request.getStoreAddress(), "Main spa or showroom address displayed to clients");
        upsert(STORE_HOURS, request.getStoreHours(), "Business hours displayed to clients");
        upsert(SUPPORT_NOTE, request.getSupportNote(), "Operational note shown in contact/footer areas");
        return getBusinessSettings();
    }

    private String getSettingValue(Map<String, SystemSetting> settings, String key, String fallback) {
        SystemSetting setting = settings.get(key);
        return setting != null ? setting.getValueText() : fallback;
    }

    private void upsert(String key, String value, String description) {
        SystemSetting setting = systemSettingRepository.findByKeyName(key)
                .orElseGet(() -> SystemSetting.builder()
                        .keyName(key)
                        .description(description)
                        .build());

        setting.setValueText(value == null ? "" : value.trim());
        setting.setDescription(description);
        setting.setUpdatedAt(Instant.now());
        systemSettingRepository.save(setting);
    }
}