package wnc.auction.backend.mapper;

import java.util.ArrayList;
import java.util.List;
import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.CategoryDto;
import wnc.auction.backend.model.Category;
import wnc.auction.backend.utils.MessagesUtils;

@UtilityClass
public class CategoryMapper {

    public static CategoryDto toDto(Category category) {
        List<CategoryDto> children = (category.getChildren() == null)
                ? new ArrayList<>()
                : category.getChildren().stream().map(CategoryMapper::toDto).toList();

        // Key: category.data.{Name in DB}: category.data.Electronics
        String translatedName = MessagesUtils.getMessageDefault(
                "category.data." + category.getName().replaceAll("\\s+", ""), category.getName() // Default value
                );

        String parentName = null;
        if (category.getParent() != null) {
            parentName = MessagesUtils.getMessageDefault(
                    "category.data." + category.getParent().getName().replaceAll("\\s+", ""),
                    category.getParent().getName());
        }

        return CategoryDto.builder()
                .id(category.getId())
                .name(translatedName)
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(parentName)
                .children(children)
                .build();
    }
}
