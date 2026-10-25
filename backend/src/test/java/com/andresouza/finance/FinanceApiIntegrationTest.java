package com.andresouza.finance;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class FinanceApiIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void dashboardAggregatesTheMonthAndTheLastSixMonths() throws Exception {
        String token = registerAndLogin();
        create(token, "Salário", "5000.00", "INCOME", "SALARY", "2026-05-05");
        create(token, "Aluguel", "1800.00", "EXPENSE", "HOUSING", "2026-05-10");
        create(token, "Mercado", "650.40", "EXPENSE", "FOOD", "2026-05-12");
        create(token, "Restaurante", "120.00", "EXPENSE", "FOOD", "2026-05-20");
        create(token, "Freela", "900.00", "INCOME", "FREELANCE", "2026-03-15");
        create(token, "Fora do período", "999.00", "EXPENSE", "LEISURE", "2025-10-01");

        mvc.perform(get("/api/dashboard").param("month", "2026-05").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.income").value(5000.00))
                .andExpect(jsonPath("$.expense").value(2570.40))
                .andExpect(jsonPath("$.balance").value(2429.60))
                .andExpect(jsonPath("$.expensesByCategory[0].category").value("HOUSING"))
                .andExpect(jsonPath("$.expensesByCategory[1].total").value(770.40))
                .andExpect(jsonPath("$.lastSixMonths.length()").value(6))
                .andExpect(jsonPath("$.lastSixMonths[0].month").value("2025-12"))
                .andExpect(jsonPath("$.lastSixMonths[3].income").value(900.00))
                .andExpect(jsonPath("$.lastSixMonths[5].expense").value(2570.40));

        mvc.perform(get("/api/transactions").param("month", "2026-05").param("type", "EXPENSE")
                        .header("Authorization", token))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.content[0].description").value("Restaurante"));
    }

    @Test
    void rejectsCategoryThatDoesNotMatchTheType() throws Exception {
        String token = registerAndLogin();

        mvc.perform(post("/api/transactions").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Salário", "100.00", "EXPENSE", "SALARY", "2026-05-01")))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void usersCannotTouchTransactionsFromOthers() throws Exception {
        String ana = registerAndLogin();
        String bruno = registerAndLogin();
        Integer id = create(ana, "Academia", "99.90", "EXPENSE", "HEALTH", "2026-05-03");

        mvc.perform(delete("/api/transactions/{id}", id).header("Authorization", bruno))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/dashboard").param("month", "2026-05").header("Authorization", bruno))
                .andExpect(jsonPath("$.expense").value(0));
    }

    private Integer create(String token, String description, String amount, String type, String category, String date)
            throws Exception {
        String response = mvc.perform(post("/api/transactions").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(description, amount, type, category, date)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.id");
    }

    private static String body(String description, String amount, String type, String category, String date) {
        return """
                {"description": "%s", "amount": %s, "type": "%s", "category": "%s", "date": "%s"}
                """.formatted(description, amount, type, category, date);
    }

    private String registerAndLogin() throws Exception {
        String email = "user-" + UUID.randomUUID() + "@test.com";
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Usuário\", \"email\": \"%s\", \"password\": \"senha-segura\"}".formatted(email)))
                .andExpect(status().isCreated());
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"%s\", \"password\": \"senha-segura\"}".formatted(email)))
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(response, "$.accessToken");
    }
}
