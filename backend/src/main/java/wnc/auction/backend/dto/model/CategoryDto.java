package wnc.auction.backend.dto.model;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {

    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private String parentName;
    private List<CategoryDto> children;
}
