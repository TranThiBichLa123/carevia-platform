package com.carevia.config.gateway;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "zalopay")
@Data
public class ZaloPayConfig {
    private String appId;
    private String key1;
    private String key2;
    private String endpoint;
    private String callbackUrl;
}