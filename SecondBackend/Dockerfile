FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libboost-all-dev \
    libboost-system-dev \
    libssl-dev \
    libpqxx-dev \
    postgresql-client \
    curl \
    libasio-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p external && \
    git clone --depth 1 https://github.com/CrowCpp/Crow.git external/crow && \
    git clone --depth 1 https://github.com/Thalhammer/jwt-cpp.git external/jwt-cpp

COPY src/ src/
COPY CMakeLists.txt .

RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    make -j$(nproc)

EXPOSE 8080

ENV DB_CONNECTION_STRING=""
ENV JWT_SECRET="" 
ENV PORT=8080

CMD ["./build/mobile_server"]
