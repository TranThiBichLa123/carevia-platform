package com.carevia.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Order;
import com.carevia.shared.constant.OrderStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByOrderCode(String orderCode);

    // THÊM: Lấy danh sách đơn hàng cho Client (không phân trang, sắp xếp mới nhất lên đầu)
    List<Order> findByAccountIdOrderByCreatedAtDesc(Long accountId);

    // Giữ lại các hàm phân trang cho Admin/Staff
    Page<Order> findByAccountId(Long accountId, Pageable pageable);

    Page<Order> findByAccountIdAndStatus(Long accountId, OrderStatus status, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    // SỬA QUERY: Đảm bảo sử dụng tên trường trong Entity (totalAmount, status, createdAt)
    // Lưu ý: Trong HQL, Enum phải được viết đầy đủ hoặc dùng tên Enum
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = com.carevia.shared.constant.OrderStatus.COMPLETED AND o.createdAt BETWEEN :start AND :end")
    java.math.BigDecimal calculateRevenue(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = com.carevia.shared.constant.OrderStatus.COMPLETED AND o.createdAt BETWEEN :start AND :end")
    long countCompletedOrders(@Param("start") Instant start, @Param("end") Instant end);
}
