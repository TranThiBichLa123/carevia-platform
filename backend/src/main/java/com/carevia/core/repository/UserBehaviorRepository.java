package com.carevia.core.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.UserBehavior;
import com.carevia.shared.constant.BehaviorType;

import java.util.List;

@Repository
public interface UserBehaviorRepository extends JpaRepository<UserBehavior, Long> {
    List<UserBehavior> findByAccountId(Long accountId);

    List<UserBehavior> findByAccountIdAndBehaviorType(Long accountId, BehaviorType behaviorType);

    @Query("SELECT ub.device.id, COUNT(ub) as cnt FROM UserBehavior ub GROUP BY ub.device.id ORDER BY cnt DESC")
    List<Object[]> findPopularDeviceIds(Pageable pageable);

    @Query("SELECT ub.device.id FROM UserBehavior ub WHERE ub.account.id = :accountId ORDER BY ub.createdAt DESC")
    List<Long> findRecentDeviceIdsByAccount(@Param("accountId") Long accountId, Pageable pageable);
}
