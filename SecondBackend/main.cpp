#include <crow.h>
#include <pqxx/pqxx>
#include <jwt-cpp/jwt.h>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

using json = nlohmann::json;

// Database connection helper
class Database {
private:
    std::string connstring;

public:
    Database(const std::string& db_url) : connstring(db_url) {}
    
    pqxx::connection connect() {
        return pqxx::connection(connstring);
    }
};

// JWT verification middleware
struct JwtMiddleware {
    std::string jwt_secret;
    
    JwtMiddleware(const std::string& secret) : jwt_secret(secret) {}
    
    struct context {
        int user_id;
    };
    
    void before_handle(crow::request& req, crow::response& res, context& ctx) {
        auto auth_header = req.get_header_value("Authorization");
        if (auth_header.empty() || auth_header.substr(0, 7) != "Bearer ") {
            res.code = 401;
            res.end();
            return;
        }
        
        std::string token = auth_header.substr(7);
        try {
            auto decoded = jwt::decode(token);
            auto verifier = jwt::verify()
                .allow_algorithm(jwt::algorithm::hs256{jwt_secret});
            verifier.verify(decoded);
            
            ctx.user_id = decoded.get_payload_claim("user_id").as_int();
        } catch (std::exception& e) {
            res.code = 401;
            res.end();
        }
    }
    
    void after_handle(crow::request& /*req*/, crow::response& /*res*/, context& /*ctx*/) {
        // Nothing to do here
    }
};

int main() {
    // Get environment variables
    std::string port_str = std::getenv("PORT") ? std::getenv("PORT") : "8080";
    std::string db_url = std::getenv("DATABASE_URL") ? std::getenv("DATABASE_URL") : "postgres://postgres:postgres@localhost/hrms";
    std::string jwt_secret = std::getenv("JWT_SECRET") ? std::getenv("JWT_SECRET") : "your_secret_key";
    
    int port = std::stoi(port_str);
    
    // Initialize database
    Database db(db_url);
    
    // Initialize Crow app with JWT middleware
    crow::App<crow::CORSHandler, JwtMiddleware> app(JwtMiddleware(jwt_secret));
    
    // Configure CORS
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors
        .global()
        .headers("Content-Type", "Authorization")
        .methods("GET", "POST", "PUT", "DELETE")
        .prefix("/")
        .origin("*");
    
    // Profile endpoint
    CROW_ROUTE(app, "/profile")
    .methods("GET"_method)
    ([&db](const crow::request& req, crow::response& res, JwtMiddleware::context& ctx) {
        try {
            auto conn = db.connect();
            pqxx::work txn(conn);
            
            pqxx::result result = txn.exec_params(
                "SELECT e.id, e.first_name, e.last_name, e.position, "
                "d.name as department_name, e.hire_date, "
                "m.first_name || ' ' || m.last_name as manager_name, "
                "u.email as manager_email "
                "FROM employees e "
                "LEFT JOIN departments d ON e.department_id = d.id "
                "LEFT JOIN employees m ON d.manager_id = m.id "
                "LEFT JOIN users u ON m.user_id = u.id "
                "WHERE e.user_id = $1",
                ctx.user_id
            );
            
            if (result.empty()) {
                res.code = 404;
                res.end();
                return;
            }
            
            json profile;
            profile["id"] = result[0]["id"].as<int>();
            profile["first_name"] = result[0]["first_name"].as<std::string>();
            profile["last_name"] = result[0]["last_name"].as<std::string>();
            profile["position"] = result[0]["position"].as<std::string>();
            profile["department_name"] = result[0]["department_name"].as<std::string>();
            profile["hire_date"] = result[0]["hire_date"].as<std::string>();
            profile["manager_name"] = result[0]["manager_name"].as<std::string>();
            profile["manager_email"] = result[0]["manager_email"].as<std::string>();
            
            res.body = profile.dump();
            res.set_header("Content-Type", "application/json");
            res.end();
        } catch (std::exception& e) {
            res.code = 500;
            res.body = json{{"error", e.what()}}.dump();
            res.end();
        }
    });
    
    // Attendance endpoint
    CROW_ROUTE(app, "/attendance")
    .methods("GET"_method)
    ([&db](const crow::request& req, crow::response& res, JwtMiddleware::context& ctx) {
        try {
            auto conn = db.connect();
            pqxx::work txn(conn);
            
            // First get the employee ID for this user
            pqxx::result emp_result = txn.exec_params(
                "SELECT id FROM employees WHERE user_id = $1",
                ctx.user_id
            );
            
            if (emp_result.empty()) {
                res.code = 404;
                res.end();
                return;
            }
            
            int employee_id = emp_result[0]["id"].as<int>();
            
            // Get attendance records
            pqxx::result result = txn.exec_params(
                "SELECT date, clock_in, clock_out, "
                "CASE WHEN clock_out IS NOT NULL THEN "
                "EXTRACT(EPOCH FROM (clock_out - clock_in))/3600 ELSE 0 END "
                "as hours_worked "
                "FROM attendance "
                "WHERE employee_id = $1 "
                "ORDER BY date DESC LIMIT 30",
                employee_id
            );
            
            json attendance = json::array();
            for (auto row : result) {
                json record;
                record["date"] = row["date"].as<std::string>();
                if (!row["clock_in"].is_null())
                    record["clock_in"] = row["clock_in"].as<std::string>();
                if (!row["clock_out"].is_null())
                    record["clock_out"] = row["clock_out"].as<std::string>();
                record["hours_worked"] = row["hours_worked"].as<double>();
                attendance.push_back(record);
            }
            
            res.body = attendance.dump();
            res.set_header("Content-Type", "application/json");
            res.end();
        } catch (std::exception& e) {
            res.code = 500;
            res.body = json{{"error", e.what()}}.dump();
            res.end();
        }
    });
    
    // Tasks endpoint
    CROW_ROUTE(app, "/tasks")
    .methods("GET"_method)
    ([&db](const crow::request& req, crow::response& res, JwtMiddleware::context& ctx) {
        try {
            auto conn = db.connect();
            pqxx::work txn(conn);
            
            // First get the employee ID for this user
            pqxx::result emp_result = txn.exec_params(
                "SELECT id FROM employees WHERE user_id = $1",
                ctx.user_id
            );
            
            if (emp_result.empty()) {
                res.code = 404;
                res.end();
                return;
            }
            
            int employee_id = emp_result[0]["id"].as<int>();
            
            // Get tasks assigned to this employee
            pqxx::result result = txn.exec_params(
                "SELECT t.id, t.title, t.description, t.status, t.deadline, "
                "t.rejection_comment "
                "FROM tasks t "
                "WHERE t.assigned_to = $1 "
                "ORDER BY t.deadline ASC",
                employee_id
            );
            
            json tasks = json::array();
            for (auto row : result) {
                json task;
                task["id"] = row["id"].as<int>();
                task["title"] = row["title"].as<std::string>();
                task["description"] = row["description"].as<std::string>();
                task["status"] = row["status"].as<std::string>();
                task["deadline"] = row["deadline"].as<std::string>();
                if (!row["rejection_comment"].is_null())
                    task["rejection_comment"] = row["rejection_comment"].as<std::string>();
                tasks.push_back(task);
            }
            
            res.body = tasks.dump();
            res.set_header("Content-Type", "application/json");
            res.end();
        } catch (std::exception& e) {
            res.code = 500;
            res.body = json{{"error", e.what()}}.dump();
            res.end();
        }
    });
    
    // Submit task endpoint
    CROW_ROUTE(app, "/tasks/<int>/submit")
    .methods("POST"_method)
    ([&db](const crow::request& req, crow::response& res, JwtMiddleware::context& ctx, int task_id) {
        try {
            auto conn = db.connect();
            pqxx::work txn(conn);
            
            // Check if task belongs to this employee
            pqxx::result emp_result = txn.exec_params(
                "SELECT e.id FROM employees e WHERE e.user_id = $1",
                ctx.user_id
            );
            
            if (emp_result.empty()) {
                res.code = 404;
                res.end();
                return;
            }
            
            int employee_id = emp_result[0]["id"].as<int>();
            
            pqxx::result task_result = txn.exec_params(
                "SELECT id FROM tasks WHERE id = $1 AND assigned_to = $2",
                task_id, employee_id
            );
            
            if (task_result.empty()) {
                res.code = 404;
                res.body = json{{"error", "Task not found or not assigned to you"}}.dump();
                res.end();
                return;
            }
            
            // Update task status
            txn.exec_params(
                "UPDATE tasks SET status = 'submitted' WHERE id = $1",
                task_id
            );
            
            txn.commit();
            
            res.code = 200;
            res.body = json{{"message", "Task submitted successfully"}}.dump();
            res.end();
        } catch (std::exception& e) {
            res.code = 500;
            res.body = json{{"error", e.what()}}.dump();
            res.end();
        }
    });
    
    // Start the server
    app.port(port).multithreaded().run();
    
    return 0;
}