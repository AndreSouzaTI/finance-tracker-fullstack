package com.andresouza.finance;

import org.springframework.boot.SpringApplication;

public class TestFinanceTrackerApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(FinanceTrackerApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
