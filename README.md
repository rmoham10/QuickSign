# QuickSign - User Management App

## Project Overview

**QuickSign** is a User Management & Verification App that allows admins to create, verify, and manage users efficiently. It includes email and phone verification workflows, password hashing, and a simple dashboard for monitoring users.

### Current Status

- ✅ User signup and login implemented  
- ✅ Phone number verification via OTP (Twilio)
- ✅ Email ID Verification via Email(Mailgun)
- ✅ JWT-based authentication and protected routes

---

## Tech Stack

- **Frontend:** React.js + Vite  
- **Backend:** Node.js + Express.js  
- **Database:** MySQL (using `mysql2` package)  
- **Authentication:** JWT (JSON Web Tokens)  
- **OTP / SMS:** Twilio
- **Email:** Mailgun
- **HTTP Client:** Axios

---

## Prerequisites

Before running the project, make sure the following are installed:

1. **Node.js (v18 or higher)** 

2. **MySQL** – for the database

3. **React With Vite**

4. **Twilio account** – for sending phone OTPs  
   - Get your **Account SID**, **Auth Token**, and **Phone Number**  
   - Add them in `.env` as shown in `.env.example`  

5. **Mailgun account** – for sending verification emails  
   - Get your **API key** and **domain**  
   - Add them in `.env` as shown in `.env.example`  

---

## Installation & Setup

### 1. Clone the repository
- git clone https://github.com/your-username/QuickSign.git
- cd QuickSign
### 2. Install backend dependencies
- cd server
- npm install
### 3. Install frontend dependencies
- cd ../client
- npm install
### 4. Configure environment variables
- Copy .env.example to .env in the server folder and fill in the required values:
- **Required variables include:**
- PORT:SERVER_PORT_NUMBER
- Database credentials: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- JWT secret: JWT_SECRET
- Twilio: TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- Mailgun: MAILGUN_API_KEY, MAILGUN_DOMAIN
- CLIENT_URL:(https://localhost:PORT_NUMBER)
### 5. Set up the database
- Open MySQL and create the database:
- CREATE DATABASE quicksign_db;
- Import the SQL schema provided in server/db/schema.sql:
- USE quicksign_db;
- Create an admin user manually to access the admin dashboard:
- INSERT INTO users (id, full_name, email, email_verified, password_hash, phone, phone_verified, role)
- VALUES (
    UUID(), 
    'Admin Name', 
    'admin@example.com',
    1, 
    '<hashed_password>', 
    '+11234567890', (makesure to mention country code)
    1, 
    'Admin'
  );
- Replace the vlaues with your own values for the full_name, email, and phone.
- <hashed_password> should be hashed using bcrypt (same as your app). You can generate it via Node.js script or an online bcrypt tool.
### 6. Start the backend server
- cd server
- npm run dev
- The backend will run on the port specified in .env.
### 7. Start the frontend (Vite)
- cd ../client
- npm run dev
- The frontend will run on http://localhost:5173 (Vite default port).

