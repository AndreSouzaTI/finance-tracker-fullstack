package com.andresouza.finance.transaction;

/** Categorias fixas, cada uma válida para receitas, despesas ou ambos. */
public enum Category {
    SALARY(TransactionType.INCOME),
    FREELANCE(TransactionType.INCOME),
    INVESTMENTS(TransactionType.INCOME),
    HOUSING(TransactionType.EXPENSE),
    FOOD(TransactionType.EXPENSE),
    TRANSPORT(TransactionType.EXPENSE),
    HEALTH(TransactionType.EXPENSE),
    EDUCATION(TransactionType.EXPENSE),
    LEISURE(TransactionType.EXPENSE),
    OTHER(null);

    private final TransactionType allowedType;

    Category(TransactionType allowedType) {
        this.allowedType = allowedType;
    }

    public boolean accepts(TransactionType type) {
        return allowedType == null || allowedType == type;
    }
}
