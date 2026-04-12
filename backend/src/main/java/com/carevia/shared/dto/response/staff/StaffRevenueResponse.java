package com.carevia.shared.dto.response.staff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffRevenueResponse {

    private Long staffId;
    private String staffName;

    private BigDecimal totalRevenue; // Total from all courses
    private BigDecimal monthlyRevenue; // <--- Add this
    private BigDecimal yearlyRevenue; // <--- Add this if needed
    private BigDecimal staffEarnings; // After platform fee
    private BigDecimal platformFee;
    private Float revenueSharePercentage;

    private Long totalTransactions;
    private Long totalEnrollments;
    private Long monthlyEnrollments; // <--- Add this if needed

    private BigDecimal pendingPayout;
    private BigDecimal completedPayout;

    private Map<String, BigDecimal> revenueByCourse; // Course title -> revenue
    private Instant lastUpdated; 
}
