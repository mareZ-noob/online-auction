package wnc.auction.backend.utils;

import java.util.Locale;
import lombok.experimental.UtilityClass;

@UtilityClass
public class Constants {

    @UtilityClass
    public static final class ErrorCode {

        // Common & System & Permissions
        public static final String ACCESS_DENIED = "ACCESS_DENIED";
        public static final String FORBIDDEN = "FORBIDDEN";
        public static final String UNAUTHENTICATED = "UNAUTHENTICATED"; // Shortened key to match properties
        public static final String AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED";
        public static final String RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
        public static final String API_VERSION_NOT_SUPPORTED = "API_VERSION_NOT_SUPPORTED";

        // Authentication (JWT, OTP, OAuth2, Password)
        // Token & Auth Code
        public static final String INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN";
        public static final String REFRESH_TOKEN_EXPIRED = "REFRESH_TOKEN_EXPIRED";
        public static final String INVALID_AUTH_CODE = "INVALID_AUTH_CODE";
        public static final String AUTH_PROCESSING_ERROR = "AUTH_PROCESSING_ERROR";

        // OTP
        public static final String INVALID_OTP = "INVALID_OTP";

        // Password
        public static final String PASSWORD_MISMATCH = "PASSWORD_MISMATCH";
        public static final String INVALID_CURRENT_PASSWORD = "INVALID_CURRENT_PASSWORD";

        // User & Account Management
        // Existence
        public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
        public static final String USER_WITH_EMAIL_NOT_FOUND = "USER_WITH_EMAIL_NOT_FOUND";
        public static final String USER_WITH_USERNAME_NOT_FOUND = "USER_WITH_USERNAME_NOT_FOUND";
        public static final String USER_WITH_EMAIL_ALREADY_EXITED = "USER_WITH_EMAIL_ALREADY_EXITED";
        public static final String USERNAME_ALREADY_EXITED = "USERNAME_ALREADY_EXITED";

        // Account Status
        public static final String ACCOUNT_DEACTIVATED = "ACCOUNT_DEACTIVATED";
        public static final String EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";
        public static final String EMAIL_ALREADY_VERIFIED = "EMAIL_ALREADY_VERIFIED";
        public static final String WRONG_EMAIL_FORMAT = "WRONG_EMAIL_FORMAT";

        // Social Linking
        public static final String SOCIAL_ACCOUNT_ALREADY_LINKED = "SOCIAL_ACCOUNT_ALREADY_LINKED";
        public static final String ACCOUNT_LINKING_FAILED = "ACCOUNT_LINKING_FAILED";

        // Resources & Business Logic (Files, Products, etc.)
        public static final String RESOURCE_ALREADY_EXISTED = "RESOURCE_ALREADY_EXISTED";
        public static final String PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND";
        public static final String FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR";
        public static final String INVALID_FILE_TYPE = "INVALID_FILE_TYPE";
        public static final String EMAIL_SENDING_FAILED = "EMAIL_SENDING_FAILED";
        public static final String INVALID_LOCALE = "INVALID_LOCALE";
    }

    @UtilityClass
    public static final class LocaleConstant {
        public static final Locale LOCALE_EN = Locale.of("en", "US");
        public static final Locale LOCALE_VN = Locale.of("vi", "VN");
    }
}
