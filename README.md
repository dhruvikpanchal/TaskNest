# TaskNest - Team Task & Workflow Manager

TaskNest is a full-stack web application designed for team collaboration, task management, and workflow tracking. Built with MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Authentication & Authorization**: JWT-based auth with Role-Based Access Control (Admin, Team Lead, Team Member).
- **Task Management**: Create, read, update, and delete tasks. Assign tasks to team members.
- **Workflow Tracking**: Kanban-style status tracking (To Do, In Progress, Review, Completed).
- **Team Management**: Create teams and manage members.
- **Responsive Design**: Modern UI built with Tailwind CSS.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Context API, Axios, React Router.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose.

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB installed and running locally (or use Atlas URI)

### Installation

1. **Clone the repository** (if applicable) or navigate to project folder.

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

   - Create a `.env` file in `backend/` based on `.env.example`.

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/tasknest
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

   - Start the backend server:

   ```bash
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

   - Start the frontend development server:

   ```bash
   npm run dev
   ```

4. **Access the App**

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## User Roles

- **Admin**: Can create teams, manage users, and view everything.
- **Team Lead**: Can create tasks, assign them, and manage team workflows.
- **Team Member**: Can view assigned tasks and update their status.
