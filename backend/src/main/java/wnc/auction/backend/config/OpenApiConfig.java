package wnc.auction.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.oauth2.core.oidc.OidcScopes;

@Configuration
public class OpenApiConfig {

    @Value("${springdoc.oauthflow.authorization-url}")
    private String authorizationUrl;

    @Value("${springdoc.oauthflow.token-url}")
    private String tokenUrl;

    @Value("${springdoc.oauth.client-id}")
    private String clientID;

    @Value("${springdoc.oauth.use-pkce-with-authorization-code-grant}")
    private boolean usePKCE;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("http://localhost:8088").description("Development Server"),
                        new Server().url("https://api.auction.com").description("Production Server")))
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
                                        .description("Enter JWT token"))
                        .addSecuritySchemes(
                                "oauth2_bearer",
                                new SecurityScheme()
                                        .name("oauth2_bearer")
                                        .type(SecurityScheme.Type.OAUTH2)
                                        .flows(new OAuthFlows()
                                                .authorizationCode(new OAuthFlow()
                                                        .authorizationUrl(authorizationUrl)
                                                        .tokenUrl(tokenUrl)
                                                        .scopes(new Scopes()
                                                                .addString(OidcScopes.OPENID, OidcScopes.OPENID))))
                                        .description("OAuth2 Bearer Token Authentication")));
    }

    @Bean
    @Primary
    public SwaggerUiOAuthProperties swaggerUiOAuthProperties() {
        SwaggerUiOAuthProperties properties = new SwaggerUiOAuthProperties();
        properties.setClientId(clientID);
        properties.setUsePkceWithAuthorizationCodeGrant(usePKCE);

        return properties;
    }

    @Bean
    public MappingJackson2HttpMessageConverter octetStreamJsonConverter() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setSupportedMediaTypes(List.of(new MediaType("application", "octet-stream")));
        return converter;
    }
}
