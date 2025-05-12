# Use a base image with Java
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Expose the default Spring Boot port
EXPOSE 8080

# Build the application using Maven wrapper
RUN ./mvnw clean install

# Run the Spring Boot app
CMD ["./mvnw", "spring-boot:run"]
