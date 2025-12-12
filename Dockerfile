# 1. Giai đoạn Build: Dùng Maven bản mới (hỗ trợ Java 21)
FROM maven:3.9.9-eclipse-temurin-21 AS build
COPY . .
RUN mvn clean package -DskipTests

# 2. Giai đoạn Run: Dùng JDK 21 để chạy ứng dụng
FROM eclipse-temurin:21-jre-alpine
# Copy file .jar từ giai đoạn build
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]