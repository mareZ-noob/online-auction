package wnc.auction.backend.dto.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {

    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String userName;
    private String question;
    private String answer;
    private LocalDateTime answeredAt;
    private LocalDateTime createdAt;
}
