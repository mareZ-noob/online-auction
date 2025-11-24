package wnc.auction.backend.utils;

import jakarta.annotation.PostConstruct;
import org.slf4j.helpers.FormattingTuple;
import org.slf4j.helpers.MessageFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

@Configuration
@ConfigurationProperties(prefix = "messages")
public class MessagesUtils {

    @Value("${messages.locale:en}")
    private String configuredLocale;

    private static ResourceBundle messageBundle;

    @SuppressWarnings({"java:S2696"})
    @PostConstruct
    public void init() {
        Locale locale;
        if ("vi".equalsIgnoreCase(configuredLocale)) {
            locale = Constants.LocaleConstant.LOCALE_VN;
        } else {
            locale = Constants.LocaleConstant.LOCALE_EN;
        }
        messageBundle = ResourceBundle.getBundle("messages.messages", locale);
    }

    public static String getMessage(String messageKey, Object... args) {
        String message;
        try {
            message = messageBundle.getString(messageKey);
        } catch (MissingResourceException ex) {
            message = messageKey;
        }
        FormattingTuple formattingTuple = MessageFormatter.arrayFormat(message, args);
        return formattingTuple.getMessage();
    }
}
