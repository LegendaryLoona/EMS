# Use official GCC image
FROM gcc:13

# Make sure everything is ready for apt
RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-utils \
    ca-certificates \
    curl \
    cmake \
    libboost-all-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy source code
COPY main.cpp .

# Download Crow single-header
RUN curl -L https://github.com/CrowCpp/crow/releases/latest/download/crow_all.h -o crow_all.h

# Build the app
RUN g++ main.cpp -o server -pthread

# Expose port
EXPOSE 8080

# Run the server
CMD ["./server"]
