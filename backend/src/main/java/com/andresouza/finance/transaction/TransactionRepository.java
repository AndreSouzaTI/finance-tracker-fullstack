package com.andresouza.finance.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
            SELECT t FROM Transaction t
            WHERE t.owner.id = :ownerId
              AND t.date BETWEEN :start AND :end
              AND (:type IS NULL OR t.type = :type)
              AND (:category IS NULL OR t.category = :category)
            """)
    Page<Transaction> search(@Param("ownerId") Long ownerId,
                             @Param("start") LocalDate start,
                             @Param("end") LocalDate end,
                             @Param("type") TransactionType type,
                             @Param("category") Category category,
                             Pageable pageable);

    /** Soma por tipo no período: base dos cards de receitas, despesas e saldo. */
    @Query("""
            SELECT t.type AS type, SUM(t.amount) AS total FROM Transaction t
            WHERE t.owner.id = :ownerId AND t.date BETWEEN :start AND :end
            GROUP BY t.type
            """)
    List<TypeTotal> totalsByType(@Param("ownerId") Long ownerId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("""
            SELECT t.category AS category, SUM(t.amount) AS total FROM Transaction t
            WHERE t.owner.id = :ownerId AND t.type = com.andresouza.finance.transaction.TransactionType.EXPENSE
              AND t.date BETWEEN :start AND :end
            GROUP BY t.category
            ORDER BY SUM(t.amount) DESC
            """)
    List<CategoryTotal> expensesByCategory(@Param("ownerId") Long ownerId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    /** Receitas e despesas agrupadas por mês, para o gráfico de evolução. */
    @Query("""
            SELECT YEAR(t.date) AS year, MONTH(t.date) AS month, t.type AS type, SUM(t.amount) AS total
            FROM Transaction t
            WHERE t.owner.id = :ownerId AND t.date BETWEEN :start AND :end
            GROUP BY YEAR(t.date), MONTH(t.date), t.type
            """)
    List<MonthlyTotal> monthlyTotals(@Param("ownerId") Long ownerId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    interface TypeTotal {
        TransactionType getType();

        BigDecimal getTotal();
    }

    interface CategoryTotal {
        Category getCategory();

        BigDecimal getTotal();
    }

    interface MonthlyTotal {
        Integer getYear();

        Integer getMonth();

        TransactionType getType();

        BigDecimal getTotal();
    }
}
