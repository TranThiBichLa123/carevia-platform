package com.carevia.core.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.AccountActionLog;
import com.carevia.shared.constant.AccountActionType;

public interface AccountActionLogRepository extends JpaRepository<AccountActionLog, Long> {
    Page<AccountActionLog> findByTargetAccount(Account targetAccount, Pageable pg);
    Page<AccountActionLog> findByTargetAccountAndActionType(Account targetAccount, AccountActionType actionType, Pageable pg);

}

