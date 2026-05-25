package com.carevia.core.repository;

import com.carevia.core.domain.AuditLog;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    @Query("""
	    select distinct auditLog.tableName
	    from AuditLog auditLog
	    where auditLog.tableName is not null and trim(auditLog.tableName) <> ''
	    order by auditLog.tableName asc
	    """)
    List<String> findDistinctTableNames();

    @Query("""
	    select distinct account.username
	    from AuditLog auditLog
	    join auditLog.userAccount account
	    where account.username is not null and trim(account.username) <> ''
	    order by account.username asc
	    """)
    List<String> findDistinctActorUsernames();

    @Query("""
	    select distinct account.email
	    from AuditLog auditLog
	    join auditLog.userAccount account
	    where account.email is not null and trim(account.email) <> ''
	    order by account.email asc
	    """)
    List<String> findDistinctActorEmails();
}