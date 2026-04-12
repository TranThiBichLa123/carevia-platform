package com.carevia.core.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.Client;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {
    Optional<Client> findByAccount(Account account);

    Optional<Client> findByClientCode(String clientCode);

    @Query("SELECT c FROM Client c JOIN FETCH c.account WHERE c.id = :id")
    Optional<Client> findByIdWithAccount(@Param("id") Long id);

    @Query("SELECT c FROM Client c JOIN FETCH c.account WHERE c.clientCode = :code")
    Optional<Client> findByClientCodeWithAccount(@Param("code") String code);
}

