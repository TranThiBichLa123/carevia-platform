package com.carevia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CareviaBackendApplication {

	public static void main(String[] args) {
		// Thêm dòng này vào TRƯỚC SpringApplication.run
		System.setProperty("user.timezone", "UTC");

		SpringApplication.run(CareviaBackendApplication.class, args);
	}

}
