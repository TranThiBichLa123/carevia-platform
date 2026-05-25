package com.carevia.service.storage;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.carevia.shared.exception.UploadFileException;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryStorageService {

    private final static Logger log = LoggerFactory.getLogger(CloudinaryStorageService.class);
    private final Cloudinary cloudinary;

    @Value("${app.avatar.folder}")
    private String baseFolder;

    @Value("${app.course.thumbnail.folder:course_thumbnails}")
    private String courseThumbnailFolder;

    @Value("${app.device.image.folder:device/devices}")
    private String deviceImageFolder;

    @Value("${app.brand.image.folder:brand/logos}")
    private String brandImageFolder;

    @Value("${app.review.image.folder:review/images}")
    private String reviewImageFolder;

    public UploadResult uploadAvatar(MultipartFile file, Long userId, String existingPublicId) {
        try {
            String publicId = String.format("user_%d_avatar", userId);

            Map<String, Object> options = ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", baseFolder,
                    "overwrite", true,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto"
            );

            // Upload (bytes)
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            String secureUrl = (String) result.get("secure_url");
            String uploadedPublicId = (String) result.get("public_id");

            // Return both url and public id
            return new UploadResult(secureUrl, uploadedPublicId);

        } catch (IOException e) {
            throw new UploadFileException("Failed to upload to Cloudinary");
        } catch (Exception e) {
            throw new UploadFileException("Cloudinary upload error: " + e.getMessage());
        }
    }

    public UploadResult uploadCourseThumbnail(MultipartFile file, Long courseId, String existingPublicId) {
        try {
            String publicId = String.format("course_%d_thumbnail", courseId);

            Map<String, Object> options = ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", courseThumbnailFolder,
                    "overwrite", true,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto"
            );

            // Upload (bytes)
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            String secureUrl = (String) result.get("secure_url");
            String uploadedPublicId = (String) result.get("public_id");

            // Delete old thumbnail if exists and is different
            if (existingPublicId != null && !existingPublicId.equals(uploadedPublicId)) {
                deleteByPublicId(existingPublicId);
            }

            // Return both url and public id
            return new UploadResult(secureUrl, uploadedPublicId);

        } catch (IOException e) {
            throw new UploadFileException("Failed to upload course thumbnail to Cloudinary");
        } catch (Exception e) {
            throw new UploadFileException("Cloudinary upload error: " + e.getMessage());
        }
    }

    public UploadResult uploadDeviceImage(MultipartFile file, Long deviceId, String existingPublicId) {
        try {
            String publicId = resolveDeviceImagePublicId(deviceId, existingPublicId);

            Map<String, Object> options = ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", deviceImageFolder,
                    "overwrite", true,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            String secureUrl = (String) result.get("secure_url");
            String uploadedPublicId = (String) result.get("public_id");

            if (existingPublicId != null && !existingPublicId.isBlank() && !existingPublicId.equals(uploadedPublicId)) {
                deleteByPublicId(existingPublicId);
            }

            return new UploadResult(secureUrl, uploadedPublicId);
        } catch (IOException e) {
            throw new UploadFileException("Failed to upload device image to Cloudinary");
        } catch (Exception e) {
            throw new UploadFileException("Cloudinary upload error: " + e.getMessage());
        }
    }

    public UploadResult uploadBrandImage(MultipartFile file, Long brandId, String existingPublicId) {
        try {
            String publicId = resolveBrandImagePublicId(brandId, existingPublicId);

            Map<String, Object> options = ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", brandImageFolder,
                    "overwrite", true,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            String secureUrl = (String) result.get("secure_url");
            String uploadedPublicId = (String) result.get("public_id");

            if (existingPublicId != null && !existingPublicId.isBlank() && !existingPublicId.equals(uploadedPublicId)) {
                deleteByPublicId(existingPublicId);
            }

            return new UploadResult(secureUrl, uploadedPublicId);
        } catch (IOException e) {
            throw new UploadFileException("Failed to upload brand image to Cloudinary");
        } catch (Exception e) {
            throw new UploadFileException("Cloudinary upload error: " + e.getMessage());
        }
    }

    public UploadResult uploadReviewImage(MultipartFile file, Long deviceId) {
        try {
            String publicId = resolveReviewImagePublicId(deviceId);

            Map<String, Object> options = ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", reviewImageFolder,
                    "overwrite", false,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            String secureUrl = (String) result.get("secure_url");
            String uploadedPublicId = (String) result.get("public_id");

            return new UploadResult(secureUrl, uploadedPublicId);
        } catch (IOException e) {
            throw new UploadFileException("Failed to upload review image to Cloudinary");
        } catch (Exception e) {
            throw new UploadFileException("Cloudinary upload error: " + e.getMessage());
        }
    }

    private String resolveDeviceImagePublicId(Long deviceId, String existingPublicId) {
        if (deviceId != null) {
            return String.format("device_%d_image", deviceId);
        }
        if (existingPublicId != null && !existingPublicId.isBlank()) {
            int slashIndex = existingPublicId.lastIndexOf('/');
            return slashIndex >= 0 ? existingPublicId.substring(slashIndex + 1) : existingPublicId;
        }
        return "device_draft_" + UUID.randomUUID();
    }

    private String resolveBrandImagePublicId(Long brandId, String existingPublicId) {
        if (brandId != null) {
            return String.format("brand_%d_logo", brandId);
        }
        if (existingPublicId != null && !existingPublicId.isBlank()) {
            int slashIndex = existingPublicId.lastIndexOf('/');
            return slashIndex >= 0 ? existingPublicId.substring(slashIndex + 1) : existingPublicId;
        }
        return "brand_draft_" + UUID.randomUUID();
    }

    private String resolveReviewImagePublicId(Long deviceId) {
        if (deviceId != null) {
            return String.format("device_%d_review_%s", deviceId, UUID.randomUUID());
        }
        return "review_" + UUID.randomUUID();
    }

    public void deleteByPublicId(String publicId) {
        if (publicId == null || publicId.isBlank()) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception ex) {
            // Log but do not rethrow to avoid breaking user flow
            log.error("Failed to delete Cloudinary resource with publicId {}: {}", publicId, ex.getMessage());
        }
    }

    public static class UploadResult {
        private final String url;
        private final String publicId;
        public UploadResult(String url, String publicId) { this.url = url; this.publicId = publicId; }
        public String getUrl() { return url; }
        public String getPublicId() { return publicId; }
    }


}

