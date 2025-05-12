# Use Maven with Java 17 directly
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build

# Set work directory
WORKDIR /app

# Copy all project files
COPY . .

# Build the app
RUN mvn clean install -DskipTests

# Production image
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy compiled app from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Run the app
CMD ["java", "-jar", "app.jar"]
