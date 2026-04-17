package com.carevia.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.shared.constant.BookingStatus;
import com.carevia.shared.constant.BehaviorType;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.booking.CreateBookingRequest;
import com.carevia.shared.dto.response.booking.BookingResponse;
import com.carevia.shared.exception.InvalidRequestException;
import com.carevia.shared.exception.InvalidStatusException;
import com.carevia.shared.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ExperienceSessionRepository sessionRepository;
    private final DeviceRepository deviceRepository;
    private final AccountRepository accountRepository;
    private final VoucherRepository voucherRepository;
    private final UserBehaviorRepository userBehaviorRepository;
    private final NotificationService notificationService;

    private static final int MAX_BOOKINGS_PER_DAY = 3;

    public BookingService(BookingRepository bookingRepository, ExperienceSessionRepository sessionRepository,
            DeviceRepository deviceRepository, AccountRepository accountRepository,
            VoucherRepository voucherRepository, UserBehaviorRepository userBehaviorRepository,
            NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.sessionRepository = sessionRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
        this.voucherRepository = voucherRepository;
        this.userBehaviorRepository = userBehaviorRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingResponse createBooking(Long accountId, CreateBookingRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        account.requireActive();

        ExperienceSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        Device device = deviceRepository.findById(request.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        // Check conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(accountId, session.getId());
        if (!conflicts.isEmpty()) {
            throw new InvalidRequestException("You already have a booking for this session");
        }

        // Check daily limit
        long todayCount = bookingRepository.countByAccountAndDate(accountId, session.getSessionDate());
        if (todayCount >= MAX_BOOKINGS_PER_DAY) {
            throw new InvalidRequestException("Maximum " + MAX_BOOKINGS_PER_DAY + " bookings per day exceeded");
        }

        // Book the slot
        session.bookSlot();

        // Calculate price
        BigDecimal totalPrice = session.getPricePerSlot() != null ? session.getPricePerSlot()
                : (device.getBookingPrice() != null ? device.getBookingPrice() : BigDecimal.ZERO);
        BigDecimal discountAmount = BigDecimal.ZERO;

        // Apply voucher
        Voucher voucher = null;
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            voucher = voucherRepository.findByCode(request.getVoucherCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
            if (!voucher.isValid()) {
                throw new InvalidRequestException("Voucher is not valid or expired");
            }
            discountAmount = voucher.calculateDiscount(totalPrice);
        }

        Booking booking = Booking.builder()
                .bookingCode("BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .account(account)
                .session(session)
                .device(device)
                .appointmentDate(session.getSessionDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .totalPrice(totalPrice.subtract(discountAmount))
                .discountAmount(discountAmount)
                .voucher(voucher)
                .customerNote(request.getCustomerNote())
                .status(BookingStatus.PENDING_CONFIRM)
                .build();

        booking = bookingRepository.save(booking);
        sessionRepository.save(session);

        // Track behavior
        userBehaviorRepository.save(UserBehavior.builder()
                .account(account)
                .actionType("BOOKING") // Thay behaviorType bằng actionType
                .targetType("DEVICE") // Khai báo loại đối tượng tác động
                .targetId(device.getId()) // Lưu ID của thiết bị vào targetId
                .build());

        // Send notification
        notificationService.createBookingNotification(account, booking, "BOOKING_CREATED");

        return toResponse(booking);
    }

    public PageResponse<BookingResponse> getBookingsByAccount(Long accountId, BookingStatus status, Pageable pageable) {
        Page<Booking> page;
        if (status != null) {
            page = bookingRepository.findByAccountIdAndStatus(accountId, status, pageable);
        } else {
            page = bookingRepository.findByAccountId(accountId, pageable);
        }
        return toPageResponse(page);
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return toResponse(booking);
    }

    public BookingResponse getBookingByCode(String code) {
        Booking booking = bookingRepository.findByBookingCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long accountId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getAccount().getId().equals(accountId)) {
            throw new InvalidRequestException("You can only cancel your own bookings");
        }

        booking.cancel(reason, "USER");
        booking = bookingRepository.save(booking);
        sessionRepository.save(booking.getSession());
        if (booking.getVoucher() != null)
            voucherRepository.save(booking.getVoucher());

        notificationService.createBookingNotification(booking.getAccount(), booking, "BOOKING_CANCELLED");
        return toResponse(booking);
    }

    // Staff actions
    @Transactional
    public BookingResponse confirmBooking(Long bookingId, String staffNote) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.confirm();
        booking.setStaffNote(staffNote);
        booking = bookingRepository.save(booking);

        notificationService.createBookingNotification(booking.getAccount(), booking, "BOOKING_CONFIRMED");
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBookingByStaff(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.cancel(reason, "STAFF");
        booking = bookingRepository.save(booking);
        sessionRepository.save(booking.getSession());
        if (booking.getVoucher() != null)
            voucherRepository.save(booking.getVoucher());

        notificationService.createBookingNotification(booking.getAccount(), booking, "BOOKING_CANCELLED");
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse completeBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.complete();
        booking = bookingRepository.save(booking);

        notificationService.createBookingNotification(booking.getAccount(), booking, "BOOKING_COMPLETED");
        return toResponse(booking);
    }

    public PageResponse<BookingResponse> getAllBookings(BookingStatus status, Pageable pageable) {
        Page<Booking> page;
        if (status != null) {
            page = bookingRepository.findAll(pageable); // Filter later with specification
        } else {
            page = bookingRepository.findAll(pageable);
        }
        return toPageResponse(page);
    }

    // Statistics
    public List<BookingResponse> getBookingsByDateRange(LocalDate start, LocalDate end) {
        return bookingRepository.findByDateRange(start, end).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .accountId(b.getAccount().getId())
                .accountName(b.getAccount().getUsername())
                .session(BookingResponse.SessionInfo.builder()
                        .id(b.getSession().getId())
                        .branchName(b.getSession().getBranchName())
                        .locationDetail(b.getSession().getLocationDetail())
                        .sessionDate(b.getSession().getSessionDate())
                        .startTime(b.getSession().getStartTime())
                        .endTime(b.getSession().getEndTime())
                        .maxSlots(b.getSession().getMaxSlots())
                        .availableSlots(b.getSession().getAvailableSlots())
                        .build())
                .device(BookingResponse.DeviceInfo.builder()
                        .id(b.getDevice().getId())
                        .name(b.getDevice().getName())
                        .image(b.getDevice().getImage())
                        .bookingPrice(b.getDevice().getBookingPrice())
                        .build())
                .appointmentDate(b.getAppointmentDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .totalPrice(b.getTotalPrice())
                .discountAmount(b.getDiscountAmount())
                .voucherCode(b.getVoucher() != null ? b.getVoucher().getCode() : null)
                .customerNote(b.getCustomerNote())
                .staffNote(b.getStaffNote())
                .cancelReason(b.getCancelReason())
                .cancelledBy(b.getCancelledBy())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private PageResponse<BookingResponse> toPageResponse(Page<Booking> page) {
        return PageResponse.<BookingResponse>builder()
                .items(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
