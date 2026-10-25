package com.andresouza.finance.transaction;

import com.andresouza.finance.transaction.TransactionDtos.DashboardResponse;
import com.andresouza.finance.transaction.TransactionDtos.TransactionRequest;
import com.andresouza.finance.transaction.TransactionDtos.TransactionResponse;
import com.andresouza.finance.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/api")
@Tag(name = "Lançamentos")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @GetMapping("/transactions")
    @Operation(summary = "Lista os lançamentos do mês (formato yyyy-MM), com filtros por tipo e categoria")
    public PageResponse<TransactionResponse> search(@AuthenticationPrincipal Jwt jwt,
                                                    @RequestParam(required = false) YearMonth month,
                                                    @RequestParam(required = false) TransactionType type,
                                                    @RequestParam(required = false) Category category,
                                                    @PageableDefault(size = 50, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.search(userId(jwt), monthOrCurrent(month), type, category, pageable);
    }

    @PostMapping("/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registra uma receita ou despesa")
    public TransactionResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody TransactionRequest request) {
        return service.create(userId(jwt), request);
    }

    @PutMapping("/transactions/{id}")
    @Operation(summary = "Edita um lançamento")
    public TransactionResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                      @Valid @RequestBody TransactionRequest request) {
        return service.update(userId(jwt), id, request);
    }

    @DeleteMapping("/transactions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Exclui um lançamento")
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.delete(userId(jwt), id);
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Receitas, despesas, saldo, gastos por categoria e evolução de 6 meses")
    public DashboardResponse dashboard(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) YearMonth month) {
        return service.dashboard(userId(jwt), monthOrCurrent(month));
    }

    private static YearMonth monthOrCurrent(YearMonth month) {
        return month != null ? month : YearMonth.now();
    }

    private static Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
