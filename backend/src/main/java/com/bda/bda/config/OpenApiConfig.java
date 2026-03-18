package com.bda.bda.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI().info(new Info().title("BDA — API").description("REST API for managing student grades with PostgreSQL trigger-based auditing and average recalculation").version("v1")
                        .contact(new Contact().name("BDA School").email("bda@ecole.mg")));
    }
}