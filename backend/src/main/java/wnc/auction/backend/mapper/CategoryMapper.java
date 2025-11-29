package wnc.auction.backend.mapper;

import wnc.auction.backend.dto.model.CategoryDto;
import wnc.auction.backend.model.Category;

import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryDto toDto(Category category) {
        List<CategoryDto> children = category.getChildren().stream()
                .map(CategoryMapper::toDto)
                .collect(Collectors.toList());

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .children(children)
                .build();
    }
}
