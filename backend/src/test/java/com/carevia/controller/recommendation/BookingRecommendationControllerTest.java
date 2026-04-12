package com.carevia.controller.recommendation;

import com.carevia.config.security.SecurityConfig;
import com.carevia.service.recommendation.FuzzyTopsisService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = BookingRecommendationController.class)
@Import({FuzzyTopsisService.class, SecurityConfig.class})
class BookingRecommendationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void shouldReturnDemoRanking() throws Exception {
		mockMvc.perform(get("/api/v1/recommendations/bookings/fuzzy-topsis/demo"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.algorithm").value("Fuzzy TOPSIS"))
			.andExpect(jsonPath("$.rankings[0].rank").value(1))
			.andExpect(jsonPath("$.rankings[0].recommended").value(true));
	}

	@Test
	void shouldRankDominantAlternative() throws Exception {
		String requestBody = """
			{
			  \"scenarioName\": \"Recommend best booking\",
			  \"serviceId\": \"svc-001\",
			  \"criteria\": [
			    {
			      \"id\": \"availability\",
			      \"name\": \"Availability\",
			      \"preference\": \"BENEFIT\",
			      \"weight\": { \"linguisticTerm\": \"VERY_HIGH\" }
			    }
			  ],
			  \"alternatives\": [
			    {
			      \"optionId\": \"best-option\",
			      \"sessionId\": \"sess-best\",
			      \"branchName\": \"CareVia Quan 1\",
			      \"locationDetail\": \"Room A\",
			      \"startTime\": \"2026-04-15T09:00:00Z\",
			      \"endTime\": \"2026-04-15T10:00:00Z\",
			      \"criteriaScores\": {
			        \"availability\": { \"linguisticTerm\": \"VERY_HIGH\" }
			      }
			    },
			    {
			      \"optionId\": \"weak-option\",
			      \"sessionId\": \"sess-weak\",
			      \"branchName\": \"CareVia Thu Duc\",
			      \"locationDetail\": \"Room B\",
			      \"startTime\": \"2026-04-15T13:00:00Z\",
			      \"endTime\": \"2026-04-15T14:00:00Z\",
			      \"criteriaScores\": {
			        \"availability\": { \"linguisticTerm\": \"LOW\" }
			      }
			    }
			  ]
			}
			""";

		mockMvc.perform(post("/api/v1/recommendations/bookings/fuzzy-topsis/rank")
				.contentType(MediaType.APPLICATION_JSON)
				.content(requestBody))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.rankings[0].optionId").value("best-option"))
			.andExpect(jsonPath("$.rankings[0].recommended").value(true))
			.andExpect(jsonPath("$.rankings[1].optionId").value("weak-option"));
	}
}