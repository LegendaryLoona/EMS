cmake_minimum_required(VERSION 3.10)
project(mobile_dashboard_backend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find packages
find_package(Threads REQUIRED)
find_package(nlohmann_json 3.7.0 REQUIRED)

# Add Crow as a header-only library
include_directories(/usr/local/include)

# Add libpqxx
find_package(libpqxx REQUIRED)

# Add source files
set(SOURCES 
    src/main.cpp
    src/database.cpp
    src/api_handlers.cpp
)

# Create executable
add_executable(mobile_dashboard_backend ${SOURCES})

# Link libraries
target_link_libraries(mobile_dashboard_backend PRIVATE 
    Threads::Threads
    nlohmann_json::nlohmann_json
    pqxx
)

# Install target
install(TARGETS mobile_dashboard_backend DESTINATION bin)