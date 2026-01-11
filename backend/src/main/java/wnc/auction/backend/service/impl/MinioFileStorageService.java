package wnc.auction.backend.service.impl;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import wnc.auction.backend.exception.FileStorageException;
import wnc.auction.backend.service.FileStorageService;

@Service("minioStorage")
@Slf4j
public class MinioFileStorageService implements FileStorageService {

    private final MinioClient minioClient;
    private final String bucketName;
    private final String minioUrl;
    private final String minioPublicUrl;
    private final List<String> allowedExtensions;

    public MinioFileStorageService(
            @Value("${app.file.minio.url}") String url,
            @Value("${app.file.minio.public-url}") String publicUrl,
            @Value("${app.file.minio.access-key}") String accessKey,
            @Value("${app.file.minio.secret-key}") String secretKey,
            @Value("${app.file.minio.bucket}") String bucketName,
            @Value("${app.file.allowed-extensions}") String[] allowedExtensions) {

        this.minioClient = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
        this.bucketName = bucketName;
        this.minioUrl = url;
        this.minioPublicUrl = publicUrl;
        this.allowedExtensions = Arrays.asList(allowedExtensions);
    }

    @Override
    public String storeFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String extension = getFileExtension(originalFileName);

        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new FileStorageException("Extension not allowed: " + extension);
        }

        String fileName = UUID.randomUUID() + "." + extension;

        try (InputStream inputStream = file.getInputStream()) {
            String contentType = file.getContentType();

            if (contentType == null || contentType.equals("application/octet-stream")) {
                contentType = determineContentType(fileName);
            }

            minioClient.putObject(
                    PutObjectArgs.builder().bucket(bucketName).object(fileName).stream(inputStream, file.getSize(), -1)
                            .contentType(contentType)
                            .build());

            // Return public URL accessible through Caddy reverse proxy
            return minioPublicUrl + "/" + bucketName + "/" + fileName;

        } catch (Exception e) {
            throw new FileStorageException("Failed to upload file to MinIO", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .build());
        } catch (Exception e) {
            log.error("Failed to delete file from MinIO: {}", fileUrl, e);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        // MinIO URLs are usually accessed directly via HTTP, but if we need to proxy:
        try {
            return new UrlResource(minioUrl + "/" + bucketName + "/" + fileName);
        } catch (MalformedURLException e) {
            throw new FileStorageException("Error loading file resource", e);
        }
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1);
    }

    private String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }
}
