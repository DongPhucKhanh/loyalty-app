package com.doan.loyaltyapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // <--- Import này

@SpringBootApplication
@EnableScheduling
public class LoyaltyappApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoyaltyappApplication.class, args);
	}

}
