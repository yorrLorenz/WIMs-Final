package com.wims.config;

import com.wims.model.Log;
import com.wims.repository.LogRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class TestDataLoader {
/*
    @Bean
    public CommandLineRunner loadTestData(LogRepository logRepository) {
        return args -> {
            logRepository.save(new Log(
                null,
                LocalDateTime.of(2025, 5, 1, 10, 0),
                "admin",
                "Restocked",
                "TestItem1",
                "a",
                "Shelf A",
                "ID-TEST-0001"
            ));

            logRepository.save(new Log(
                null,
                LocalDateTime.of(2025, 5, 3, 14, 30),
                "admin",
                "Removed",
                "TestItem2",
                "a",
                "Shelf B",
                "ID-TEST-0002"
            ));

            logRepository.save(new Log(
                null,
                LocalDateTime.now(),
                "admin",
                "Restocked",
                "TodayItem",
                "a",
                "Shelf C",
                "ID-TEST-0003"
            ));
        };
    } */
}
