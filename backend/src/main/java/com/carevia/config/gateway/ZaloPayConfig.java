// package vn.uit.lms.config.gateway;

// import lombok.Getter;
// import lombok.Setter;
// import org.springframework.boot.context.properties.ConfigurationProperties;
// import org.springframework.context.annotation.Configuration;


// @Configuration
// @ConfigurationProperties(prefix = "zalo-pay.config")
// @Getter
// @Setter
// public class ZaloPayConfig {
//     private String appid;
//     private String key1;
//     private String key2;
//     private Endpoints endpoints;

//     @Getter
//     @Setter
//     public static class Endpoints {
//         private String base;
//         private String create;
//         private String banks;
//         private String query;
//         private String refund;
//         private String refundQuery;
//         private String callback;

//     }
// }



// 1. File ZaloPay:
// Trong file .env bạn đang để:
// ZALOPAY_APP_ID=2553
// ZALOPAY_KEY1=sdng98234ih9823...
// Bạn hãy đảm bảo trong code Java (file ZaloPayConfig.java), các biến được gọi đúng tên như vậy, ví dụ:
// java
// @Value("${zalopay.app-id}")
// private String appId;