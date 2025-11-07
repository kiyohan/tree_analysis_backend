## DSI Platform - Backend
This is the backend server for the ML-Assisted HTP (House-Tree-Person) Interpretation Platform. It provides a RESTful API for managing user authentication, drawing submissions, case management, and integration with an external Machine Learning service for initial drawing analysis.

### Table of Contents
1.  [Project Overview](#project-overview)
2.  [Features](#features)
3.  [Technology Stack](#technology-stack)
4.  [Prerequisites](#prerequisites)
5.  [Installation and Setup](#installation-and-setup)
6.  [API Endpoints](#api-endpoints)
7.  [Environment Variables](#environment-variables)
8.  [Scripts](#scripts)
9.  [Project Structure](#project-structure)

---

### Project Overview

This backend server provides a secure and scalable RESTful API for the ML-Assisted HTP (House-Tree-Person) Interpretation Platform. It manages user authentication, data ingestion of drawings, case management for psychological assessment, and automatic assignment of cases to assessors. It is designed to work with an external Machine Learning service that performs the initial drawing analysis.

### Features

-   **Role-Based Access Control (RBAC):** Secure endpoints for three user roles: `Uploader`, `Assessor`, and `Admin`.
-   **JWT Authentication:** Stateless authentication using JSON Web Tokens.
-   **Drawing Submission:** Handles multipart/form-data for image uploads, storing images on a cloud service (e.g., Cloudinary).
-   **ML Service Integration:** Communicates with an external AI/ML API to get preliminary analysis of drawings.
-   **Automated Case Assignment:** Implements a round-robin (load-balancing) algorithm to automatically assign flagged cases to the assessor with the lightest workload.
-   **Full Case Lifecycle Management:** Tracks cases from initial screening through to final review by an assessor.
-   **Admin Dashboard & Management:** Provides endpoints for system analytics, user management (CRUD), and manual case auditing/reassignment.
-   **System Logging:** Records key system events for auditing purposes.

### Technology Stack

-   **Node.js:** JavaScript runtime environment.
-   **Express.js:** Web application framework for Node.js.
-   **MongoDB:** NoSQL database for storing user, drawing, and case data.
-   **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js.
-   **JSON Web Tokens (JWT):** For securing API endpoints.
-   **bcrypt.js:** For hashing user passwords.
--   **Multer & Cloudinary:** For handling file uploads to the cloud.
-   **Dotenv:** For managing environment variables.
-   **Axios:** For making requests to the external ML service.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
-   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)
-   [Cloudinary](https://cloudinary.com/) account for image storage.

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd dsi-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the `dsi-backend` directory. Copy the contents of `.env.example` (if provided) or use the template below.
    ```
    # See the Environment Variables section for details
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=a_very_strong_and_long_secret_key_for_jwt
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ML_API_ENDPOINT=https://api.example.com/ml/analyze-drawing
    ```

4.  **Seed the database with initial users:**
    The application requires initial users to function. Run the seeder script to create default users (`admin`, `uploader1`, `assessor1`).
    ```bash
    node seeder.js
    ```

5.  **Start the server:**
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:5001`.

### API Endpoints

A summary of the main API routes. All protected routes require an `Authorization: Bearer <token>` header.

-   `POST /api/auth/login`: Login a user.
-   `GET /api/auth/me`: Get the current logged-in user's data.
-   `POST /api/drawings`: (Uploader) Submit a new drawing.
-   `GET /api/drawings`: (Uploader) Get submission history.
-   `GET /api/cases`: (Assessor) Get cases assigned to the logged-in assessor.
-   `POST /api/cases/:id/review`: (Assessor) Submit a final review for a case.
-   `GET /api/admin/analytics`: (Admin) Get dashboard statistics.
-   `GET /api/admin/cases`: (Admin) Get all cases for auditing.
-   `PUT /api/admin/cases/:id/reassign`: (Admin) Manually reassign a case.
-   `GET /api/admin/logs`: (Admin) Get recent system activity logs.
-   `GET, POST, PUT, DELETE /api/users`: (Admin) Full CRUD operations for users.

### Environment Variables

-   `PORT`: The port on which the server will run (default: 5001).
-   `MONGO_URI`: Your MongoDB connection string.
-   `JWT_SECRET`: A long, random, and secret string for signing JWTs.
-   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials from your Cloudinary account.
-   `ML_API_ENDPOINT`: The URL of the external Machine Learning service API.

### Scripts

-   `npm start`: Starts the server using `node server.js`.
-   `npm run dev`: Starts the server with `nodemon` for automatic restarts during development.
-   `npm run seed`: Runs the `seeder.js` script to populate the database with initial users.

### Project Structure

```
dsi-backend/
├── config/         # Database connection
├── controllers/    # Route handling and business logic
├── middlewares/    # Custom middlewares (auth, file upload)
├── models/         # Mongoose data models
├── routes/         # API route definitions
├── services/       # Business logic services (logging, assignment)
├── .env            # Environment variables
└── server.js       # Main server entry point
```