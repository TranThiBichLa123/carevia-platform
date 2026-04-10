// package com.carevia.config.init;

// @Configuration
// @EnableWebSocketMessageBroker
// public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

//     @Override
//     public void configureMessageBroker(MessageBrokerRegistry config) {
//         config.enableSimpleBroker("/topic"); // Nơi Backend gửi thông báo tới
//         config.setApplicationDestinationPrefixes("/app");
//     }

//     @Override
//     public void registerStompEndpoints(StompEndpointRegistry registry) {
//         registry.addEndpoint("/ws-notification") // URL để Frontend kết nối
//                 .setAllowedOriginPatterns("*") // Cho phép các domain khác kết nối
//                 .withSockJS(); // Hỗ trợ các trình duyệt cũ
//     }
// }
