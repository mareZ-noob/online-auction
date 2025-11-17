package wnc.auction.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfig {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @Bean
    public void createUploadDirectory() {
        java.io.File uploadDirectory = new java.io.File(uploadDir);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }
    }
}