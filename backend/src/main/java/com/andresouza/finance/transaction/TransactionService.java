package com.andresouza.finance.transaction;

import com.andresouza.finance.exception.ResourceNotFoundException;
import com.andresouza.finance.transaction.TransactionDtos.CategoryAmount;
import com.andresouza.finance.transaction.TransactionDtos.DashboardResponse;
import com.andresouza.finance.transaction.TransactionDtos.MonthAmount;
import com.andresouza.finance.transaction.TransactionDtos.TransactionRequest;
import com.andresouza.finance.transaction.TransactionDtos.TransactionResponse;
import com.andresouza.finance.transaction.TransactionRepository.MonthlyTotal;
import com.andresouza.finance.transaction.TransactionRepository.TypeTotal;
import com.andresouza.finance.user.UserRepository;
import com.andresouza.finance.web.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TransactionService {

    private final TransactionRepository transactions;
    private final UserRepository users;

    public TransactionService(TransactionRepository transactions, UserRepository users) {
        this.transactions = transactions;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> search(Long userId, YearMonth month, TransactionType type, Category category,
                                                    Pageable pageable) {
        return PageResponse.of(
                transactions.search(userId, month.atDay(1), month.atEndOfMonth(), type, category, pageable),
                TransactionResponse::from);
    }

    @Transactional
    public TransactionResponse create(Long userId, TransactionRequest request) {
        Transaction transaction = new Transaction(users.getReferenceById(userId), request.description().trim(),
                request.amount(), request.type(), request.category(), request.date());
        return TransactionResponse.from(transactions.save(transaction));
    }

    @Transactional
    public TransactionResponse update(Long userId, Long id, TransactionRequest request) {
        Transaction transaction = getOwned(userId, id);
        transaction.update(request.description().trim(), request.amount(), request.type(), request.category(), request.date());
        return TransactionResponse.from(transaction);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        transactions.delete(getOwned(userId, id));
    }

    /** Consolida o mês escolhido e a evolução dos seis meses anteriores, com agregações feitas no banco. */
    @Transactional(readOnly = true)
    public DashboardResponse dashboard(Long userId, YearMonth month) {
        Map<TransactionType, BigDecimal> totals = transactions.totalsByType(userId, month.atDay(1), month.atEndOfMonth())
                .stream()
                .collect(Collectors.toMap(TypeTotal::getType, TypeTotal::getTotal));
        BigDecimal income = totals.getOrDefault(TransactionType.INCOME, BigDecimal.ZERO);
        BigDecimal expense = totals.getOrDefault(TransactionType.EXPENSE, BigDecimal.ZERO);

        List<CategoryAmount> byCategory = transactions.expensesByCategory(userId, month.atDay(1), month.atEndOfMonth())
                .stream()
                .map(c -> new CategoryAmount(c.getCategory(), c.getTotal()))
                .toList();

        return new DashboardResponse(month.toString(), income, expense, income.subtract(expense), byCategory,
                lastSixMonths(userId, month));
    }

    private List<MonthAmount> lastSixMonths(Long userId, YearMonth month) {
        YearMonth first = month.minusMonths(5);
        Map<YearMonth, Map<TransactionType, BigDecimal>> grouped = transactions
                .monthlyTotals(userId, first.atDay(1), month.atEndOfMonth())
                .stream()
                .collect(Collectors.groupingBy(m -> YearMonth.of(m.getYear(), m.getMonth()),
                        Collectors.toMap(MonthlyTotal::getType, MonthlyTotal::getTotal)));

        // Meses sem movimento também aparecem no gráfico, com zero
        return Stream.iterate(first, m -> m.plusMonths(1)).limit(6)
                .map(m -> {
                    Map<TransactionType, BigDecimal> values = grouped.getOrDefault(m, Map.of());
                    return new MonthAmount(m.toString(),
                            values.getOrDefault(TransactionType.INCOME, BigDecimal.ZERO),
                            values.getOrDefault(TransactionType.EXPENSE, BigDecimal.ZERO));
                })
                .toList();
    }

    private Transaction getOwned(Long userId, Long id) {
        return transactions.findById(id)
                .filter(t -> t.belongsTo(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Lançamento", id));
    }
}
