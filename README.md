#  Employee Management System (EMS)

This is a submission for an individual project assessment for the Programming Clinic Course for Lancaster University. 
Student ID: 39583627.

This is a distributed web application built for managing employees in an organization.

##  Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [System Requirements](#system-requirements)

---

##  Overview

The Employee Management System (EMS) is designed to help organizations efficiently manage their employee information, task assignments, and attendance info.

##  Features

###  Functional Features

| Actor      | Feature                     | Description                                                                 |
|------------|-----------------------------|-----------------------------------------------------------------------------|
| Auth       | Login/Logout                | Allows users to securely log in/out of the system                          |
| Admin      | Manage users                | Allows admin to add new users, edit and delete existing ones               |
| Admin      | Manage Employees            | Allows admin to add new Employees, edit and delete existing ones           |
| Admin      | Manage Department           | Allows admin to add new Departments, edit and delete existing ones         |
| Manager    | Manage Attendance           | Allows Manager to Clock-in/Clock-out Employees                             |
| Manager    | Manage Tasks                | Allows Manager to Clock-in/Clock-out Employees                             |
| Employees  | View Profiles               | Displays employee details like department, manager, and salary             |
| Tasks      | Assign & Submit Tasks       | Managers assign tasks, employees can mark them as submitted                |
| HR Tools   | View by Department          | Filter and search employees based on department and position               |
| Reports    | Dashboard                   | Presents tabular reports of employee-task relationships                    |

### ⚙️ Non-Functional Requirements

- Mobile responsiveness
- RESTful API support
- Cross-platform compatibility
- Secure task update endpoints
- Continuous delivery and development setup via Docker

---

## 🧰 Tech Stack

| Layer          | Technology                  |
|----------------|-----------------------------|
| Frontend       | HTML, JavaScript, Tailwind  |
| Backend        | Go (Gin Framework)          |
| API Gateway    | Gin Router                  |
| Database       | PostgreSQL                  |
| Deployment     | Docker                      |
| Diagrams       | Draw.io for UML             |

---

## 🏗️ Architecture

The application follows a modular microservices approach, consisting of:

- **Frontend Server**: Static HTML/JS served with Tailwind CSS
- **Backend Server**: Gin-based REST API (Go)
- **Database Server**: PostgreSQL with multiple relational tables
- **Gateway Layer**: Acts as entry point for all HTTP requests

