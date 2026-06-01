# FocusForge 🎯

FocusForge is a full-stack productivity and task management web application designed to help users stay focused, organized, and productive. The platform allows users to manage tasks, track progress, organize daily activities, and improve workflow through an easy-to-use interface.

## 🚀 Features

### User Authentication

* Secure user registration and login system
* Password validation and authentication
* Session management for authorized access

### Task Management

* Create new tasks
* Update existing tasks
* Delete completed or unwanted tasks
* Track task status and progress

### Productivity Dashboard

* View all tasks in one place
* Monitor ongoing and completed activities
* Organized and user-friendly dashboard

### Responsive Design

* Works on desktops and laptops
* Clean and modern user interface
* Easy navigation and accessibility

## 🛠️ Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Version Control

* Git
* GitHub

## 📂 Project Structure

```text
FocusForge/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── package.json
│
├── .gitignore
├── README.md
└── package-lock.json
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/VarunBableshwar/focusforge.git
cd focusforge
```

### 2. Install Dependencies

#### Client

```bash
cd client
npm install
```

#### Server

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the server folder.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=focusforge
PORT=5000
```

### 4. Setup MySQL Database

Create a MySQL database:

```sql
CREATE DATABASE focusforge;
```

Import the required tables and schema into the database.

### 5. Run the Backend Server

```bash
cd server
npm start
```

Server runs on:

```text
http://localhost:5000
```

### 6. Run the Frontend

```bash
cd client
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## 📸 Application Workflow

1. User registers or logs in.
2. User accesses the dashboard.
3. Tasks can be created, updated, or deleted.
4. Progress is tracked in real time.
5. Data is stored securely in the MySQL database.

## 🔒 Security Features

* Password validation
* Protected routes
* Environment variables for sensitive credentials
* Database connectivity through secure backend APIs

## 🎯 Objectives

* Improve personal productivity
* Organize daily tasks efficiently
* Provide a simple and intuitive task management system
* Demonstrate full-stack web development concepts

## 📈 Future Enhancements

* Task reminders and notifications
* Calendar integration
* Dark mode support
* Team collaboration features
* Analytics and productivity reports
* Cloud deployment support

## 👨‍💻 Developed By

**Varun Bableshwar**

GitHub Repository:
https://github.com/VarunBableshwar/focusforge

## 📄 License

This project is developed for educational and learning purposes. Feel free to use and modify it for academic projects.
