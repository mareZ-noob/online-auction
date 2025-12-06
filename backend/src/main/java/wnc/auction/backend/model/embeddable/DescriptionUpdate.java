package wnc.auction.backend.model.embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DescriptionUpdate {

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime updatedAt;
}
