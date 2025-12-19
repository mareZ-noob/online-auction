package wnc.auction.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import wnc.auction.backend.model.enumeration.UserRole;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(nullable = false)
    private String fullName;

    private String address;

    @Column(name = "date_of_birth")
    private LocalDateTime dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.BIDDER;

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<SocialAccount> socialAccounts = new HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private Integer positiveRatings = 0;
    private Integer negativeRatings = 0;

    @Column(name = "region", length = 2)
    @Builder.Default
    private String region = "US"; // VN for Vietnam, US for United States, etc.

    @Column(name = "preferred_language", length = 5)
    @Builder.Default
    private String preferredLanguage = "en"; // 'vi' for Vietnamese, 'en' for English

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<Rating> ratingsReceived = new ArrayList<>();

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<Product> productsListed = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<Bid> bids = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<WatchList> watchList = new ArrayList<>();

    private LocalDateTime roleExpirationDate;

    public Double getRatingPercentage() {
        int total = positiveRatings + negativeRatings;
        if (total == 0) return null;
        return (positiveRatings * 100.0) / total;
    }

    public boolean canBid() {
        Double rating = getRatingPercentage();
        return rating == null || rating >= 80.0;
    }

    // Helper method to check if seller rights are still valid
    public boolean isSellerRightsValid() {
        return this.role == UserRole.SELLER
                && (this.roleExpirationDate == null || LocalDateTime.now().isBefore(this.roleExpirationDate));
    }
}
