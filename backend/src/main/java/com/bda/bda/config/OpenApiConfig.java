package com.bda.bda.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .servers(List.of(new Server().url("/api")))
                .info(new Info().title("BDA — API").description("REST API").version("v1")
                        .contact(new Contact().name("BDA School").email("bda@ecole.mg")));
    }
}