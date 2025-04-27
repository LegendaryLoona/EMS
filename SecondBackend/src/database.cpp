#include "database.h"
#include <iostream>

Database::Database(const std::string& connection_string) 
    : connection_string_(connection_string) {}

bool Database::connect() {
    try {
        conn_ = std::make_unique<pqxx::connection>(connection_string_);
        return conn_->is_open();
    } catch (const std::exception& e) {
        std::cerr << "Database connection error: " << e.what() << std::endl;
        return false;
    }
}

nlohmann::json Database::getEmployeeProfile(const std::string& username) {
    try {
        pqxx::work txn(*conn_);
        pqxx::result result = txn.exec_params(
            "SELECT e.id, e.first_name, e.last_name, e.position, "
            "d.name as department_name, m.first_name || ' ' || m.last_name as manager_name, "
            "u.email as manager_email, e.hire_date "
            "FROM employees e "
            "JOIN auth_user au ON e.user_id = au.id "
            "LEFT JOIN departments d ON e.department_id = d.id "
            "LEFT JOIN employees m ON e.manager_id = m.id "
            "LEFT JOIN auth_user u ON m.user_id = u.id "
            "WHERE au.username = $1",
            username
        );
        txn.commit();
        
        if (result.empty()) {
            return nlohmann::json{{"error", "Employee not found"}};
        }
        
        auto row = result[0];
        return nlohmann::json{
            {"id", row["id"].as<int>()},
            {"first_name", row["first_name"].as<std::string>()},
            {"last_name", row["last_name"].as<std::string>()},
            {"position", row["position"].as<std::string>()},
            {"department_name", row["department_name"].is_null() ? "" : row["department_name"].as<std::string>()},
            {"manager_name", row["manager_name"].is_null() ? "" : row["manager_name"].as<std::string>()},
            {"manager_email", row["manager_email"].is_null() ? "" : row["manager_email"].as<std::string>()},
            {"hire_date", row["hire_date"].as<std::string>()}
        };
    } catch (const std::exception& e) {
        std::cerr << "Database error in getEmployeeProfile: " << e.what() << std::endl;
        return nlohmann::json{{"error", "Database error"}};
    }
}

nlohmann::json Database::getAttendanceRecords(const std::string& username) {
    try {
        pqxx::work txn(*conn_);
        pqxx::result result = txn.exec_params(
            "SELECT a.date, a.clock_in, a.clock_out, a.hours_worked "
            "FROM attendance a "
            "JOIN employees e ON a.employee_id = e.id "
            "JOIN auth_user au ON e.user_id = au.id "
            "WHERE au.username = $1 "
            "ORDER BY a.date DESC LIMIT 30",
            username
        );
        txn.commit();
        
        nlohmann::json records = nlohmann::json::array();
        for (auto row : result) {
            records.push_back({
                {"date", row["date"].as<std::string>()},
                {"clock_in", row["clock_in"].is_null() ? nullptr : row["clock_in"].as<std::string>()},
                {"clock_out", row["clock_out"].is_null() ? nullptr : row["clock_out"].as<std::string>()},
                {"hours_worked", row["hours_worked"].as<double>()}
            });
        }
        return records;
    } catch (const std::exception& e) {
        std::cerr << "Database error in getAttendanceRecords: " << e.what() << std::endl;
        return nlohmann::json{{"error", "Database error"}};
    }
}

nlohmann::json Database::getTasks() {
    try {
        pqxx::work txn(*conn_);
        pqxx::result result = txn.exec(
            "SELECT t.id, t.title, t.description, t.status, t.deadline, "
            "t.rejection_comment, t.assigned_to "
            "FROM tasks t"
        );
        txn.commit();
        
        nlohmann::json tasks = nlohmann::json::array();
        for (auto row : result) {
            tasks.push_back({
                {"id", row["id"].as<int>()},
                {"title", row["title"].as<std::string>()},
                {"description", row["description"].as<std::string>()},
                {"status", row["status"].as<std::string>()},
                {"deadline", row["deadline"].is_null() ? "" : row["deadline"].as<std::string>()},
                {"rejection_comment", row["rejection_comment"].is_null() ? "" : row["rejection_comment"].as<std::string>()},
                {"assigned_to", row["assigned_to"].as<int>()}
            });
        }
        return tasks;
    } catch (const std::exception& e) {
        std::cerr << "Database error in getTasks: " << e.what() << std::endl;
        return nlohmann::json{{"error", "Database error"}};
    }
}

bool Database::submitTask(int taskId) {
    try {
        pqxx::work txn(*conn_);
        pqxx::result result = txn.exec_params(
            "UPDATE tasks SET status = 'submitted' WHERE id = $1 AND status = 'in_progress'",
            taskId
        );
        txn.commit();
        return result.affected_rows() > 0;
    } catch (const std::exception& e) {
        std::cerr << "Database error in submitTask: " << e.what() << std::endl;
        return false;
    }
}