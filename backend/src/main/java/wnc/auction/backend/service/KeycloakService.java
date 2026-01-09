package wnc.auction.backend.service;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.security.oauth2.client.registration.keycloak-admin.client-id}")
    private String adminClientId;

    @Value("${spring.security.oauth2.client.registration.keycloak-admin.client-secret}")
    private String adminClientSecret;

    @Value("${spring.security.oauth2.client.provider.keycloak-admin.issuer-uri}")
    private String issuerUri;

    private String getAdminAccessToken() {
        String tokenEndpoint = issuerUri + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "client_credentials");
        map.add("client_id", adminClientId);
        map.add("client_secret", adminClientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            log.error("Failed to get Keycloak admin access token", e);
        }
        return null;
    }

    public void disableUser(String email) {
        String token = getAdminAccessToken();
        if (token == null) return;

        String userId = getKeycloakUserId(email, token);
        if (userId == null) {
            log.warn("User with email {} not found in Keycloak", email);
            return;
        }

        String adminBaseUrl = issuerUri.replace("/realms/", "/admin/realms/");
        String userEndpoint = adminBaseUrl + "/users/" + userId;

        // Disable user
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of("enabled", false);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(userEndpoint, HttpMethod.PUT, request, Void.class);
            log.info("Disabled user {} in Keycloak", email);
        } catch (Exception e) {
            log.error("Failed to disable user {} in Keycloak", email, e);
        }

        // Logout user
        String logoutEndpoint = userEndpoint + "/logout";
        try {
            restTemplate.exchange(logoutEndpoint, HttpMethod.POST, new HttpEntity<>(headers), Void.class);
            log.info("Logged out user {} from Keycloak", email);
        } catch (Exception e) {
            log.error("Failed to logout user {} from Keycloak", email, e);
        }
    }

    public void enableUser(String email) {
        String token = getAdminAccessToken();
        if (token == null) return;

        String userId = getKeycloakUserId(email, token);
        if (userId == null) {
            log.warn("User with email {} not found in Keycloak", email);
            return;
        }

        String adminBaseUrl = issuerUri.replace("/realms/", "/admin/realms/");
        String userEndpoint = adminBaseUrl + "/users/" + userId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of("enabled", true);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(userEndpoint, HttpMethod.PUT, request, Void.class);
            log.info("Enabled user {} in Keycloak", email);
        } catch (Exception e) {
            log.error("Failed to enable user {} in Keycloak", email, e);
        }
    }

    private String getKeycloakUserId(String email, String token) {
        String adminBaseUrl = issuerUri.replace("/realms/", "/admin/realms/");
        String usersEndpoint = adminBaseUrl + "/users?email=" + email;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(usersEndpoint, HttpMethod.GET, request, List.class);
            if (response.getStatusCode() == HttpStatus.OK
                    && response.getBody() != null
                    && !response.getBody().isEmpty()) {
                // Keycloak returns a list of users. We need to find the one with the matching
                // email (exact match)
                // although the query param ?email=... should filter it, it might return partial
                // matches depending on config.
                // But usually it returns exact match or list.
                // Let's assume the first one is correct or check email.
                for (Object obj : response.getBody()) {
                    if (obj instanceof Map) {
                        Map<?, ?> user = (Map<?, ?>) obj;
                        if (email.equalsIgnoreCase((String) user.get("email"))) {
                            return (String) user.get("id");
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to get Keycloak user ID for email {}", email, e);
        }
        return null;
    }
}
