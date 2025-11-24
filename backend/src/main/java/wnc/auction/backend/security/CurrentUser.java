package wnc.auction.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    public static UserPrincipal get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }

        return null;
    }

    public static Long getUserId() {
        UserPrincipal user = get();
        return user != null ? user.getId() : null;
    }

    public static String getEmail() {
        UserPrincipal user = get();
        return user != null ? user.getEmail() : null;
    }

    public static boolean isAdmin() {
        UserPrincipal user = get();
        return user != null && "ADMIN".equals(user.getRole());
    }

    public static boolean isSeller() {
        UserPrincipal user = get();
        return user != null && ("SELLER".equals(user.getRole()) || "ADMIN".equals(user.getRole()));
    }
}
