package com.carevia.controller.booking;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.BookingService;
import com.carevia.service.SessionService;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.annotation.StaffOnly;
import com.carevia.shared.dto.request.booking.CreateBookingRequest;
import com.carevia.shared.dto.request.booking.UpdateBookingStatusRequest;
import com.carevia.shared.dto.request.session.CreateSessionRequest;
import com.carevia.shared.exception.UnauthorizedException;
import com.carevia.shared.util.SecurityUtils;

import jakarta.validation.Valid;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings", description = "Booking management APIs")
public class BookingController {

    private final BookingService bookingService;
    private final SessionService sessionService;

    public BookingController(BookingService bookingService, SessionService sessionService) {
        this.bookingService = bookingService;
        this.sessionService = sessionService;
    }

    @PostMapping
    @Authenticated
    @Operation(summary = "Create a new booking")
    public ResponseEntity<?> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(bookingService.createBooking(accountId, request));
    }

    @GetMapping("/my")
    @Authenticated
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<?> getMyBookings(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        com.carevia.shared.constant.BookingStatus bookingStatus = status != null ?
                com.carevia.shared.constant.BookingStatus.valueOf(status) : null;
        return ResponseEntity.ok(bookingService.getBookingsByAccount(accountId, bookingStatus, pageable));
    }

    @GetMapping("/{id}")
    @Authenticated
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{id}/cancel")
    @Authenticated
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @RequestParam(required = false) String reason) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(bookingService.cancelBooking(id, accountId, reason));
    }

    // Staff endpoints
    @PutMapping("/{id}/confirm")
    @StaffOnly
    @Operation(summary = "Confirm a booking (Staff)")
    public ResponseEntity<?> confirmBooking(@PathVariable Long id, @RequestParam(required = false) String staffNote) {
        return ResponseEntity.ok(bookingService.confirmBooking(id, staffNote));
    }

    @PutMapping("/{id}/complete")
    @StaffOnly
    @Operation(summary = "Complete a booking (Staff)")
    public ResponseEntity<?> completeBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.completeBooking(id));
    }

    @GetMapping("/all")
    @StaffOnly
    @Operation(summary = "Get all bookings (Staff)")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        com.carevia.shared.constant.BookingStatus bookingStatus = status != null ?
                com.carevia.shared.constant.BookingStatus.valueOf(status) : null;
        return ResponseEntity.ok(bookingService.getAllBookings(bookingStatus, pageable));
    }

    // Session endpoints
    @GetMapping("/sessions/available")
    @Operation(summary = "Get available sessions for a device")
    public ResponseEntity<?> getAvailableSessions(
            @RequestParam Long deviceId,
            @RequestParam(required = false) LocalDate fromDate) {
        return ResponseEntity.ok(sessionService.getAvailableSessions(deviceId, fromDate));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Get session by ID")
    public ResponseEntity<?> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PostMapping("/sessions")
    @StaffOnly
    @Operation(summary = "Create a new session (Staff)")
    public ResponseEntity<?> createSession(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.ok(sessionService.createSession(request));
    }

    @PutMapping("/sessions/{id}/status")
    @StaffOnly
    @Operation(summary = "Update session status (Staff)")
    public ResponseEntity<?> updateSessionStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(sessionService.updateSessionStatus(id, status));
    }
}
