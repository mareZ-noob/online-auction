package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import wnc.auction.backend.model.SystemConfig;
import wnc.auction.backend.repository.SystemConfigRepository;

@Service
@RequiredArgsConstructor
public class SystemConfigService {
    private final SystemConfigRepository configRepository;

    // Get config as Integer with default fallback
    public int getIntConfig(String key, int defaultValue) {
        return configRepository
                .findByKey(key)
                .map(config -> Integer.parseInt(config.getValue()))
                .orElse(defaultValue);
    }

    // Update config
    public void updateConfig(String key, String value) {
        SystemConfig config = configRepository
                .findByKey(key)
                .orElse(SystemConfig.builder().key(key).build());
        config.setValue(value);
        configRepository.save(config);
    }
}
