package wnc.auction.backend.utils;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessagesUtils {

    private final MessageSource messageSource;
    private static MessageSource staticMessageSource;

    @PostConstruct
    public void init() {
        staticMessageSource = messageSource;
    }

    public static String getMessage(String code, Object... args) {
        try {
            return staticMessageSource.getMessage(code, args, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            return code;
        }
    }

    public static String getMessageDefault(String code, String defaultValue, Object... args) {
        try {
            return staticMessageSource.getMessage(code, args, defaultValue, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            return defaultValue;
        }
    }
}