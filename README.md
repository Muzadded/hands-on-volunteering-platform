# HandsOn - A Community-Driven Social Volunteering Platform

## 1. Project Overview
HandsOn is a community-driven social volunteering platform that connects individuals with meaningful social impact opportunities.
Think of it as a "GitHub for social work" where people contribute their time instead of code. The platform empowers communities by
making volunteer work organized, trackable, and impactful.

## 2. Technologies Used
### Frontend
- React.js with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication

### Backend
- Node.js with Express.js
- PostgreSQL for database
- JWT for authentication
- REST API architecture

### Development Tools
- Git for version control
- npm for package management

## 3. Key Features
### User Management
- 🔐 Secure authentication with JWT
- 👤 Comprehensive user profiles
- 📊 Personal dashboard with activity tracking
- ✏️ Profile customization with skills and causes

### Events
- 📅 Create and manage volunteer events
- 🔍 Advanced event search and filtering
- 📍 Location-based event discovery
- ✅ One-click event registration

### Community Help
- 🆘 Post community help requests
- 💬 Interactive comment system
- 🚨 Urgency level indicators

### Teams
- 👥 Create and join volunteer teams
- 🔒 Private/Public team options
- 📈 Team activity dashboard


## 4. Database Schema

\`\`\`sql
-- Users Table  
CREATE TABLE users (  
    user_id SERIAL PRIMARY KEY,  
    name character varying(255) NOT NULL,  
    email character varying(255) UNIQUE NOT NULL,  
    password character varying(255) NOT NULL,  
    gender character varying(50) NOT NULL,  
    dob DATE,  
    about TEXT,  
    skills TEXT,  
    causes TEXT[]  
);

-- Events Table  
CREATE TABLE events (  
    id SERIAL PRIMARY KEY,  
    title character varying(255) NOT NULL,  
    details TEXT,  
    date DATE,  
    location character varying(255),  
    start_time TIME Without time zone,  
    end_time TIME Without time zone,  
    category character varying(255),  
    member_limit INTEGER NOt Null,  
    total_member INTEGER DEFAULT 1,  
    created_by INTEGER REFERENCES users(user_id)  
);

-- Join Event Table  
CREATE TABLE join_event (  
    join_id SERIAL PRIMARY KEY,  
    event_id INTEGER REFERENCES events(id),  
    user_id INTEGER REFERENCES users(user_id),  
    join_date DATE  
);

-- Help Posts Table  
CREATE TABLE help_post (  
    help_post_id SERIAL PRIMARY KEY,  
    created_by INTEGER REFERENCES users(user_id),  
    details TEXT NOT NULL,  
    location character varying(255),  
    urgency_level character varying(50),  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

-- Help Post Comments Table  
CREATE TABLE help_post_comments (  
    comment_id SERIAL PRIMARY KEY,  
    help_post_id INTEGER REFERENCES help_post(help_post_id),  
    user_id INTEGER REFERENCES users(user_id),  
    comment TEXT NOT NULL,  
    created_at TIME Without time zone  
);

-- Teams Table
CREATE TABLE teams (  
    id SERIAL PRIMARY KEY,  
    name character varying(255) NOT NULL,  
    description TEXT,  
    category character varying(255),  
    is_private BOOLEAN DEFAULT false,  
    created_by INTEGER REFERENCES users(user_id),  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

-- Team Members Table
CREATE TABLE team_members (  
    id SERIAL PRIMARY KEY,  
    team_id INTEGER REFERENCES teams(id),  
    user_id INTEGER REFERENCES users(user_id),  
    role character varying(50) DEFAULT 'member',  
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);
\`\`\`

## 5. Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v13 or higher)
- Git

### Environment Setup
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/hands-on-volunteering-platform.git
   cd hands-on-volunteering-platform
   \`\`\`

2. Create and configure environment variables:
   Create a \`.env\` file in both frontend and backend directories:

   Backend (\`/HandsOn_Server/.env\`):
   \`\`\`
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/handsOn
   JWT_SECRET=your_jwt_secret
   \`\`\`

   Frontend (\`/HandsOn_frontend/.env\`):
   \`\`\`
   VITE_API_URL=http://localhost:5000/api
   \`\`\`

### Database Setup
1. Create PostgreSQL database:
   \`\`\`sql
   CREATE DATABASE handsOn;
   \`\`\`

2. Run database migrations:
   \`\`\`bash
   cd HandsOn_Server
   npm run migrate
   \`\`\`

### Installing Dependencies
1. Backend setup:
   \`\`\`bash
   cd HandsOn_Server
   npm install
   \`\`\`

2. Frontend setup:
   \`\`\`bash
   cd HandsOn_frontend
   npm install
   \`\`\`

## 6. API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### User Management

#### Get User Profile
```http
GET /users/:id
```
Retrieves user profile information including joined events and teams.

**Parameters:**
- `id` (path) - User ID

**Response:**
```json
{
  "status": "success",
  "message": "User fetched successfully",
  "data": {
    "user": {
      "user_id": "string",
      "name": "string",
      "email": "string",
      "gender": "string",
      "dob": "string",
      "about": "string",
      "skills": ["string"],
      "causes": ["string"]
    },
    "joinedEvents": [{
      "id": "string",
      "title": "string",
      "date": "string",
      "location": "string",
      "start_time": "string",
      "end_time": "string",
      "category": "string",
      "registeredVolunteers": "number"
    }],
    "joinedTeams": [{
      "id": "string",
      "name": "string",
      "category": "string",
      "role": "string",
      "member_count": "number",
      "joined_at": "string",
      "created_by_name": "string"
    }]
  }
}
```

#### Update User Profile
```http
PUT /users/:id
```
Updates user profile information.

**Parameters:**
- `id` (path) - User ID

**Request Body:**
```json
{
  "name": "string",
  "gender": "string",
  "dob": "string",
  "about": "string",
  "skills": ["string"],
  "causes": ["string"]
}
```

### Events

#### Create Event
```http
POST /create-event/:id
```
Creates a new volunteer event.

**Parameters:**
- `id` (path) - Creator's user ID

**Request Body:**
```json
{
  "title": "string",
  "details": "string",
  "date": "string",
  "location": "string",
  "start_time": "string",
  "end_time": "string",
  "category": "string",
  "member_limit": "number"
}
```

#### Get All Events
```http
GET /get-events
```
Retrieves all events with optional user-specific participation status.

**Query Parameters:**
- `user_id` (optional) - User ID to check participation status

**Response:**
```json
{
  "status": "success",
  "message": "Events fetched successfully",
  "data": [{
    "id": "string",
    "title": "string",
    "details": "string",
    "date": "string",
    "location": "string",
    "category": "string",
    "registered_volunteers": "number",
    "member_limit": "number",
    "user_joined": "boolean"
  }]
}
```

#### Join Event
```http
POST /join-event
```
Registers a user for an event.

**Request Body:**
```json
{
  "event_id": "string",
  "user_id": "string",
  "join_date": "string"
}
```

### Help Posts

#### Create Help Post
```http
POST /create-help-post/:id
```
Creates a new help request post.

**Parameters:**
- `id` (path) - Creator's user ID

**Request Body:**
```json
{
  "details": "string",
  "location": "string",
  "urgency_level": "string"
}
```

#### Get All Help Posts
```http
GET /get-help-posts
```
Retrieves all help posts.

#### Get Help Post Details
```http
GET /help-post/:postId
```
Retrieves details of a specific help post including comments.

**Parameters:**
- `postId` (path) - Help post ID

#### Add Comment to Help Post
```http
POST /help-post/comment
```
Adds a comment to a help post.

**Request Body:**
```json
{
  "postId": "string",
  "userId": "string",
  "comment": "string"
}
```

### Teams

#### Create Team
```http
POST /create-team/:id
```
Creates a new team.

**Parameters:**
- `id` (path) - Creator's user ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "isPrivate": "boolean",
  "created_by": "string"
}
```

#### Get All Teams
```http
GET /get-teams
```
Retrieves all teams with membership status if user is authenticated.

**Response:**
```json
{
  "status": "success",
  "message": "Teams fetched successfully",
  "data": [{
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "is_private": "boolean",
    "member_count": "number",
    "is_member": "boolean"
  }]
}
```

#### Join Team
```http
POST /join-team/:teamId
```
Joins a user to a team.

**Parameters:**
- `teamId` (path) - Team ID

**Request Body:**
```json
{
  "userId": "string"
}
```

#### Get Team Details
```http
GET /team/:teamId
```
Retrieves detailed information about a specific team.

**Parameters:**
- `teamId` (path) - Team ID

**Response:**
```json
{
  "status": "success",
  "message": "Team details fetched successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "is_private": "boolean",
    "member_count": "number",
    "is_member": "boolean",
    "members": [{
      "user_id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "joined_at": "string"
    }]
  }
}
```

### Error Responses
All endpoints may return the following error responses:

```json
{
  "status": "error",
  "message": "Error message description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 7. Running the Project

### Development Environment
1. Start the backend server:
   \`\`\`bash
   cd HandsOn_Server
   npm run dev
   \`\`\`
   The server will run on http://localhost:5000

2. Start the frontend development server:
   \`\`\`bash
   cd HandsOn_frontend
   npm run dev
   \`\`\`
   The application will be available at http://localhost:5173

### Production Environment
1. Build the frontend:
   \`\`\`bash
   cd HandsOn_frontend
   npm run build
   \`\`\`

2. Start the production server:
   \`\`\`bash
   cd HandsOn_Server
   npm start
   \`\`\`

### Docker Deployment (Optional)
1. Build the Docker images:
   \`\`\`bash
   docker-compose build
   \`\`\`

2. Run the containers:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
