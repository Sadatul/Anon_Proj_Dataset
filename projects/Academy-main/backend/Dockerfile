# ---------- Build stage ----------
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Make Gradle cache definitely writable + avoid daemon issues in docker builds
ENV GRADLE_USER_HOME=/tmp/gradle

# Copy only build files first (better layer caching)
COPY build.gradle settings.gradle ./
COPY src ./src

# Build
RUN gradle clean build -x test --no-daemon

# ---------- Run stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create upload directory with proper permissions
RUN mkdir -p /app/data/uploads && chmod 755 /app/data/uploads

# Copy the built jar from the build stage
COPY --from=build /app/build/libs/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081
CMD ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]
