#include <crow.h>
#include <crow/json.h>
#include <pqxx/pqxx>
#include <string>
#include <vector>
#include <map>
#include <cstdlib>
#include <jwt-cpp/jwt.h>

const std::string DB_CONNECTION = std::getenv("DB_CONNECTION_STRING") ? 
    std::getenv("DB_CONNECTION_STRING") : 
    "";
const std::string JWT_SECRET = std::getenv("JWT_SECRET") ? 
    std::getenv("JWT_SECRET") : 
    "";
const int PORT = std::getenv("PORT") ? std::atoi(std::getenv("PORT")) : 8080;

class MobileAPIServer {
private:
    crow::SimpleApp app;
    
    bool verifyToken(const std::string& token) {
        try {
            auto decoded = jwt::decode(token);
            
            auto verifier = jwt::verify()
                .allow_algorithm(jwt::algorithm::hs256{ JWT_SECRET });
            
            verifier.verify(decoded);
            return true;
        } catch (const std::exception& e) {
            CROW_LOG_ERROR << "JWT verification error: " << e.what();
            return false;
        }
    }
    
    int getUserIdFromToken(const std::string& token) {
        try {
            auto decoded = jwt::decode(token);
            auto payload = decoded.get_payload_json();
            return std::stoi(payload["user_id"].to_str());
        } catch (const std::exception& e) {
            CROW_LOG_ERROR << "Error extracting user ID: " << e.what();
            return -1;
        }
    }
    
    crow::json::wvalue queryDatabase(const std::string& query, const std::vector<std::string>& params = {}) {
        try {
            pqxx::connection conn(DB_CONNECTION);
            
            pqxx::work txn(conn);
            
            pqxx::prepare::declaration stmt = txn.conn().prepare("query", query);
            
            pqxx::result result;
            if (params.empty()) {
                result = stmt.exec();
            } else {
                pqxx::prepare::invocation inv = txn.prepared("query");
                for (const auto& param : params) {
                    inv(param);
                }
                result = inv.exec();
            }
            
            crow::json::wvalue json_result;
            std::vector<crow::json::wvalue> rows;
            
            for (auto row : result) {
                crow::json::wvalue json_row;
                for (size_t col = 0; col < row.size(); ++col) {
                    std::string col_name = result.column_name(col);
                    if (!row[col].is_null()) {
                        json_row[col_name] = row[col].c_str();
                    } else {
                        json_row[col_name] = nullptr;
                    }
                }
                rows.push_back(std::move(json_row));
            }
            
            txn.commit();
            return rows;
        } catch (const std::exception& e) {
            CROW_LOG_ERROR << "Database error: " << e.what();
            return {};
        }
    }

public:
    MobileAPIServer() {
        auto& cors = app.get_middleware<crow::CORSHandler>();
        cors
            .global()
            .headers("Authorization", "Content-Type")
            .methods("GET", "POST", "PUT", "DELETE")
            .prefix("/mobile")
            .origin("*");
        
        app.middleware([this](crow::request& req, crow::response& res, crow::context& ctx, auto done) {
            if (req.url.find("/mobile/auth/login") != std::string::npos) {
                done();
                return;
            }
            
            auto auth_header = req.get_header_value("Authorization");
            if (auth_header.empty() || auth_header.substr(0, 7) != "Bearer ") {
                res.code = 401;
                res.write("Unauthorized");
                res.end();
                return;
            }
            
            std::string token = auth_header.substr(7);
            if (!verifyToken(token)) {
                res.code = 401;
                res.write("Invalid token");
                res.end();
                return;
            }
            
            ctx.user_id = getUserIdFromToken(token);
            done();
        });
        
        CROW_ROUTE(app, "/mobile/auth/login")
            .methods("POST"_method)
            ([this](const crow::request& req) {
                auto json = crow::json::load(req.body);
                if (!json) {
                    return crow::response(400, "Invalid JSON");
                }
                
                std::string username = json["username"].s();
                std::string password = json["password"].s();
                
                std::string query = "SELECT id, username, password FROM auth_user WHERE username = $1";
                auto result = queryDatabase(query, {username});
                
                if (result.empty()) {
                    return crow::response(401, "Invalid credentials");
                }
                
                int user_id = std::stoi(result[0]["id"].dump());
                auto token = jwt::create()
                    .set_issuer("mobile-api")
                    .set_type("JWS")
                    .set_payload_claim("user_id", jwt::claim(std::to_string(user_id)))
                    .set_payload_claim("username", jwt::claim(username))
                    .set_issued_at(std::chrono::system_clock::now())
                    .set_expires_at(std::chrono::system_clock::now() + std::chrono::hours(24))
                    .sign(jwt::algorithm::hs256{JWT_SECRET});
                
                crow::json::wvalue response;
                response["token"] = token;
                response["user"] = {
                    {"id", user_id},
                    {"username", username}
                };
                
                return crow::response(response);
            });
        
        CROW_ROUTE(app, "/mobile/my-profile")
            .methods("GET"_method)
            ([this](const crow::request& req, crow::context& ctx) {
                int user_id = ctx.user_id;
                
                std::string query = 
                    "SELECT e.id, e.first_name, e.last_name, e.position, "
                    "e.hire_date, d.name as department_name, "
                    "m.first_name || ' ' || m.last_name as manager_name, "
                    "u_m.email as manager_email "
                    "FROM hr_employee e "
                    "LEFT JOIN hr_department d ON e.department_id = d.id "
                    "LEFT JOIN hr_employee m ON e.manager_id = m.id "
                    "LEFT JOIN auth_user u_e ON e.user_id = u_e.id "
                    "LEFT JOIN auth_user u_m ON m.user_id = u_m.id "
                    "WHERE e.user_id = $1";
                
                auto result = queryDatabase(query, {std::to_string(user_id)});
                
                if (result.empty()) {
                    return crow::response(404, "Profile not found");
                }
                
                return crow::response(result[0]);
            });
        
        CROW_ROUTE(app, "/mobile/my-attendance")
            .methods("GET"_method)
            ([this](const crow::request& req, crow::context& ctx) {
                int user_id = ctx.user_id;
                
                std::string query = 
                    "SELECT a.date, a.clock_in, a.clock_out, "
                    "CASE WHEN a.clock_out IS NOT NULL THEN "
                    "ROUND(EXTRACT(EPOCH FROM (a.clock_out - a.clock_in)) / 3600, 2) "
                    "ELSE 0 END as hours_worked "
                    "FROM hr_attendance a "
                    "INNER JOIN hr_employee e ON a.employee_id = e.id "
                    "WHERE e.user_id = $1 "
                    "ORDER BY a.date DESC "
                    "LIMIT 30";
                
                auto result = queryDatabase(query, {std::to_string(user_id)});
                return crow::response(result);
            });
        
        CROW_ROUTE(app, "/mobile/tasks")
            .methods("GET"_method)
            ([this](const crow::request& req, crow::context& ctx) {
                int user_id = ctx.user_id;
                
                std::string query = 
                    "SELECT t.id, t.title, t.description, t.status, "
                    "t.deadline, t.rejection_comment, e.id as assigned_to "
                    "FROM hr_task t "
                    "INNER JOIN hr_employee e ON t.assigned_to_id = e.id "
                    "WHERE e.user_id = $1 "
                    "ORDER BY t.deadline ASC";
                
                auto result = queryDatabase(query, {std::to_string(user_id)});
                return crow::response(result);
            });
        
        CROW_ROUTE(app, "/mobile/tasks/<int>/submit")
            .methods("POST"_method)
            ([this](const crow::request& req, int task_id, crow::context& ctx) {
                int user_id = ctx.user_id;
                
                std::string check_query = 
                    "SELECT t.id FROM hr_task t "
                    "INNER JOIN hr_employee e ON t.assigned_to_id = e.id "
                    "WHERE e.user_id = $1 AND t.id = $2";
                
                auto check_result = queryDatabase(check_query, {
                    std::to_string(user_id), 
                    std::to_string(task_id)
                });
                
                if (check_result.empty()) {
                    return crow::response(403, "Not authorized to submit this task");
                }
                
                std::string update_query = 
                    "UPDATE hr_task SET status = 'submitted' "
                    "WHERE id = $1";
                
                queryDatabase(update_query, {std::to_string(task_id)});
                
                return crow::response(200, "Task submitted successfully");
            });
    }
    
    void run() {
        app.port(PORT).multithreaded().run();
    }
};

int main() {
    MobileAPIServer server;
    server.run();
    return 0;
}