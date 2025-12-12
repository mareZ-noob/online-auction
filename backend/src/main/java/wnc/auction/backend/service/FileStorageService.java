package wnc.auction.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String storeFile(MultipartFile file);

    void deleteFile(String fileUrl);

    Resource loadFileAsResource(String fileName);
}
