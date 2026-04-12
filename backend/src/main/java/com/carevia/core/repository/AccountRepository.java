package com.carevia.core.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Account;
import com.carevia.shared.constant.Role;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long>, JpaSpecificationExecutor<Account> {

    Optional<Account> findOneByEmailIgnoreCase(String email);
    Optional<Account> findOneByUsername(String username);
    Optional<Account> findByEmail(String email);
    boolean existsByRole(Role role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

}
