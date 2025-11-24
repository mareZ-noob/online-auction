package wnc.auction.backend.utils;

import lombok.experimental.UtilityClass;

import java.util.Locale;

@UtilityClass
public class Constants {

    @UtilityClass
    public static final class ErrorCode {

        public static final String UNAUTHENTICATED = "ACTION FAILED, PLEASE LOGIN";
        public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
        public static final String USER_WITH_EMAIL_ALREADY_EXITED = "USER_WITH_EMAIL_ALREADY_EXITED";
        public static final String USER_WITH_EMAIL_NOT_FOUND = "USER_WITH_EMAIL_NOT_FOUND";
        public static final String USER_WITH_USERNAME_NOT_FOUND = "USER_WITH_USERNAME_NOT_FOUND";
        public static final String USERNAME_ALREADY_EXITED = "USERNAME_ALREADY_EXITED";
        public static final String WRONG_EMAIL_FORMAT = "WRONG_EMAIL_FORMAT";
        public static final String PASSWORD_MISMATCH = "PASSWORD_MISMATCH";
        public static final String INVALID_CURRENT_PASSWORD = "INVALID_CURRENT_PASSWORD";
        public static final String FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR";
        public static final String INVALID_FILE_TYPE = "INVALID_FILE_TYPE";
    }

    @UtilityClass
    public static final class LocaleConstant {
        public static final Locale LOCALE_EN = Locale.of("en", "US");
        public static final Locale LOCALE_VN = Locale.of("vi", "VN");

    }
}
