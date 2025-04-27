# Use an official lightweight C++ image
FROM gcc:13-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    libboost-all-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy source code
COPY server.cpp .

# Download Crow
RUN curl -L https://github.com/CrowCpp/crow/releases/latest/download/crow_all.h -o crow_all.h

# Build server
RUN g++ server.cpp -o server -pthread

# Expose the port Crow runs on
EXPOSE 8080

# Run the server
CMD ["./server"]
