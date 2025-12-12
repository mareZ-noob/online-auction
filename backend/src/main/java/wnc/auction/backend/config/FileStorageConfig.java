package wnc.auction.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import wnc.auction.backend.service.FileStorageService;

@Configuration
public class FileStorageConfig {

    @Value("${app.file.storage-type:local}")
    private String storageType;

    @Bean
    @Primary
    public FileStorageService fileStorageService(ApplicationContext context) {
        if ("minio".equalsIgnoreCase(storageType)) {
            return (FileStorageService) context.getBean("minioStorage");
        } else {
            return (FileStorageService) context.getBean("localStorage");
        }
    }
}
