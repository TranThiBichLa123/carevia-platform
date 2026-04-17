package com.carevia.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.shared.constant.BehaviorType;
import com.carevia.shared.dto.response.device.DeviceResponse;
import com.carevia.shared.exception.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final DeviceRepository deviceRepository;
    private final AccountRepository accountRepository;
    private final UserBehaviorRepository userBehaviorRepository;

    public WishlistService(WishlistRepository wishlistRepository, DeviceRepository deviceRepository,
            AccountRepository accountRepository, UserBehaviorRepository userBehaviorRepository) {
        this.wishlistRepository = wishlistRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
        this.userBehaviorRepository = userBehaviorRepository;
    }

    public List<Long> getWishlistDeviceIds(Long accountId) {
        return wishlistRepository.findByAccountId(accountId).stream()
                .map(wi -> wi.getDevice().getId())
                .collect(Collectors.toList());
    }

    public List<DeviceResponse> getWishlistDevices(Long accountId) {
        return wishlistRepository.findByAccountId(accountId).stream()
                .map(wi -> toDeviceResponse(wi.getDevice()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToWishlist(Long accountId, Long deviceId) {
        if (wishlistRepository.existsByAccountIdAndDeviceId(accountId, deviceId)) {
            return;
        }
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        // 1. Lưu vào bảng Wishlist (Bảng này có quan hệ trực tiếp .device() nên giữ
        // nguyên)
        WishlistItem item = WishlistItem.builder()
                .account(account)
                .device(device)
                .build();
        wishlistRepository.save(item);

        // 2. Lưu vào bảng UserBehavior để làm thống kê (Sửa lại Builder cho đúng field)
        userBehaviorRepository.save(UserBehavior.builder()
                .account(account)
                .targetType("DEVICE") // Phải có targetType
                .targetId(device.getId()) // Map deviceId vào targetId
                .actionType("WISHLIST") // Dùng actionType thay vì behaviorType
                .build());
    }

    @Transactional
    public void removeFromWishlist(Long accountId, Long deviceId) {
        wishlistRepository.deleteByAccountIdAndDeviceId(accountId, deviceId);
    }

    public boolean isInWishlist(Long accountId, Long deviceId) {
        return wishlistRepository.existsByAccountIdAndDeviceId(accountId, deviceId);
    }

    private DeviceResponse toDeviceResponse(Device d) {
        return DeviceResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .slug(d.getSlug())
                .description(d.getDescription())
                .price(d.getPrice())
                .originalPrice(d.getOriginalPrice())
                .discountPercentage(d.getDiscountPercentage())
                .stock(d.getStock())
                .averageRating(d.getAverageRating())
                .image(d.getImage())
                .images(d.getImages())
                .status(d.getStatus())
                .isBookingAvailable(d.getIsBookingAvailable())
                .bookingPrice(d.getBookingPrice())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
