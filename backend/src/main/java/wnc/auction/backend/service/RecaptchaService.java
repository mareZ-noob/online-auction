package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import wnc.auction.backend.dto.response.RecaptchaResponse;
import wnc.auction.backend.exception.BadRequestException;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecaptchaService {

    private final RestTemplate restTemplate;

    @Value("${app.recaptcha.secret}")
    private String recaptchaSecret;

    @Value("${app.recaptcha.verify-url}")
    private String recaptchaVerifyUrl;

    public void validateToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new BadRequestException("reCAPTCHA token is missing");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("secret", recaptchaSecret);
            map.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            RecaptchaResponse response = restTemplate.postForObject(
                    recaptchaVerifyUrl,
                    request,
                    RecaptchaResponse.class
            );

            if (response == null || !response.isSuccess()) {
                log.error("reCAPTCHA validation failed. Response: {}", response);
                throw new BadRequestException("reCAPTCHA validation failed");
            }

        } catch (Exception e) {
            log.error("Error verifying reCAPTCHA", e);
            throw new BadRequestException("Invalid reCAPTCHA token");
        }
    }
}
