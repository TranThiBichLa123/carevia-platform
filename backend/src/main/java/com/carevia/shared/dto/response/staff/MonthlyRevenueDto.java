package com.carevia.shared.dto.response.staff;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueDto {
    private String month;
    private BigDecimal equipmentRevenue;
    private BigDecimal bookingRevenue;
}