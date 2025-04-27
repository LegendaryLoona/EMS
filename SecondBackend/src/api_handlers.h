#pragma once
#include <crow.h>
#include "database.h"
#include <string>

class APIHandlers {
public:
    APIHandlers(Database& db);
    crow::response getEmployeeProfile(const crow::request& req);
    crow::response getAttendanceRecords(const crow::request& req);
    crow::response getTasks(const crow::request& req);
    crow::response submitTask(const crow::request& req, int taskId);
    
private:
    Database& db_;
    std::string extractUsername(const crow::request& req);
};