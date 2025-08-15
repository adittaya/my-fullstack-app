# Full-Stack Investment Platform

A full-stack web application with user authentication, built with React, Node.js, Express, and Supabase.

## Features

1. User Authentication (Register/Login with JWT)
2. Protected Routes
3. User Dashboard
4. Balance Management

## Tech Stack

- Frontend: React.js
- Backend: Node.js + Express.js
- Database: Supabase (PostgreSQL)
- Authentication: JWT

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_API_KEY=your_supabase_api_key
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Deployment

- Frontend: Netlify
- Backend: Render
- Database: Supabase

## Environment Variables

Create `.env` files in both frontend and backend directories with the appropriate values.