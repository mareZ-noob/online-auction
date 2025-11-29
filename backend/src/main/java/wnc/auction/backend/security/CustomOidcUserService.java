package wnc.auction.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.AuthProvider;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.UserRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        try {
            return processOidcUser(userRequest, oidcUser);
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OidcUser processOidcUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        // Google/Keycloak returns email
        String email = oidcUser.getEmail();
        if (email == null) {
            // Fallback if email is not directly available
            email = oidcUser.getAttribute("email");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update existing user details if needed
            if (user.getProvider() == AuthProvider.LOCAL) {
                user.setProvider(AuthProvider.KEYCLOAK); // Migrate local to Keycloak
            }
            user.setProviderId(oidcUser.getSubject());
            user = userRepository.save(user);
        } else {
            user = registerNewUser(userRequest, oidcUser);
        }

        return UserPrincipal.create(user, oidcUser.getAttributes(), oidcUser.getIdToken(), oidcUser.getUserInfo());
    }

    private User registerNewUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        User user = new User();
        user.setProvider(AuthProvider.KEYCLOAK);
        user.setProviderId(oidcUser.getSubject());

        // Get full name
        String name = oidcUser.getFullName();
        if (name == null) name = oidcUser.getAttribute("name");
        if (name == null) name = oidcUser.getAttribute("preferred_username");
        user.setFullName(name);

        // Get email
        String email = oidcUser.getEmail();
        if (email == null) email = oidcUser.getAttribute("email");
        user.setEmail(email);

        user.setEmailVerified(true);
        user.setRole(UserRole.BIDDER);
        user.setPassword(""); // No password for OAuth users
        user.setIsActive(true);

        return userRepository.save(user);
    }
}