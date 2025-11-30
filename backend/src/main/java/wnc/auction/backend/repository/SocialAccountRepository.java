package wnc.auction.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.SocialAccount;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.AuthProvider;

import java.util.Optional;

@Repository
public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    Optional<SocialAccount> findByProviderAndProviderId(AuthProvider provider, String providerId);

    Optional<SocialAccount> findByUserAndProvider(User user, AuthProvider provider);
}
