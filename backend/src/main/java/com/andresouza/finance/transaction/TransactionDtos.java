package com.andresouza.finance.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class TransactionDtos {

    private TransactionDtos() {
    }

    public record TransactionRequest(
            @NotBlank @Size(max = 140) String description,
            @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal amount,
            @NotNull TransactionType type,
            @NotNull Category category,
            @NotNull LocalDate date) {
    }

    public record TransactionResponse(Long id, String description, BigDecimal amount, TransactionType type,
                                      Category category, LocalDate date) {

        static TransactionResponse from(Transaction t) {
            return new TransactionResponse(t.getId(), t.getDescription(), t.getAmount(), t.getType(), t.getCategory(), t.getDate());
        }
    }

    public record CategoryAmount(Category category, BigDecimal total) {
    }

    public record MonthAmount(String month, BigDecimal income, BigDecimal expense) {
    }

    public record DashboardResponse(String month, BigDecimal income, BigDecimal expense, BigDecimal balance,
                                    List<CategoryAmount> expensesByCategory, List<MonthAmount> lastSixMonths) {
    }
}
