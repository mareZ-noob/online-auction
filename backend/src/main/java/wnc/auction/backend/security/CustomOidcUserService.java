package wnc.auction.backend.security.oauth2;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.exception.OAuth2DuplicateEmailException;
import wnc.auction.backend.model.SocialAccount;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.AuthProvider;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.SocialAccountRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.UserPrincipal;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;

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
        String providerId = oidcUser.getSubject();
        String email = oidcUser.getEmail();

        log.info("Processing OIDC User");
        log.info("Email: {}", email);
        log.info("Provider ID: {}", providerId);
        log.info("Email Verified: {}", oidcUser.getEmailVerified());

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        // Check if social account already exists
        Optional<SocialAccount> socialAccountOptional = socialAccountRepository.findByProviderAndProviderId(provider, providerId);

        User user;
        if (socialAccountOptional.isPresent()) {
            // Already logged in with this social account before
            user = socialAccountOptional.get().getUser();
            updateExistingUser(user, oidcUser);
            log.info("Existing social account found, user logged in: {}", user.getEmail());
        } else {
            // Never logged in with this social account before
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isPresent()) {
                // EXISTING LOCAL ACCOUNT - Require email verification for linking
                user = userOptional.get();

                Boolean emailVerified = oidcUser.getEmailVerified();
                if (emailVerified == null) {
                    emailVerified = oidcUser.getAttribute("email_verified");
                }

                log.info("Found existing local account. Email verified from provider: {}", emailVerified);

                // For existing accounts, require email verification before linking
                if (Boolean.TRUE.equals(emailVerified)) {
                    log.info("Auto linking Local Account {} to Provider {}", email, provider);
                    try {
                        linkSocialAccount(user, provider, providerId, oidcUser);
                    } catch (Exception e) {
                        log.error("Failed to link social account: {}", e.getMessage(), e);
                        throw new OAuth2AuthenticationException("Failed to link accounts: " + e.getMessage());
                    }
                } else {
                    log.warn("Cannot link - email not verified by provider: {}", email);
                    throw new OAuth2DuplicateEmailException(
                            "email_not_verified",
                            "An account with email " + email + " already exists. " +
                                    "Please login with your existing credentials or verify your email with " + provider,
                            null
                    );
                }
            } else {
                // NEW USER REGISTRATION
                // Allow registration even if email is not verified yet
                // Keycloak will handle the verification flow
                log.info("Registering new user: {}", email);

                Boolean emailVerified = oidcUser.getEmailVerified();
                if (emailVerified == null) {
                    emailVerified = false; // Default to false for new registrations
                }

                // Check if Keycloak requires email verification
                if (!emailVerified) {
                    log.info("User registered but email not verified. Keycloak should trigger verification.");
                    // Continue with registration - Keycloak will require verification
                }

                user = registerNewUser(userRequest, oidcUser, provider, providerId);
            }
        }

        return UserPrincipal.create(user, oidcUser.getAttributes(), oidcUser.getIdToken(), oidcUser.getUserInfo());
    }

    private User registerNewUser(OidcUserRequest userRequest, OidcUser oidcUser, AuthProvider provider, String providerId) {
        Boolean emailVerified = oidcUser.getEmailVerified();
        if (emailVerified == null) {
            emailVerified = false;
        }

        User user = new User();
        user.setFullName(oidcUser.getFullName());
        user.setEmail(oidcUser.getEmail());
        user.setEmailVerified(emailVerified); // Set based on Keycloak's status
        user.setRole(UserRole.BIDDER);
        user.setPassword("");
        user.setIsActive(true);

        user = userRepository.save(user);

        // Create Social Account Linked to User
        linkSocialAccount(user, provider, providerId, oidcUser);

        log.info("New user registered: {} (emailVerified: {})", user.getEmail(), emailVerified);

        return user;
    }

    private void linkSocialAccount(User user, AuthProvider provider, String providerId, OidcUser oidcUser) {
        // Check if this social account already exists for another user
        Optional<SocialAccount> existingAccount = socialAccountRepository.findByProviderAndProviderId(provider, providerId);

        if (existingAccount.isPresent()) {
            if (!existingAccount.get().getUser().getId().equals(user.getId())) {
                log.error("Social account already linked to different user");
                throw new RuntimeException("This social account is already linked to another user");
            }
            log.info("Social account already linked to this user");
            return; // Already linked
        }

        // Check if user already has this provider linked
        Optional<SocialAccount> userProviderAccount = socialAccountRepository
                .findByUserAndProvider(user, provider);

        if (userProviderAccount.isPresent()) {
            log.info("Updating existing social account for provider {}", provider);
            SocialAccount existing = userProviderAccount.get();
            existing.setProviderId(providerId);
            existing.setEmail(oidcUser.getEmail());
            existing.setName(oidcUser.getFullName());
            socialAccountRepository.save(existing);
            return;
        }

        // Create new social account link
        SocialAccount socialAccount = SocialAccount.builder()
                .user(user)
                .provider(provider)
                .providerId(providerId)
                .email(oidcUser.getEmail())
                .name(oidcUser.getFullName())
                .build();

        socialAccountRepository.save(socialAccount);
        log.info("Successfully linked social account {} to user {}", provider, user.getEmail());
    }

    private void updateExistingUser(User user, OidcUser oidcUser) {
        user.setFullName(oidcUser.getFullName());
        userRepository.save(user);
    }
}