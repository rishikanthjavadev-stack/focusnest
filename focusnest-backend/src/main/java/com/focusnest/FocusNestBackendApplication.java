package com.focusnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FocusNestBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(FocusNestBackendApplication.class, args);
    }
}
