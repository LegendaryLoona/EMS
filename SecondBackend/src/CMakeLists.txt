cmake_minimum_required(VERSION 3.12)
project(MobileEmployeeDashboard)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Threads REQUIRED)
find_package(Boost REQUIRED COMPONENTS system)
find_package(OpenSSL REQUIRED)

include_directories(
    ${Boost_INCLUDE_DIRS}
    ${OPENSSL_INCLUDE_DIR}
    ${CMAKE_SOURCE_DIR}/external/crow/include
    ${CMAKE_SOURCE_DIR}/external/jwt-cpp/include
)

add_executable(mobile_server src/mobile_server.cpp)

target_link_libraries(mobile_server
    ${Boost_LIBRARIES}
    ${OPENSSL_LIBRARIES}
    pqxx
    pq
    Threads::Threads
)

install(TARGETS mobile_server DESTINATION bin)

if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(mobile_server PRIVATE -Wall -Wextra -pedantic)
endif()