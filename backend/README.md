# Backend - Node.js Authentication API

## 🚀 Project Overview  
This is the backend for an authentication system built with Node.js, Express, and Prisma. It provides user registration, login, and JWT-based authentication.

## 🛠️ Tech Stack  
- **Node.js** - Runtime environment  
- **Express** - Backend framework  
- **Prisma** - ORM for database  
- **PostgreSQL** - Database  
- **JWT** - Authentication  
- **Zod** - Input validation  
- **Bcrypt.js** - Password hashing  

## 📦 Installation  

1. Clone the repository:  
   ```sh
   git clone https://github.com/Simran903/IntelliSQR_Assignment.git
   cd backend
   ```

2. Install dependencies:  
   ```sh
   npm install
   ```

3. Create a `.env` file:  
   ```sh
   DATABASE_URL=postgresql://user:password@localhost:5432/authdb
   JWT_SECRET=your_random_secret_key
   PORT=your_port
   ```

4. Run database migrations:  
   ```sh
   npx prisma migrate dev
   ```

5. Start the server:  
   ```sh
   npm run dev
   ```

## 📌 API Endpoints  

### **Auth Routes**  
Base URL: `/api/users`  

| Method | Endpoint      | Description            | Request Body |
|--------|-------------|----------------------|--------------|
| `POST` | `/register` | Registers a new user | `{ email, password }` |
| `POST` | `/login`    | Logs in a user, returns JWT | `{ email, password }` |
| `GET` | `/dashboard`    | Protected route (requires auth) |  |
