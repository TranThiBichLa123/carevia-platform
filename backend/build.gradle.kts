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
    maven { url = uri("https://jitpack.io") } 
}


dependencies {
    // 1. Web & Swagger
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")

    // 2. Security & OAuth2
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

    // 3. Mail & Thymeleaf
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")

    // 4. Cloudinary
    implementation("com.cloudinary:cloudinary-http44:1.36.0")

    // 5. Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // 6. Database & Validation
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    runtimeOnly("org.postgresql:postgresql")
    
    // 7. Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // 8. DevTools & JWT
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")
    
    // 9. Spring Filter
    implementation("com.turkraft.springfilter:jpa:3.1.9")
}

// Cấu hình để nhận diện đúng thư mục resources và template
sourceSets {
    main {
        resources {
            srcDirs("src/main/resources")
        }
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// Xử lý lỗi trùng lặp file cấu hình
tasks.withType<ProcessResources> {
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}
