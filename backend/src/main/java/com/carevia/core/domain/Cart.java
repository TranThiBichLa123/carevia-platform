package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.entity.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    public void addItem(Device device, int quantity) {
        CartItem existing = items.stream()
                .filter(item -> item.getDevice().getId().equals(device.getId()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(this)
                    .device(device)
                    .quantity(quantity)
                    .build();
            items.add(newItem);
        }
    }

    public void removeItem(Long deviceId) {
        items.removeIf(item -> item.getDevice().getId().equals(deviceId));
    }

    public void updateItemQuantity(Long deviceId, int quantity) {
        items.stream()
                .filter(item -> item.getDevice().getId().equals(deviceId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
    }

    public void clear() {
        items.clear();
    }
}
