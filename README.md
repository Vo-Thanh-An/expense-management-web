# Expense Management Web

A web-based expense management application designed to help users manage their income and expenses efficiently, track transactions, and monitor their financial situation.

## Project Overview

The **Expense Management Web** provides users with a simple and convenient platform to record, manage, and analyze their personal finances.

The project is developed as a group web development project with separate frontend and backend components.

## Features

* User registration and login
* Manage income and expenses
* Manage expense categories
* Add, edit, and delete transactions
* View transaction history
* Search and filter transactions
* Set and manage budgets
* Dashboard with financial statistics
* Generate financial reports

## Technology Stack

### Frontend

* React
* JavaScript
* HTML
* CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL
* Prisma ORM

### Development Tools

* Git
* GitHub
* Visual Studio Code

## Project Structure

```text
expense-management-web/
├── src/
│   ├── frontend/
│   └── backend/
├── README.md
└── .gitignore
```

## Git Workflow

The project uses a simple Git workflow with `main` as the shared base branch.

```text
main
├── feature/auth
├── feature/expense
├── feature/dashboard
└── feature/report
```

### Branch Naming

Feature branches should follow this format:

```text
feature/<feature-name>
```

Examples:

```text
feature/auth
feature/expense
feature/dashboard
feature/report
```

### Development Workflow

1. Update the local `main` branch.

```bash
git checkout main
git pull origin main
```

2. Create a new feature branch.

```bash
git checkout -b feature/<feature-name>
```

3. Develop and test the feature.

4. Commit the changes.

```bash
git add .
git commit -m "Implement <feature-name>"
```

5. Push the feature branch to GitHub.

```bash
git push -u origin feature/<feature-name>
```

6. Create a Pull Request from the feature branch to `main`.

7. After the Pull Request is reviewed and approved, merge it into `main`.

> Team members should avoid directly developing on the `main` branch.

## Getting Started

### Prerequisites

Make sure the following tools are installed:

* Node.js
* npm
* PostgreSQL
* Git

### Clone the Repository

```bash
git clone https://github.com/Vo-Thanh-An/expense-management-web.git
```

Then navigate to the project directory:

```bash
cd expense-management-web
```

## Project Status

**Status:** In Development

The project is currently under development. More features and improvements will be added during the development process.

## Team

Developed as a group project.
