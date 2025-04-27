cmake_minimum_required(VERSION 3.10)
project(mobile_server)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find packages
find_package(Boost REQUIRED COMPONENTS system)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)
find_package(PostgreSQL REQUIRED)

# Add executable
add_executable(mobile_server main.cpp)

# Include directories
target_include_directories(mobile_server PRIVATE 
    ${Boost_INCLUDE_DIRS}
    ${PostgreSQL_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Link libraries
target_link_libraries(mobile_server PRIVATE 
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
    ${PostgreSQL_LIBRARIES}
    pqxx
)