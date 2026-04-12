package com.carevia.core.domain;


import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.entity.PersonBase;

/**
 * Client entity with Rich Domain Model - inherits profile behaviors from PersonBase
 */
@Entity
@Table(name = "clients")
@Getter
@Setter // Keep for backward compatibility with existing code
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Client extends PersonBase implements BaseProfile{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "client_code", length = 50, unique = true)
    private String clientCode;

    // Client-specific behaviors can be added here as needed

}
