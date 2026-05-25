package com.carevia.service;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.shared.dto.request.session.CreateSessionRequest;
import com.carevia.shared.dto.response.session.SessionResponse;
import com.carevia.shared.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final ExperienceSessionRepository sessionRepository;
    private final DeviceRepository deviceRepository;
    private final StaffRepository staffRepository;
    private final StaffBrandAccessService staffBrandAccessService;

    public SessionService(ExperienceSessionRepository sessionRepository, DeviceRepository deviceRepository,
            StaffRepository staffRepository, StaffBrandAccessService staffBrandAccessService) {
        this.sessionRepository = sessionRepository;
        this.deviceRepository = deviceRepository;
        this.staffRepository = staffRepository;
        this.staffBrandAccessService = staffBrandAccessService;
    }

    @Transactional
    public SessionResponse createSession(CreateSessionRequest request) {
        Device device = deviceRepository.findById(request.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        staffBrandAccessService.requireManageableDevice(device);

        ExperienceSession session = ExperienceSession.builder()
                .device(device)
                .branchName(request.getBranchName())
                .locationDetail(request.getLocationDetail())
                .sessionDate(request.getSessionDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .maxSlots(request.getMaxSlots() != null ? request.getMaxSlots() : 10)
                .pricePerSlot(request.getPricePerSlot())
                .build();

        if (request.getStaffId() != null) {
            Staff staff = staffRepository.findById(request.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
            session.setAssignedStaff(staff);
        }

        return toResponse(sessionRepository.save(session));
    }

    public List<SessionResponse> getAvailableSessions(Long deviceId, LocalDate fromDate) {
        LocalDate date = fromDate != null ? fromDate : LocalDate.now();
        return sessionRepository.findAvailableSessions(deviceId, date).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<SessionResponse> getSessionsByDate(LocalDate date) {
        Long scopedBrandId = staffBrandAccessService.getScopedBrandIdOrNull();
        return sessionRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("sessionDate"), date),
                root.get("status").in(com.carevia.shared.constant.SessionStatus.OPEN,
                    com.carevia.shared.constant.SessionStatus.FULL),
                scopedBrandId != null ? cb.equal(root.get("device").get("brand").get("id"), scopedBrandId) : cb.conjunction()))
            .stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public SessionResponse getSessionById(Long id) {
        ExperienceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        if (!staffBrandAccessService.hasGlobalAccess()) {
            staffBrandAccessService.requireManageableSession(session);
        }
        return toResponse(session);
    }

    @Transactional
    public SessionResponse updateSessionStatus(Long id, String status) {
        ExperienceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        staffBrandAccessService.requireManageableSession(session);
        switch (status.toUpperCase()) {
            case "CLOSED" -> session.close();
            case "CANCELLED" -> session.cancel();
            default -> throw new ResourceNotFoundException("Invalid status: " + status);
        }
        return toResponse(sessionRepository.save(session));
    }

    public List<SessionResponse> getStaffSessions(Long staffId, Pageable pageable) {
        return sessionRepository.findByAssignedStaffId(staffId, pageable).getContent().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private SessionResponse toResponse(ExperienceSession s) {
        return SessionResponse.builder()
                .id(s.getId())
                .deviceId(s.getDevice().getId())
                .deviceName(s.getDevice().getName())
                .branchName(s.getBranchName())
                .locationDetail(s.getLocationDetail())
                .sessionDate(s.getSessionDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .maxSlots(s.getMaxSlots())
                .availableSlots(s.getAvailableSlots())
                .status(s.getStatus())
                .pricePerSlot(s.getPricePerSlot())
                .staffId(s.getAssignedStaff() != null ? s.getAssignedStaff().getId() : null)
                .staffName(s.getAssignedStaff() != null ? s.getAssignedStaff().getFullName() : null)
                .build();
    }
}
