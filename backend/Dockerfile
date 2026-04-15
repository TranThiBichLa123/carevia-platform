
FROM gradle:8.10.2-jdk17 AS builder

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts gradlew gradlew.bat ./
COPY gradle ./gradle
COPY src ./src

RUN chmod +x gradlew \
	&& ./gradlew bootJar --no-daemon \
	&& cp "$(find build/libs -maxdepth 1 -name '*.jar' ! -name '*-plain.jar' | head -n 1)" app.jar

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /app/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
