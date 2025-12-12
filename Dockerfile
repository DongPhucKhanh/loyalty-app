# 1. Giai đoạn Build: Dùng Maven để tạo file .jar
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# 2. Giai đoạn Run: Dùng OpenJDK để chạy ứng dụng
FROM openjdk:17.0.1-jdk-slim
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]