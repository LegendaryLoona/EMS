#include <crow/crow.h>
#include <pqxx/pqxx>
#include <jwt-cpp/jwt.h>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

using json = nlohmann::json;

int main() {
    // Get environment variables
    std::string port_str = std::getenv("PORT") ? std::getenv("PORT") : "8080";
    std::string db_url = std::getenv("DATABASE_URL") ? std::getenv("DATABASE_URL") : "postgres://postgres:postgres@localhost/hrms";
    std::string jwt_secret = std::getenv("JWT_SECRET") ? std::getenv("JWT_SECRET") : "your_secret_key";
    
    int port = std::stoi(port_str);
    
    // Initialize Crow app
    crow::SimpleApp app;
    
    // Health check endpoint
    CROW_ROUTE(app, "/health")
    ([]() {
        return "OK";
    });
    
    // Profile endpoint
    CROW_ROUTE(app, "/profile")
    .methods("GET"_method)
    ([&db_url, &jwt_secret](const crow::request& req) {
        crow::response res;
        res.body = json{{"message", "Profile endpoint operational"}}.dump();
        res.set_header("Content-Type", "application/json");
        return res;
    });
    
    // Attendance endpoint
    CROW_ROUTE(app, "/attendance")
    .methods("GET"_method)
    ([&db_url, &jwt_secret](const crow::request& req) {
        crow::response res;
        res.body = json{{"message", "Attendance endpoint operational"}}.dump();
        res.set_header("Content-Type", "application/json");
        return res;
    });
    
    // Tasks endpoint
    CROW_ROUTE(app, "/tasks")
    .methods("GET"_method)
    ([&db_url, &jwt_secret](const crow::request& req) {
        crow::response res;
        res.body = json{{"message", "Tasks endpoint operational"}}.dump();
        res.set_header("Content-Type", "application/json");
        return res;
    });
    
    // Submit task endpoint
    CROW_ROUTE(app, "/tasks/<int>/submit")
    .methods("POST"_method)
    ([&db_url, &jwt_secret](const crow::request& req, int task_id) {
        crow::response res;
        res.body = json{{"message", "Task submission endpoint operational", "task_id", task_id}}.dump();
        res.set_header("Content-Type", "application/json");
        return res;
    });
    
    // Enable CORS
    app.after_request([](const crow::request& req, crow::response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    });
    
    // Start the server
    app.port(port).multithreaded().run();
    
    return 0;
}