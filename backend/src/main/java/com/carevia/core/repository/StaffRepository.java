package com.carevia.core.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.Staff;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long>, JpaSpecificationExecutor<Staff> {

    Optional<Staff> findByAccount(Account account);

    @Query("SELECT s FROM Staff s WHERE s.account.id = :accountId")
    Optional<Staff> findByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT s FROM Staff s JOIN FETCH s.account WHERE s.id = :id")
    Optional<Staff> findByIdWithAccount(@Param("id") Long id);

    @Query("SELECT s FROM Staff s JOIN FETCH s.account WHERE s.staffCode = :code")
    Optional<Staff> findByStaffCodeWithAccount(@Param("code") String code);

    Optional<Staff> findByStaffCode(String staffCode);

    long countByApprovedTrue();

    long countByApprovedFalse();
}



