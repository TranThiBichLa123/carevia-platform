package com.carevia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.carevia.config.gateway.ZaloPayConfig;

@SpringBootApplication
@EnableConfigurationProperties(ZaloPayConfig.class)
public class CareviaBackendApplication {

	public static void main(String[] args) {
		// Thêm dòng này vào TRƯỚC SpringApplication.run
		System.setProperty("user.timezone", "UTC");

		SpringApplication.run(CareviaBackendApplication.class, args);
	}

}
