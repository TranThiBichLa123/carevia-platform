package com.carevia.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.shared.constant.BehaviorType;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserBehaviorService {

    private final UserBehaviorRepository userBehaviorRepository;
    private final DeviceRepository deviceRepository;
    private final AccountRepository accountRepository;

    public UserBehaviorService(UserBehaviorRepository userBehaviorRepository,
                               DeviceRepository deviceRepository, AccountRepository accountRepository) {
        this.userBehaviorRepository = userBehaviorRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public void trackBehavior(Long accountId, Long deviceId, BehaviorType type, String metadata) {
        Account account = accountRepository.findById(accountId).orElse(null);
        Device device = deviceRepository.findById(deviceId).orElse(null);
        if (account == null || device == null) return;

        UserBehavior behavior = UserBehavior.builder()
                .account(account)
                .device(device)
                .behaviorType(type)
                .metadata(metadata)
                .build();
        userBehaviorRepository.save(behavior);
    }

    public List<Long> getPopularDeviceIds(int limit) {
        return userBehaviorRepository.findPopularDeviceIds(org.springframework.data.domain.PageRequest.of(0, limit))
                .stream().map(row -> (Long) row[0]).collect(java.util.stream.Collectors.toList());
    }

    public List<Long> getRecentViewedDeviceIds(Long accountId, int limit) {
        return userBehaviorRepository.findRecentDeviceIdsByAccount(accountId,
                org.springframework.data.domain.PageRequest.of(0, limit));
    }
}
