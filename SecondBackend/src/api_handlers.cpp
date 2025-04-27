#include "api_handlers.h"
#include <string>
#include <nlohmann/json.hpp>

APIHandlers::APIHandlers(Database& db) : db_(db) {}

std::string APIHandlers::extractUsername(const crow::request& req) {
    // In a real implementation, you'd extract the username from the JWT token
    // For this example, we're just returning a placeholder
    // You should implement proper token validation
    return "employeeuser";  // Placeholder
}

crow::response APIHandlers::getEmployeeProfile(const crow::request& req) {
    std::string username = extractUsername(req);
    auto profile = db_.getEmployeeProfile(username);
    
    if (profile.contains("error")) {
        return crow::response(404, profile.dump());
    }
    
    return crow::response(200, profile.dump());
}

crow::response APIHandlers::getAttendanceRecords(const crow::request& req) {
    std::string username = extractUsername(req);
    auto records = db_.getAttendanceRecords(username);
    
    if (records.contains("error")) {
        return crow::response(500, records.dump());
    }
    
    return crow::response(200, records.dump());
}

crow::response APIHandlers::getTasks(const crow::request& req) {
    auto tasks = db_.getTasks();
    
    if (tasks.contains("error")) {
        return crow::response(500, tasks.dump());
    }
    
    return crow::response(200, tasks.dump());
}

crow::response APIHandlers::submitTask(const crow::request& req, int taskId) {
    bool success = db_.submitTask(taskId);
    
    if (!success) {
        return crow::response(400, R"({"error": "Failed to submit task"})");
    }
    
    return crow::response(200, R"({"message": "Task submitted successfully"})");
}