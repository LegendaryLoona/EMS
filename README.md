#  Employee Management System (EMS)

This is a submission for an individual project assessment for the Programming Clinic Course for Lancaster University. 

Student ID: 39583627.

This is a distributed web application built for managing employees in an organization.

Below are links to the github repository and to the application deployed on Render.com. 

Github: https://github.com/LegendaryLoona/EMS

Render.com: https://myfrontend-8zrf.onrender.com (Might take a minute to activate. Application needs to build again after not being used for some time.) 

Below is the list of login info/credentials:
| User       | Username                    | Password                                                                    |
|------------|-----------------------------|-----------------------------------------------------------------------------|
| Admin      | admin                       | admin                                                                       |
| Manager    | Manager                     | Manager                                                                     |
| Employee   | Employee                    | Employee                                                                    |

##  Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)

---

##  Overview

The Employee Management System (EMS) is designed to help organizations efficiently manage their employee information, task assignments, and attendance info.

The application consists of 4 separate servers. 

Frontend Server is used to present the user with an easy-to-use interface with which the user can send requests to the backeend servers. It also redirects users from PCs to the main backend and users from mobile devices to the Mobile Backend.

Main Backend server is used for all functions of admin's, manager's and employee's dashboards.

Mobile Backend is used to present the user with a simplified version of an Employee dashboard.

PostgreSQL Server is used to store data in a secure and convenient way.

##  Features

###  Functional Features

| Actor      | Feature                     | Description                                                                 |
|------------|-----------------------------|-----------------------------------------------------------------------------|
| Auth       | Login/Logout                | Allows users to log in/out of the system                                   |
| Admin      | Manage users                | Allows admin to add new users, edit and delete existing ones               |
| Admin      | Manage Employees            | Allows admin to add new Employees, edit and delete existing ones           |
| Admin      | Manage Department           | Allows admin to add new Departments, edit and delete existing ones         |
| Manager    | Manage Attendance           | Allows Manager to Clock-in/Clock-out Employees                             |
| Manager    | Manage Tasks                | Allows Manager to Assign tasks to Employees, Accept and reject them        |
| Employees  | View Profiles               | Displays employee details like department, manager, and salary             |
| Employees  | Submit Tasks                | Allows Employees to submit their tasks to their Manager                    |


### Non-Functional Features

- Cross-platform compatibility
- Data security
- Easy deployment via Docker

---

## Tech Stack

| Layer          | Language/Framework          |
|----------------|-----------------------------|
| Frontend       | HTML, JavaScript, ReactJS   |
| Main Backend   | Python, Django Framework    |
| Mobile Backend | Go, Gin                     |
| Database       | PostgreSQL                  |
| Deployment     | Docker, Render.com          |


## Deployment

Due to the large number of resources and frameworks used, the deployment of Frontend and Main Backend Server was performed via Docker.

Render.com was used to deploy the application online for free. It hosts all four servers and allows them to communicate with each other. It also allows any user to access the aplication from any device.

For deployment it is recommended to Deploy the application on a clound platform instead of running it on a local machine due to the large amount of used resources and necessary changes.

Application can be set up for free using Render.com as a platform.

### Database

The first step is to create a PostgreSQL database service. This service will provide us with the internal database URL, hostname, db_name, username, password and port. 

### Main Backend

The second step is to create two web services for the backend services. Docker file for the main backend is located in the root directory of the repository.

Main backend requires three environmental variables:

DATABASE_URL = the internal URL of the PostgreSQL database

DEBUG = FALSE

SECRET_KEY = 25bbeb0bc9320b7fd43bb0fbe237acae


### Mobile Backend

Mobile backend should be deployed using Go. Below are the necessary settings.

The root directory is ./SecondBackend

Build Command: $ go build -tags netgo -ldflags '-s -w' -o app

Start Command: $ ./app

Required Environmental Variables:

DB_HOST = db_host from Postgres

DB_NAME = db_name from Postgres

DB_PASSWORD = password from Postgres

DB_PORT = port from postgres

DB_USER = username from postgres

### Frontend

In order to create a frontend, you will need to create a Static Site instance.

The root directory with the docker file for front end is ./frontend

Build command: $ npm install && npm run build

Publish Directory: build

Frontend also requires two environmental variables with Backend links. These links are provided when you create the backend servers.

REACT_APP_API_URL = link to the Main Backend server
REACT_APP_MOBILE_API_URL = link to the Mobile Backend server

Those are all the parametres needed to fully set up the application. The admin user is created automatically when the main backend server is deployed. The username and password are both admin

## How to use

Log in with the credentials that were provided in this README.

### Admin instructions

User management allows the admin to create/edit/delete users

Employee info allows the admin to create/edit/delete info about employees

Requests tab has the requests sent by a manager. Admin can complete or reject them.

Departments tab allows the admin to create/edit/delete departments


### Manager instructions

My profile tab has the info about the user

My department tab shows the list of department's employees and lets the user clock-in/clock-out employees

Attendance history tab allows the user to view the attendance history of any employee

Tasks tab allows the user to assign new tasks to the employees and to accept/reject submitted tasks

Requests tab allows the user to send a request to an admin. (For example request to create a new employee)


### Employee instructions

My profile tab has the info about the user

Attendance tab has the info about the employee's attendance

My tasks tab lets the employee complete the tasks that were assigned to them
