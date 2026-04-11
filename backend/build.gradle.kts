plugins {
    java
    id("org.springframework.boot") version "3.3.5"
    id("io.spring.dependency-management") version "1.1.5"
}

group = "com.carevia"
version = "0.0.1-SNAPSHOT"
description = "Carevia Platform Backend API"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // 1. Web Starter (BẮT BUỘC - Sửa từ webmvc thành web)
    implementation("org.springframework.boot:spring-boot-starter-web")
    
    // 2. Swagger UI (Dùng bản 2.5.0 cực kỳ ổn định với Spring Boot 3.3.5)
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")

    // 3. Các thư viện khác
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    runtimeOnly("org.postgresql:postgresql")
    
    // 4. Test (Chỉ cần 2 dòng này là đủ cho các loại test)
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
