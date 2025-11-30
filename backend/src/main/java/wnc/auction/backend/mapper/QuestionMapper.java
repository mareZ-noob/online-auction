package wnc.auction.backend.mapper;

import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.QuestionDto;
import wnc.auction.backend.model.Question;

@UtilityClass
public class QuestionMapper {

    public static QuestionDto toDto(Question question) {
        return QuestionDto.builder()
                .id(question.getId())
                .productId(question.getProduct().getId())
                .productName(question.getProduct().getName())
                .userId(question.getUser().getId())
                .userName(question.getUser().getFullName())
                .question(question.getQuestion())
                .answer(question.getAnswer())
                .answeredAt(question.getAnsweredAt())
                .createdAt(question.getCreatedAt())
                .build();
    }
}
