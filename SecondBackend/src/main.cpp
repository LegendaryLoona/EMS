#include <crow.h>
#include <crow/middlewares/cors.h>
#include "database.h"
#include "api_handlers.h"
#include <string>

int main() {
    // Get environment variables
    std::string port = getenv("PORT") ? getenv("PORT") : "8080";
    std::string db_url = getenv("DATABASE_URL") ? getenv("DATABASE_URL") : "";
    
    if (db_url.empty()) {
        std::cerr << "DATABASE_URL environment variable is not set!" << std::endl;
        return 1;
    }

    // Initialize database connection
    Database db(db_url);
    if (!db.connect()) {
        std::cerr << "Failed to connect to database!" << std::endl;
        return 1;
    }
    
    // Create API handlers with database connection
    APIHandlers handlers(db);
    
    // Create Crow app with CORS middleware
    crow::App<crow::CORSHandler> app;
    
    // Configure CORS
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors
        .global()
        .headers("Authorization", "Content-Type")
        .methods("GET", "POST", "PUT", "DELETE")
        .prefix("/api")
        .origin("*");
    
    // Define routes
    CROW_ROUTE(app, "/api/health")
        .methods("GET"_method)
        ([](const crow::request& req) {
            return crow::response(200, "{ \"status\": \"healthy\" }");
        });
        
    // Auth verification middleware
    auto auth_middleware = [](crow::request& req, crow::response& res, std::function<void()> next) {
        const std::string auth_header = req.get_header_value("Authorization");
        if (auth_header.substr(0, 7) != "Bearer ") {
            res.code = 401;
            res.write("{ \"error\": \"Unauthorized\" }");
            res.end();
            return;
        }
        // Note: In a real implementation, you'd verify the token
        next();
    };
    
    // Employee profile endpoint
    CROW_ROUTE(app, "/api/my-profile")
        .methods("GET"_method)
        .middlewares(auth_middleware)
        ([&handlers](const crow::request& req) {
            return handlers.getEmployeeProfile(req);
        });
        
    // Attendance records
    CROW_ROUTE(app, "/api/my-attendance")
        .methods("GET"_method)
        .middlewares(auth_middleware)
        ([&handlers](const crow::request& req) {
            return handlers.getAttendanceRecords(req);
        });
        
    // Tasks endpoint
    CROW_ROUTE(app, "/api/tasks")
        .methods("GET"_method)
        .middlewares(auth_middleware)
        ([&handlers](const crow::request& req) {
            return handlers.getTasks(req);
        });
        
    // Submit task endpoint
    CROW_ROUTE(app, "/api/tasks/<int>/submit")
        .methods("POST"_method)
        .middlewares(auth_middleware)
        ([&handlers](const crow::request& req, int taskId) {
            return handlers.submitTask(req, taskId);
        });
    
    // Run the app
    app.port(std::stoi(port)).multithreaded().run();
    
    return 0;
}