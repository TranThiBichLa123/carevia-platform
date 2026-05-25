package com.carevia.service;

import com.carevia.core.domain.Account;
import com.carevia.core.domain.Booking;
import com.carevia.core.domain.Brand;
import com.carevia.core.domain.Device;
import com.carevia.core.domain.ExperienceSession;
import com.carevia.core.domain.Order;
import com.carevia.core.domain.OrderItem;
import com.carevia.core.domain.Staff;
import com.carevia.core.domain.Voucher;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.StaffRepository;
import com.carevia.shared.exception.ResourceNotFoundException;
import com.carevia.shared.exception.UnauthorizedException;
import com.carevia.shared.util.SecurityUtils;
import org.springframework.stereotype.Service;

@Service
public class StaffBrandAccessService {

    private final AccountRepository accountRepository;
    private final StaffRepository staffRepository;

    public StaffBrandAccessService(AccountRepository accountRepository, StaffRepository staffRepository) {
        this.accountRepository = accountRepository;
        this.staffRepository = staffRepository;
    }

    public boolean hasGlobalAccess() {
        return getCurrentAccount().isAdmin();
    }

    public Long getScopedBrandIdOrNull() {
        if (hasGlobalAccess()) {
            return null;
        }

        return requireCurrentStaffBrand().getId();
    }

    public Brand requireCurrentStaffBrand() {
        Staff staff = requireCurrentStaff();
        Brand brand = staff.getBrand();
        if (brand == null) {
            throw new UnauthorizedException("Staff account is not assigned to a brand");
        }
        if (Boolean.FALSE.equals(brand.getIsActive())) {
            throw new UnauthorizedException("Assigned brand is inactive");
        }
        return brand;
    }

    public Staff requireCurrentStaff() {
        Account account = getCurrentAccount();
        if (!account.isStaff()) {
            throw new UnauthorizedException("Current account is not allowed to access staff operations");
        }

        Staff staff = staffRepository.findByAccountId(account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found"));
        staff.requireApproved();
        return staff;
    }

    public Device requireManageableDevice(Device device) {
        if (hasGlobalAccess()) {
            return device;
        }

        Long staffBrandId = requireCurrentStaffBrand().getId();
        Long deviceBrandId = device.getBrand() != null ? device.getBrand().getId() : null;
        if (deviceBrandId == null || !deviceBrandId.equals(staffBrandId)) {
            throw new UnauthorizedException("You can only manage devices in your own brand");
        }
        return device;
    }

    public Booking requireManageableBooking(Booking booking) {
        requireManageableDevice(booking.getDevice());
        return booking;
    }

    public ExperienceSession requireManageableSession(ExperienceSession session) {
        requireManageableDevice(session.getDevice());
        return session;
    }

    public Voucher requireManageableVoucher(Voucher voucher) {
        if (hasGlobalAccess()) {
            return voucher;
        }

        if (voucher.getApplicableDevice() == null) {
            throw new UnauthorizedException("Staff can only manage vouchers assigned to their own brand devices");
        }

        requireManageableDevice(voucher.getApplicableDevice());
        return voucher;
    }

    public Order requireManageableOrderForMutation(Order order) {
        if (hasGlobalAccess()) {
            return order;
        }

        Long staffBrandId = requireCurrentStaffBrand().getId();
        boolean hasItems = !order.getItems().isEmpty();
        boolean allItemsBelongToBrand = hasItems && order.getItems().stream()
                .allMatch(item -> belongsToBrand(item, staffBrandId));

        if (!allItemsBelongToBrand) {
            throw new UnauthorizedException("You can only update orders fully owned by your brand");
        }

        return order;
    }

    public boolean canViewOrder(Order order) {
        if (hasGlobalAccess()) {
            return true;
        }

        Long staffBrandId = requireCurrentStaffBrand().getId();
        return order.getItems().stream().anyMatch(item -> belongsToBrand(item, staffBrandId));
    }

    public boolean belongsToCurrentBrand(Device device) {
        if (hasGlobalAccess()) {
            return true;
        }

        Long staffBrandId = requireCurrentStaffBrand().getId();
        return device.getBrand() != null && staffBrandId.equals(device.getBrand().getId());
    }

    public boolean belongsToCurrentBrand(Voucher voucher) {
        if (hasGlobalAccess()) {
            return true;
        }

        return voucher.getApplicableDevice() != null && belongsToCurrentBrand(voucher.getApplicableDevice());
    }

    private boolean belongsToBrand(OrderItem item, Long brandId) {
        return item.getDevice() != null
                && item.getDevice().getBrand() != null
                && brandId.equals(item.getDevice().getBrand().getId());
    }

    private Account getCurrentAccount() {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Current account not found"));
        account.requireActive();
        return account;
    }
}