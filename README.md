# 🎓 Smart Education System

A Smart Education System designed to provide a simple, user-friendly digital platform for students and educational institutions. The project combines a **Java Spring Boot backend** with a web-based frontend and an **AI service** to support intelligent and automated educational features.

## 🚀 Features

* 🔐 **User Login System** – Secure login interface for users.
* 🖥️ **Web-Based Interface** – Simple and responsive HTML-based frontend.
* ⚙️ **Spring Boot Backend** – Handles application logic and backend services.
* 🤖 **AI Service** – Python-based AI service for intelligent features.
* 📊 **Student Management** – Supports management of student-related information.
* 🔗 **Backend–AI Integration** – Connects the Java application with the AI service.
* 📁 **Structured Project Architecture** – Organized frontend, backend, and AI components.

## 🛠️ Technologies Used

### Backend

* Java
* Spring Boot
* Maven

### Frontend

* HTML
* CSS
* JavaScript

### AI Service

* Python
* Flask
* AI/ML libraries

### Tools

* Git
* GitHub
* VS Code / IntelliJ IDEA / Eclipse

## 📂 Project Structure

```text
Smart-Education/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── ... Java source files
│       │
│       └── resources/
│           ├── application.properties
│           └── static/
│               ├── index.html
│               └── login.html
│
├── ai-service/
│   ├── app.py
│   └── requirements.txt
│
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-education.git
cd smart-education
```

### 2. Run the Spring Boot Application

Using Maven:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

Or run the main Spring Boot application directly from your IDE.

### 3. Run the AI Service

Go to the AI service directory:

```bash
cd ai-service
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Then start the AI service:

```bash
python app.py
```

## 🌐 Application

After starting the Spring Boot server, open the application in your browser:

```text
http://localhost:8080
```

The exact URL may depend on the routes configured in the project.

## 🔒 Security Note

Before making the repository public, check `application.properties` for:

* Database usernames/passwords
* API keys
* Secret keys
* Authentication credentials

**Never upload real passwords or API keys to GitHub.**

## 📌 Future Enhancements

* AI-powered personalized learning
* Student performance prediction
* Automated recommendations
* Online assessments and quizzes
* Student progress dashboard
* Cloud deployment
* Integration with external educational platforms

## 🎯 Project Objective

The main objective of the Smart Education System is to use modern software technologies and AI capabilities to create a more efficient, accessible, and intelligent educational platform.

## 👨‍💻 Project

Developed as an educational/hackathon project to demonstrate the integration of **Spring Boot, web technologies, Python AI services, and GitHub-based development**.

## 📄 License

This project is created for educational and demonstration purposes.
