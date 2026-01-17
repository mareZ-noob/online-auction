package wnc.auction.backend.security;

import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import wnc.auction.backend.model.enumeration.UserRole;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final CustomOidcUserService customOidcUserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.allow-hosts}")
    private String allowHosts;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/health/**",
                                "/api/auth/**",
                                "/api/public/**",
                                "/login/**",
                                "/login/oauth2/**",
                                "/oauth2/**",
                                "/api/products/search",
                                "/api/products/{id}",
                                "/api/products/category/{categoryId}",
                                "/api/products/top/**",
                                "/api/categories/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/api/swagger-ui.html",
                                "/api/swagger-ui/**",
                                "/api-docs/**",
                                "/v3/api-docs/**",
                                "/api/api-docs/**",
                                "/api/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/api/swagger-resources/**",
                                "/webjars/**",
                                "/api/webjars/**",
                                "/actuator/**")
                        .permitAll()

                        // Bidder endpoints
                        .requestMatchers("/api/bidder/**")
                        .hasAnyRole(UserRole.BIDDER.name(), UserRole.SELLER.name(), UserRole.ADMIN.name())

                        // Seller endpoints
                        .requestMatchers("/api/seller/**")
                        .hasAnyRole(UserRole.SELLER.name(), UserRole.ADMIN.name())

                        // Admin endpoints
                        .requestMatchers("/api/admin/**")
                        .hasRole(UserRole.ADMIN.name())

                        // All other requests require authentication
                        .anyRequest()
                        .authenticated())
                .oauth2Login(oauth2 -> oauth2.authorizationEndpoint(auth -> auth.baseUri("/api/auth/oauth2/authorize"))
                        .redirectionEndpoint(red -> red.baseUri("/login/oauth2/code/*"))
                        .userInfoEndpoint(
                                userInfo -> userInfo.oidcUserService(customOidcUserService) // For
                                // Keycloak/OIDC
                                )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(customAuthenticationEntryPoint));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowHosts));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-auth-token"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
