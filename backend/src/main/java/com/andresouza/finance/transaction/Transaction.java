package com.andresouza.finance.transaction;

import com.andresouza.finance.exception.BusinessException;
import com.andresouza.finance.user.AppUser;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    @Column(nullable = false, length = 140)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Transaction() {
    }

    public Transaction(AppUser owner, String description, BigDecimal amount, TransactionType type,
                       Category category, LocalDate date) {
        this.owner = owner;
        update(description, amount, type, category, date);
    }

    public void update(String description, BigDecimal amount, TransactionType type, Category category, LocalDate date) {
        if (!category.accepts(type)) {
            throw new BusinessException("A categoria %s não é válida para %s".formatted(category, type));
        }
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.date = date;
    }

    public boolean belongsTo(Long userId) {
        return owner.getId().equals(userId);
    }

    public Long getId() { return id; }
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public TransactionType getType() { return type; }
    public Category getCategory() { return category; }
    public LocalDate getDate() { return date; }
}
