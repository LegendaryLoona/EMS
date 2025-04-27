FROM ubuntu:22.04

# Set non-interactive mode for apt
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libboost-all-dev \
    libpq-dev \
    libssl-dev \
    git \
    pkg-config \
    curl \
    postgresql-server-dev-all \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install libpqxx from source
RUN git clone https://github.com/jtv/libpqxx.git /tmp/libpqxx && \
    cd /tmp/libpqxx && \
    git checkout 7.7.4 && \
    mkdir build && cd build && \
    cmake .. && \
    make -j$(nproc) && \
    make install && \
    ldconfig && \
    rm -rf /tmp/libpqxx

# Download and copy header-only libraries
RUN mkdir -p /app/include/nlohmann && \
    curl -L https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp -o /app/include/nlohmann/json.hpp

# Install jwt-cpp (header-only)
RUN git clone https://github.com/Thalhammer/jwt-cpp.git /tmp/jwt-cpp && \
    mkdir -p /app/include/jwt-cpp && \
    cp -r /tmp/jwt-cpp/include/jwt-cpp/* /app/include/jwt-cpp/ && \
    rm -rf /tmp/jwt-cpp

# Install Crow (header-only)
RUN git clone https://github.com/CrowCpp/Crow.git /tmp/crow && \
    mkdir -p /app/include/crow && \
    cp -r /tmp/crow/include/crow/* /app/include/crow/ && \
    rm -rf /tmp/crow

# Copy source files
COPY main.cpp /app/
COPY CMakeLists.txt /app/

# Build the app
RUN mkdir -p build && cd build && \
    cmake .. && \
    make

# Expose port
EXPOSE 8080

# Start the app
CMD ["/app/build/mobile_server"]