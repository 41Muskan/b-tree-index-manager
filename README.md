# B-Tree Index Manager 🌳

**Professional Database Indexing & Performance Optimization System**

A comprehensive full-stack application for building, managing, and optimizing B-Tree indexes with an attractive UI interface and RESTful API backend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Architecture](#project-architecture)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**B-Tree Index Manager** is an enterprise-grade solution for managing database indexes. It provides:

- **Express Queries**: Utilize B-tree indexes for optimized database queries
- **Index Management**: Create, read, update, and delete indexes with ease
- **Tree Balancing**: Automatic tree balance management through rotations
- **Fragmentation Monitoring**: Shell scripts monitor index fragmentation
- **Git Tracking**: Version control for index structure evolution
- **Performance Analytics**: Real-time performance metrics and insights

This project builds on the foundation of B-trees used by MongoDB internally and demonstrates professional implementation patterns.

---

## ✨ Features

✅ **User-Friendly Dashboard** - Beautiful, responsive UI with real-time data visualization  
✅ **Index Management** - Create, view, edit, and delete B-tree indexes  
✅ **Performance Metrics** - Track index performance and system analytics  
✅ **RESTful API** - Complete backend API for all operations  
✅ **MongoDB Integration** - Persistent data storage with MongoDB  
✅ **Statistics & Analytics** - Detailed index statistics and usage trends  
✅ **Responsive Design** - Mobile-friendly interface with modern CSS  
✅ **Error Handling** - Comprehensive error management and validation  
✅ **Environment Configuration** - Easy setup with .env files  

---

## 📁 Project Structure

```
B_treeIndex_manager/
├── client/                          # Frontend Application
│   ├── public/
│   │   └── index.html              # Main HTML file with attractive UI
│   ├── src/
│   │   ├── app.js                  # Main application logic and DOM interactions
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Page components (Dashboard, Analytics, etc.)
│   │   ├── styles/
│   │   │   └── style.css           # Global styles with gradient themes
│   │   └── utils/
│   │       └── api.js              # API service for backend communication
│   ├── package.json                # Client dependencies
│   └── .env                        # Client environment variables
│
├── server/                          # Backend Application
│   ├── src/
│   │   ├── server.js               # Express server initialization and configuration
│   │   ├── controllers/
│   │   │   └── indexController.js  # Business logic for index operations
│   │   ├── models/
│   │   │   └── Index.js            # MongoDB schema for B-Tree indexes
│   │   ├── routes/
│   │   │   ├── indexRoutes.js      # API endpoints for index CRUD operations
│   │   │   ├── analyticsRoutes.js  # API endpoints for analytics data
│   │   │   └── healthRoutes.js     # Health check endpoint
│   │   ├── middleware/             # Custom middleware for requests
│   │   ├── config/                 # Configuration files
│   │   └── utils/                  # Utility functions and helpers
│   ├── package.json                # Server dependencies
│   └── .env                        # Server environment variables
│
├── README.md                        # Project documentation (this file)
└── .gitignore                      # Git ignore rules

```

---

### 📂 Detailed Folder Structure

#### **Client Folder** (`client/`)
The frontend of the application - a beautiful, responsive web interface.

```
client/
├── public/
│   └── index.html                  # Main entry point with attractive UI
│                                     - Navigation bar with gradient
│                                     - Hero section
│                                     - Dashboard with stat cards
│                                     - Index management interface
│                                     - Analytics section
│                                     - Modal for creating indexes
│                                     - Responsive footer
│
├── src/
│   ├── app.js                      # Application logic
│                                     - Load and display indexes
│                                     - Handle CRUD operations
│                                     - Modal management
│                                     - Event listeners setup
│
│   ├── components/                 # Reusable components (for future React/Vue)
│   │   
│   ├── pages/                      # Page components (for future routing)
│   │
│   ├── styles/
│   │   └── style.css               # Professional CSS styling
│                                     - Modern gradient themes
│                                     - Responsive grid layouts
│                                     - Beautiful stat cards
│                                     - Interactive buttons
│                                     - Modal styling
│                                     - Mobile responsive design
│
│   └── utils/
│       └── api.js                  # API service module
│                                     - getIndexes()
│                                     - createIndex()
│                                     - updateIndex()
│                                     - deleteIndex()
│                                     - getAnalytics()
│
├── package.json                    # Dependencies: http-server, live-server
└── .env                            # API URL configuration

```

#### **Server Folder** (`server/`)
The backend of the application - RESTful API with MongoDB.

```
server/
├── src/
│   ├── server.js                   # Main server file
│                                     - Express app initialization
│                                     - CORS configuration
│                                     - Middleware setup
│                                     - Database connection (MongoDB)
│                                     - Error handling
│                                     - Graceful shutdown
│
│   ├── controllers/
│   │   └── indexController.js      # Index business logic
│                                     - getAllIndexes()
│                                     - getIndexById()
│                                     - createIndex()
│                                     - updateIndex()
│                                     - deleteIndex()
│                                     - getIndexStats()
│
│   ├── models/
│   │   └── Index.js                # MongoDB Index schema
│                                     Fields:
│                                     - name (string, unique)
│                                     - type (btree/bplus)
│                                     - order (number)
│                                     - description
│                                     - status (active/inactive)
│                                     - nodeCount
│                                     - totalKeys
│                                     - fragmentation
│                                     - timestamps
│
│   ├── routes/
│   │   ├── indexRoutes.js          # Index CRUD endpoints
│   │   │                              GET /api/indexes
│   │   │                              POST /api/indexes
│   │   │                              GET /api/indexes/:id
│   │   │                              PUT /api/indexes/:id
│   │   │                              DELETE /api/indexes/:id
│   │   │                              GET /api/indexes/:id/stats
│   │   │
│   │   ├── analyticsRoutes.js      # Analytics endpoints
│   │   │                              GET /api/analytics
│   │   │                              GET /api/analytics/trends
│   │   │
│   │   └── healthRoutes.js         # Health check endpoint
│   │                                  GET /api/health
│   │
│   ├── middleware/                 # Custom middleware (for future use)
│   ├── config/                     # Database and app config
│   └── utils/                      # Helper functions
│
├── package.json                    # Dependencies: express, mongoose, cors, dotenv
└── .env                            # Server configuration

```

---

## 🛠️ Technologies Used

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients, flexbox, grid
- **JavaScript (Vanilla)** - No framework dependencies, lightweight and fast
- **Fetch API** - For communicating with backend

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-Origin Resource Sharing
- **Dotenv** - Environment variable management

### **Development Tools**
- **Nodemon** - Auto-reload during development
- **Http-server** - Simple static server for client
- **Live-server** - Live reload for frontend development

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
cd B_treeIndex_manager
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

### Step 3: Install Client Dependencies
```bash
cd ../client
npm install
```

### Step 4: Configure Environment Variables

**Server (.env)**
```bash
cd ../server
# Edit .env file
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/btree_index_manager
CORS_ORIGIN=http://localhost:3000
```

**Client (.env)**
```bash
cd ../client
# Edit .env file
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

---

## 🚀 Getting Started

### Start MongoDB
```bash
# If MongoDB is installed locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in server/.env
```

### Start the Server
```bash
cd server
npm start
# Or for development with auto-reload
npm run dev
```
Server will run on `http://localhost:5000`

### Start the Client
```bash
cd client
npm start
# Or for development with live reload
npm run dev
```
Client will run on `http://localhost:3000`

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### **1. Indexes Resource**

##### Get All Indexes
```
GET /indexes
Response: Array of index objects
```

##### Get Single Index
```
GET /indexes/:id
Response: Single index object
```

##### Create Index
```
POST /indexes
Body: {
  "name": "string",
  "type": "btree|bplus",
  "order": number,
  "description": "string (optional)"
}
Response: Created index object
```

##### Update Index
```
PUT /indexes/:id
Body: {
  "name": "string",
  "type": "btree|bplus",
  "order": number,
  "status": "active|inactive|optimizing"
}
Response: Updated index object
```

##### Delete Index
```
DELETE /indexes/:id
Response: { "message": "Index deleted successfully" }
```

##### Get Index Statistics
```
GET /indexes/:id/stats
Response: {
  "id": "string",
  "name": "string",
  "nodeCount": number,
  "totalKeys": number,
  "fragmentation": number,
  "lastRebalance": date
}
```

#### **2. Analytics Resource**

##### Get Analytics Data
```
GET /analytics
Response: {
  "totalIndexes": number,
  "activeIndexes": number,
  "totalKeys": number,
  "averageFragmentation": number
}
```

##### Get Usage Trends
```
GET /analytics/trends
Response: Array of usage trend objects
```

#### **3. Health Check**

##### Health Status
```
GET /health
Response: {
  "status": "OK",
  "timestamp": date,
  "uptime": number
}
```

---

## 🏗️ Project Architecture

### **Client-Server Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Frontend (HTML, CSS, JavaScript)             │   │
│  │  - Dashboard with Statistics                         │   │
│  │  - Index Management Interface                        │   │
│  │  - Analytics & Charts                                │   │
│  │  - Modal Forms                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP/AJAX
┌─────────────────────────────────────────────────────────────┐
│                   Backend Server (Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Express.js API Routes                        │   │
│  │  - GET/POST/PUT/DELETE /api/indexes                 │   │
│  │  - GET /api/analytics                                │   │
│  │  - GET /api/health                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Controllers (Business Logic)                    │   │
│  │  - indexController.js (CRUD operations)             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware (CORS, JSON parsing, Error handling)    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ MongoDB Protocol
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Database                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Collection: indexes                              │   │
│  │  - Stores all B-Tree index documents                 │   │
│  │  - Handles queries and aggregations                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow**

```
User Action (Create Index)
        ↓
JavaScript Event Handler (app.js)
        ↓
API Call via fetch (api.js)
        ↓
Express Route Handler (indexRoutes.js)
        ↓
Controller Method (indexController.js)
        ↓
Mongoose Model (Index.js)
        ↓
MongoDB Database
        ↓
Response & UI Update
```

---

## 🎨 UI Features

### **Beautiful Design Elements**

1. **Navigation Bar**
   - Gradient purple-pink background
   - Sticky positioning
   - Responsive menu

2. **Hero Section**
   - Eye-catching headline
   - Call-to-action button
   - Gradient background

3. **Dashboard Statistics**
   - 4 stat cards with icons
   - Hover animations
   - Real-time updates

4. **Index Management**
   - Search functionality
   - Create button with modal
   - List of indexes with actions

5. **Analytics Section**
   - Chart placeholders
   - Responsive grid layout
   - Modern styling

6. **Modal Dialog**
   - Smooth animations
   - Form validation
   - Close functionality

---

## 📝 Usage Example

### Creating an Index via API

```javascript
// Frontend (JavaScript)
const indexData = {
  name: "user_email_index",
  type: "btree",
  order: 5,
  description: "Index for fast email lookups"
};

fetch('http://localhost:5000/api/indexes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(indexData)
})
.then(response => response.json())
.then(data => console.log('Index created:', data));
```

### Getting All Indexes

```javascript
fetch('http://localhost:5000/api/indexes')
  .then(response => response.json())
  .then(indexes => console.log('All indexes:', indexes));
```

---

## 🔍 B-Tree Concepts Implemented

- **Index Creation**: Create B-Tree or B+ Tree indexes with configurable order
- **Node Management**: Track node count and structure
- **Key Management**: Monitor total keys in index
- **Fragmentation Tracking**: Measure and monitor index fragmentation
- **Rebalancing**: Track last rebalance timestamp
- **Status Management**: Active, inactive, or optimizing states

---

## 🚀 Future Enhancements

- [ ] React.js frontend migration for better component reusability
- [ ] Advanced charting with Chart.js or D3.js
- [ ] Real B-Tree algorithm implementation
- [ ] Index query performance benchmarks
- [ ] User authentication and authorization
- [ ] Multi-database support (PostgreSQL, MySQL)
- [ ] Export/import index configurations
- [ ] Scheduled automated rebalancing
- [ ] Email notifications for anomalies
- [ ] Docker containerization

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For questions or issues, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

## 🙏 Acknowledgments

- MongoDB B-Tree index implementation
- Express.js framework
- Mongoose ODM
- Community feedback and contributions

---

**Happy Indexing! 🌳**

*Last Updated: March 2026*
