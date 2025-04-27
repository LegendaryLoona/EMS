FROM ubuntu:22.04 as builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libboost-all-dev \
    libpq-dev \
    libpqxx-dev \
    nlohmann-json3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Crow
RUN curl -sSL https://github.com/CrowCpp/Crow/releases/download/v1.0+5/crow-v1.0+5.deb -o crow.deb \
    && dpkg -i crow.deb \
    && rm crow.deb

# Create working directory
WORKDIR /app

# Copy source code
COPY . .

# Build the application
RUN mkdir -p build && cd build && \
    cmake .. && \
    make -j$(nproc) && \
    make install

# Create runtime image
FROM ubuntu:22.04

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libboost-system1.74.0 \
    libboost-thread1.74.0 \
    libpq5 \
    libpqxx-6.4 \
    && rm -rf /var/lib/apt/lists/*

# Copy the built executable
COPY --from=builder /usr/local/bin/mobile_dashboard_backend /usr/local/bin/

# Expose port
EXPOSE 8080

# Run the server
CMD ["mobile_dashboard_backend"]