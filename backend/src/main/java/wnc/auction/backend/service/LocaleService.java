package wnc.auction.backend.service;

import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import wnc.auction.backend.model.User;
import wnc.auction.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocaleService {

    private final UserRepository userRepository;

    /**
     * Get locale based on user's region
     *
     * @param userId User ID
     * @return Locale object (Vietnamese for VN, English for others)
     */
    public Locale getLocaleByUserId(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found: {}, defaulting to English", userId);
            return Locale.ENGLISH;
        }

        return getLocaleFromUser(user);
    }

    /**
     * Get locale based on user email
     *
     * @param email User email
     * @return Locale object
     */
    public Locale getLocaleByEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            log.warn("User not found by email: {}, defaulting to English", email);
            return Locale.ENGLISH;
        }

        return getLocaleFromUser(user);
    }

    /**
     * Get locale from User object
     *
     * @param user User entity
     * @return Locale object
     */
    public Locale getLocaleFromUser(User user) {
        // Priority 1: User's preferred language setting
        if (user.getPreferredLanguage() != null && !user.getPreferredLanguage().isEmpty()) {
            return parseLocale(user.getPreferredLanguage());
        }

        // Priority 2: User's region
        if (user.getRegion() != null && !user.getRegion().isEmpty()) {
            return getLocaleByRegion(user.getRegion());
        }

        // Default: English
        return Locale.ENGLISH;
    }

    /**
     * Get locale by region code
     *
     * @param region Region code (e.g., "VN", "US")
     * @return Locale object
     */
    public Locale getLocaleByRegion(String region) {
        if (region == null || region.isEmpty()) {
            return Locale.ENGLISH;
        }

        String upperRegion = region.toUpperCase();

        // Vietnam -> Vietnamese
        if ("VN".equals(upperRegion)) {
            return Locale.of("vi", "VN");
        }

        // Default: English for all other regions
        return Locale.ENGLISH;
    }

    /**
     * Parse locale string (e.g., "vi-VN", "en-US")
     *
     * @param localeString Locale string
     * @return Locale object
     */
    private Locale parseLocale(String localeString) {
        if (localeString == null || localeString.isEmpty()) {
            return Locale.ENGLISH;
        }

        if (localeString.contains("-") || localeString.contains("_")) {
            String[] parts = localeString.split("[-_]");
            if (parts.length == 2) {
                return Locale.of(parts[0], parts[1]);
            } else if (parts.length == 1) {
                return Locale.of(parts[0]);
            }
        }

        // Simple locale code (e.g., "vi", "en")
        if ("vi".equalsIgnoreCase(localeString)) {
            return Locale.of("vi", "VN");
        }

        return Locale.of(localeString);
    }

    /**
     * Get language code from locale (for backward compatibility)
     *
     * @param locale Locale object
     * @return Language code string (e.g., "vi", "en")
     */
    public String getLanguageCode(Locale locale) {
        return locale.getLanguage();
    }
}
