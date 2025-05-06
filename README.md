#  Employee Management System (EMS)

This is a submission for an individual project assessment for the Programming Clinic Course for Lancaster University. 

Student ID: 39583627.

This is a distributed web application built for managing employees in an organization.

Below are links to the github repository and to the application deployed on Render.com. 

Github: https://github.com/LegendaryLoona/EMS

Render.com: https://myfrontend-8zrf.onrender.com (Might take a minute to activate. Application needs to build again after not being used for some time.) 

Below is the list of login info:
| User       | Username                    | Password                                                                    |
|------------|-----------------------------|-----------------------------------------------------------------------------|
| Admin      | admin                       | admin                                                                       |
| Manager    | Manager                     | Manager                                                                     |
| Employee   | Employee                    | Employee                                                                    |

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
| Auth       | Login/Logout                | Allows users to log in/out of the system                                   |
| Admin      | Manage users                | Allows admin to add new users, edit and delete existing ones               |
| Admin      | Manage Employees            | Allows admin to add new Employees, edit and delete existing ones           |
| Admin      | Manage Department           | Allows admin to add new Departments, edit and delete existing ones         |
| Manager    | Manage Attendance           | Allows Manager to Clock-in/Clock-out Employees                             |
| Manager    | Manage Tasks                | Allows Manager to Assign tasks to Employees, Accept and reject them        |
| Employees  | View Profiles               | Displays employee details like department, manager, and salary             |
| Employees  | Submit Tasks                | Allows Employees to submit their tasks to their Manager                    |


### Non-Functional Requirements

- Cross-platform compatibility
- Data security
- Easy deployment via Docker

---

## Tech Stack

| Layer          | Language/Framework          |
|----------------|-----------------------------|
| Frontend       | HTML, JavaScript, ReactJS   |
| Main Backend   | Python, Django Framework    |
| Mobile Backend | Go                          |
| Database       | PostgreSQL                  |
| Deployment     | Docker, Render.com          |

