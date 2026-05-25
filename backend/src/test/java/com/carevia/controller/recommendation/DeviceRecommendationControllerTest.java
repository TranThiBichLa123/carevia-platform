package com.carevia.controller.recommendation;

import com.carevia.config.security.SecurityConfig;
import com.carevia.service.recommendation.FuzzyTopsisService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import com.carevia.shared.util.TokenProvider;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DeviceRecommendationController.class)
@Import({FuzzyTopsisService.class, SecurityConfig.class})
class DeviceRecommendationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private TokenProvider tokenProvider;

	@MockBean
	private UserDetailsService userDetailsService;

	@Test
	void shouldRankDevicesWithoutAuthentication() throws Exception {
		String requestBody = """
			{
			  \"scenarioName\": \"Recommend best device\",
			  \"criteria\": [
			    {
			      \"id\": \"price\",
			      \"name\": \"Price\",
			      \"preference\": \"COST\",
			      \"weight\": { \"linguisticTerm\": \"VERY_HIGH\" }
			    }
			  ],
			  \"alternatives\": [
			    {
			      \"optionId\": \"device-best\",
			      \"deviceId\": \"device-best\",
			      \"name\": \"Budget Device\",
			      \"criteriaScores\": {
			        \"price\": { \"value\": 10.0 }
			      }
			    },
			    {
			      \"optionId\": \"device-weak\",
			      \"deviceId\": \"device-weak\",
			      \"name\": \"Premium Device\",
			      \"criteriaScores\": {
			        \"price\": { \"value\": 50.0 }
			      }
			    }
			  ]
			}
			""";

		mockMvc.perform(post("/api/v1/recommendations/devices/fuzzy-topsis/rank")
				.contentType(MediaType.APPLICATION_JSON)
				.content(requestBody))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.algorithm").value("Fuzzy TOPSIS"))
			.andExpect(jsonPath("$.rankings[0].deviceId").value("device-best"))
			.andExpect(jsonPath("$.rankings[0].recommended").value(true));
	}
}