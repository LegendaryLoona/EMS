FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libboost-all-dev \
    libpqxx-dev \
    libssl-dev \
    git \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up directories
WORKDIR /app
RUN mkdir -p /app/include

# Install nlohmann/json (JSON library)
RUN mkdir -p /app/include/nlohmann && \
    curl -L https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp -o /app/include/nlohmann/json.hpp

# Install jwt-cpp (header-only)
RUN git clone https://github.com/Thalhammer/jwt-cpp.git /tmp/jwt-cpp && \
    cp -r /tmp/jwt-cpp/include/jwt-cpp /app/include/ && \
    rm -rf /tmp/jwt-cpp

# Install Crow (header-only)
RUN git clone https://github.com/CrowCpp/Crow.git /tmp/crow && \
    cp -r /tmp/crow/include/crow /app/include/ && \
    rm -rf /tmp/crow

# Copy source files
COPY main.cpp /app/
COPY CMakeLists.txt /app/

# Update CMakeLists.txt to include our headers
RUN sed -i 's|target_include_directories(mobile_server PRIVATE ${Boost_INCLUDE_DIRS})|target_include_directories(mobile_server PRIVATE ${Boost_INCLUDE_DIRS} /app/include)|g' /app/CMakeLists.txt

# Build the app
RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    make

# Expose port
EXPOSE 8080

# Add health check endpoint
RUN echo '#include <crow.h>\nint main() { crow::SimpleApp app; CROW_ROUTE(app, "/health")([](){ return "OK"; }); app.port(8080).run(); return 0; }' > /app/health_check.cpp && \
    g++ -std=c++17 -I/app/include /app/health_check.cpp -o /app/health_check -lboost_system -lpthread

# Start the app
CMD ["/app/build/mobile_server"]