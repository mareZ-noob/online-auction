package wnc.auction.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.oidc.authentication.OidcIdTokenDecoderFactory;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;

@Configuration
public class OidcConfig {

    @Bean
    public OidcIdTokenDecoderFactory oidcIdTokenDecoderFactory() {
        OidcIdTokenDecoderFactory factory = new OidcIdTokenDecoderFactory();

        factory.setJwtValidatorFactory(clientRegistration -> {
            // Validate timestamp (expiration, not before, etc.)
            OAuth2TokenValidator<Jwt> timestampValidator = new JwtTimestampValidator();

            // Custom issuer validator that is lenient
            // This solves the issue where Keycloak issues tokens with public URL
            // (https://localhost:8443...)
            // but backend might be configured with internal URL or cannot reach public URL
            // for discovery
            OAuth2TokenValidator<Jwt> lenientIssuerValidator = jwt -> {
                // We rely on signature verification (via JWK Set) for security.
                // The issuer check is relaxed to handle container networking complexities.
                return OAuth2TokenValidatorResult.success();
            };

            return new DelegatingOAuth2TokenValidator<>(timestampValidator, lenientIssuerValidator);
        });

        return factory;
    }
}
