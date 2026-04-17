package com.carevia.core.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.UserBehavior;

import java.util.List;

@Repository
public interface UserBehaviorRepository extends JpaRepository<UserBehavior, Long> {

    // Lấy lịch sử hành vi theo tài khoản
    List<UserBehavior> findByAccountId(Long accountId);

    // Tìm theo AccountId và loại hành động (Sửa behaviorType thành actionType cho khớp Entity)
    List<UserBehavior> findByAccountIdAndActionType(Long accountId, String actionType);

    /**
     * UC: Thống kê thiết bị phổ biến (Aggregate)
     * Đếm số lượt xuất hiện của targetId với điều kiện targetType là 'DEVICE'
     */
    @Query("SELECT ub.targetId, COUNT(ub) as cnt FROM UserBehavior ub " +
           "WHERE ub.targetType = 'DEVICE' " +
           "GROUP BY ub.targetId ORDER BY cnt DESC")
    List<Object[]> findPopularDeviceIds(Pageable pageable);

    /**
     * UC: Lấy danh sách ID các thiết bị người dùng vừa tương tác gần đây
     */
    @Query("SELECT ub.targetId FROM UserBehavior ub " +
           "WHERE ub.account.id = :accountId AND ub.targetType = 'DEVICE' " +
           "ORDER BY ub.createdAt DESC")
    List<Long> findRecentDeviceIdsByAccount(@Param("accountId") Long accountId, Pageable pageable);
}
