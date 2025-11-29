package wnc.auction.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

    private String keyword;
    private Long categoryId;
    private String sortBy = "endTime"; // endTime, price, created
    private String sortDirection = "asc";
    private Integer page = 0;
    private Integer size = 20;
}
