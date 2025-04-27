cmake_minimum_required(VERSION 3.10)
project(mobile_server)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Boost REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)
find_package(libpqxx REQUIRED)

add_executable(mobile_server main.cpp)

target_include_directories(mobile_server PRIVATE ${Boost_INCLUDE_DIRS})
target_link_libraries(mobile_server PRIVATE 
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
    pqxx
)