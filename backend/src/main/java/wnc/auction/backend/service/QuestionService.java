package wnc.auction.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.QuestionDto;
import wnc.auction.backend.dto.request.AnswerQuestionRequest;
import wnc.auction.backend.dto.request.AskQuestionRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.ForbiddenException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.QuestionMapper;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.Question;
import wnc.auction.backend.model.User;
import wnc.auction.backend.repository.BlockedBidderRepository;
import wnc.auction.backend.repository.ProductRepository;
import wnc.auction.backend.repository.QuestionRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.utils.Constants;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BlockedBidderRepository blockedBidderRepository;

    public QuestionDto askQuestion(AskQuestionRequest request) {
        Long userId = CurrentUser.getUserId();
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.PRODUCT_NOT_FOUND));

        if (blockedBidderRepository.existsByProductIdAndBidderId(product.getId(), userId)) {
            throw new ForbiddenException("You have been blocked by the seller and cannot ask questions.");
        }

        Question question = Question.builder()
                .product(product)
                .user(user)
                .question(request.getQuestion())
                .build();

        question = questionRepository.save(question);

        // Send email notification to seller
        emailService.sendQuestionNotification(
                product.getSeller().getId(),
                product.getId(),
                product.getName(),
                request.getQuestion(),
                user.getFullName());

        log.info("Question asked on product: {} by user: {}", product.getId(), userId);

        return QuestionMapper.toDto(question);
    }

    public QuestionDto answerQuestion(Long questionId, AnswerQuestionRequest request) {
        Long sellerId = CurrentUser.getUserId();
        Question question =
                questionRepository.findById(questionId).orElseThrow(() -> new NotFoundException("Question not found"));

        if (!question.getProduct().getSeller().getId().equals(sellerId)) {
            throw new ForbiddenException("You can only answer questions on your own products");
        }

        if (question.getAnswer() != null) {
            throw new BadRequestException("Question has already been answered");
        }

        question.setAnswer(request.getAnswer());
        question.setAnsweredAt(LocalDateTime.now());

        question = questionRepository.save(question);

        // Send email notification to all bidders and questioners
        // (Implementation would involve getting all unique users)

        log.info("Question answered: {}", questionId);

        return QuestionMapper.toDto(question);
    }

    public List<QuestionDto> getProductQuestions(Long productId) {
        List<Question> questions = questionRepository.findByProductId(productId);

        return questions.stream().map(QuestionMapper::toDto).toList();
    }

    public PageResponse<QuestionDto> getProductQuestions(Long productId, int page, int size) {
        // Create Pageable with default sorting by createdAt descending
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Fetch paginated data
        Page<Question> questionPage = questionRepository.findByProductId(productId, pageable);

        // Map content to DTOs
        List<QuestionDto> content =
                questionPage.getContent().stream().map(QuestionMapper::toDto).toList();

        // Build PageResponse
        return PageResponse.<QuestionDto>builder()
                .content(content)
                .page(questionPage.getNumber())
                .size(questionPage.getSize())
                .totalElements(questionPage.getTotalElements())
                .totalPages(questionPage.getTotalPages())
                .last(questionPage.isLast())
                .build();
    }

    public PageResponse<QuestionDto> getMyQuestions(int page, int size) {
        Long userId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Question> questionPage = questionRepository.findByUserId(userId, pageable);

        List<QuestionDto> content =
                questionPage.getContent().stream().map(QuestionMapper::toDto).toList();

        return PageResponse.<QuestionDto>builder()
                .content(content)
                .page(questionPage.getNumber())
                .size(questionPage.getSize())
                .totalElements(questionPage.getTotalElements())
                .totalPages(questionPage.getTotalPages())
                .last(questionPage.isLast())
                .build();
    }

    public PageResponse<QuestionDto> getUnansweredQuestions(int page, int size) {
        Long sellerId = CurrentUser.getUserId();

        // Sort by createdAt descending by default
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Question> questionPage = questionRepository.findUnansweredQuestionsBySeller(sellerId, pageable);

        List<QuestionDto> content =
                questionPage.getContent().stream().map(QuestionMapper::toDto).toList();

        return PageResponse.<QuestionDto>builder()
                .content(content)
                .page(questionPage.getNumber())
                .size(questionPage.getSize())
                .totalElements(questionPage.getTotalElements())
                .totalPages(questionPage.getTotalPages())
                .last(questionPage.isLast())
                .build();
    }
}
