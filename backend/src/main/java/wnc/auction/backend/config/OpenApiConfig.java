package wnc.auction.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Value("${app.openapi.dev-url}")
    private String devUrl;

    @Value("${app.openapi.prod-url}")
    private String prodUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url(devUrl).description("Development Server"),
                        new Server().url(prodUrl).description("Production Server")))
                .info(new Info()
                        .title("Online Auction API")
                        .version("1.0.0")
                        .description("RESTful API for Online Auction Platform - WNC Final Project")
                        .contact(new Contact()
                                .name("WNC Team")
                                .email("contact@auction.com")
                                .url("https://auction.com"))
                        .license(new License().name("MIT License").url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes(
                                "Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token")));
    }
}
