# Use official GCC image
FROM gcc:13

# Install dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    libboost-all-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy source code
COPY server.cpp .

# Download Crow
RUN curl -L https://github.com/CrowCpp/crow/releases/latest/download/crow_all.h -o crow_all.h

# Build server
RUN g++ server.cpp -o server -pthread

# Expose port
EXPOSE 8080

# Run server
CMD ["./server"]
