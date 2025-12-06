package wnc.auction.backend.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.CategoryDto;
import wnc.auction.backend.dto.request.CategoryRequest;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.CategoryMapper;
import wnc.auction.backend.model.Category;
import wnc.auction.backend.repository.CategoryRepository;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryDto createCategory(CategoryRequest request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository
                    .findById(request.getParentId())
                    .orElseThrow(() -> new NotFoundException("Parent category not found"));
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .parent(parent)
                .build();

        category = categoryRepository.save(category);

        log.info("Category created: {}", category.getId());
        return CategoryMapper.toDto(category);
    }

    public CategoryDto getCategoryById(Long id) {
        Category category =
                categoryRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));

        return CategoryMapper.toDto(category);
    }

    public List<CategoryDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream().map(CategoryMapper::toDto).toList();
    }

    public List<CategoryDto> getRootCategories() {
        List<Category> categories = categoryRepository.findByParentIsNull();
        return categories.stream().map(CategoryMapper::toDto).toList();
    }

    public List<CategoryDto> getSubCategories(Long parentId) {
        Category parent = categoryRepository
                .findById(parentId)
                .orElseThrow(() -> new NotFoundException("Parent category not found"));

        List<Category> categories = categoryRepository.findByParent(parent);
        return categories.stream().map(CategoryMapper::toDto).toList();
    }

    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category category =
                categoryRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = categoryRepository
                    .findById(request.getParentId())
                    .orElseThrow(() -> new NotFoundException("Parent category not found"));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);

        log.info("Category updated: {}", id);
        return CategoryMapper.toDto(category);
    }

    public void deleteCategory(Long id) {
        Category category =
                categoryRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));

        long productCount = categoryRepository.countProductsByCategory(id);
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete category with existing products");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", id);
    }
}
