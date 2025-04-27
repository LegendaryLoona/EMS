#pragma once
#include <string>
#include <pqxx/pqxx>
#include <nlohmann/json.hpp>

class Database {
public:
    Database(const std::string& connection_string);
    bool connect();
    nlohmann::json getEmployeeProfile(const std::string& username);
    nlohmann::json getAttendanceRecords(const std::string& username);
    nlohmann::json getTasks();
    bool submitTask(int taskId);
    
private:
    std::string connection_string_;
    std::unique_ptr<pqxx::connection> conn_;
};