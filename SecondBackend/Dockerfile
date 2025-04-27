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

# Install nlohmann/json (JSON library)
RUN mkdir -p /usr/include/nlohmann && \
    curl -L https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp -o /usr/include/nlohmann/json.hpp

# Install jwt-cpp
WORKDIR /tmp
RUN git clone https://github.com/Thalhammer/jwt-cpp.git \
    && cd jwt-cpp \
    && mkdir build && cd build \
    && cmake .. \
    && make install

# Install Crow
WORKDIR /tmp
RUN git clone https://github.com/CrowCpp/Crow.git \
    && cd Crow \
    && mkdir build && cd build \
    && cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF \
    && make install

# Create app directory
WORKDIR /app

# Copy source files
COPY . .

# Build the app
RUN mkdir -p build \
    && cd build \
    && cmake .. \
    && make

# Expose port
EXPOSE 8080

# Start the app
CMD ["/app/build/mobile_server"]