package wnc.auction.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.model.SocialAccount;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.AuthProvider;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.SocialAccountRepository;
import wnc.auction.backend.repository.UserRepository;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(userRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        String providerId = oAuth2User.getAttribute("sub");
        if (providerId == null) {
            Object id = oAuth2User.getAttribute("id");
            if (id != null) {
                providerId = String.valueOf(id);
            }
        }

        Optional<SocialAccount> socialAccountOptional = socialAccountRepository.findByProviderAndProviderId(provider, providerId);

        User user;
        if (socialAccountOptional.isPresent()) {
            // Already logged in with this provider
            user = socialAccountOptional.get().getUser();
            updateExistingUser(user, oAuth2User);
        } else {
            // Never logged in with this provider
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isPresent()) {
                // Already have account with this email -> Link social account
                user = userOptional.get();
                createSocialAccount(user, provider, providerId, email, name);
            } else {
                // New user -> Register
                user = registerNewUser(userRequest, oAuth2User, provider, providerId);
            }
        }

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(OAuth2UserRequest userRequest, OAuth2User oAuth2User, AuthProvider provider, String providerId) {
        User user = new User();
        user.setFullName(oAuth2User.getAttribute("name"));
        user.setEmail(oAuth2User.getAttribute("email"));
        user.setEmailVerified(true);
        user.setRole(UserRole.BIDDER);
        user.setPassword("");
        user.setIsActive(true);
        user.setSocialAccounts(new ArrayList<>()); // Init list

        user = userRepository.save(user);

        createSocialAccount(user, provider, providerId, oAuth2User.getAttribute("email"), oAuth2User.getAttribute("name"));

        return user;
    }

    private void createSocialAccount(User user, AuthProvider provider, String providerId, String email, String name) {
        SocialAccount socialAccount = SocialAccount.builder()
                .provider(provider)
                .providerId(providerId)
                .email(email)
                .name(name)
                .user(user)
                .build();
        socialAccountRepository.save(socialAccount);
    }

    private void updateExistingUser(User user, OAuth2User oAuth2User) {
        user.setFullName(oAuth2User.getAttribute("name"));
        userRepository.save(user);
    }
}