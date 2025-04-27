// server.cpp
#include "crow_all.h"

int main()
{
    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([](){
        return "Hello from Crow!";
    });

    app.port(8080).multithreaded().run();
}
