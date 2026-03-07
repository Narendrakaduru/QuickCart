# QuickCart - E-commerce Platform

QuickCart is a modern, full-stack e-commerce application designed for a seamless shopping experience. It features a robust backend, a responsive frontend, and is fully containerized for easy deployment.

## 🚀 Tech Stack

### Frontend

- **React**: Modern UI library for building dynamic user interfaces.
- **Redux Toolkit**: State management for cart, wishlist, and authentication.
- **Tailwind CSS**: Utility-first CSS framework for premium and responsive design.
- **Vite**: Ultra-fast build tool for modern web development.
- **Lucide React**: For beautiful and consistent iconography.

### Backend

- **Node.js & Express**: Scalable server-side environment and web framework.
- **MongoDB & Mongoose**: NoSQL database and ODM for flexible data modeling.
- **JWT (JSON Web Tokens)**: Secure authentication and role-based access control.
- **Multer**: For handling image and file uploads.
- **Jest & Supertest**: Robust testing suite for backend API.

## 📁 Directory Structure

```
QuickCart/
├── backend/                # Express API & MongoDB Models
│   ├── ...
│   └── uploads/            # Local storage for product images
├── frontend/               # React (Vite) Application
│   ├── ...
│   └── src/
├── mongo_data/             # [LOCAL] Persisted MongoDB data files
├── docker-compose.yml      # Orchestration for the entire stack
└── PROJECT_DETAILS.md      # This documentation file
```

> [!NOTE]
> The `mongo_data/` directory is created automatically when the database service runs. It ensures your data persists even if the containers are stopped or removed.

## 🐳 Docker Setup

The project is fully dockerized for easy setup.

### Prerequisites

- Docker & Docker Compose installed on your system.

### Running the Project

1. Clone the repository and navigate to the root directory.
2. Run the following command:
   ```bash
   docker compose up --build -d
   ```
3. Once the services are up:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5001](http://localhost:5001)
   - **MongoDB**: [mongodb://localhost:27027](mongodb://localhost:27027)

### 📊 Seeding the Database

To populate the database with the pre-registered products and users, run:

```bash
docker compose exec backend npm run data:import
```

> [!TIP]
> If you add new scripts or dependencies to `package.json`, always run `docker compose up --build -d` to ensure the changes are reflected inside the containers.

To clear all data:

```bash
docker compose exec backend npm run data:destroy
```

### 📦 Seed Data

The project comes with pre-configured data to get you started:

- **Products**: 55 high-quality products across multiple categories (Mobiles, Electronics, Fashion, etc.).
- **Users**: 2 pre-registered administrative users:
  - **Super Admin**: `superadmin@quickcart.com` / `sa123`
  - **Admin**: `admin@quickcart.com` / `admin123`

## ✨ Key Features

- **User Authentication**: Secure Login/Register with JWT.
- **Role-Based Access**: Specialized dashboards for Users, Admins, and Superadmins.
- **Product Management**: Complete CRUD for products with image upload support.
- **Shopping Cart & Wishlist**: Persistent state management for user selections.
- **Order Tracking**: Real-time status updates and order history.
- **Responsive Design**: optimized for both desktop and mobile devices.

## 🔗 API Endpoints

- **Auth**: `/api/auth` (login, register)
- **Users**: `/api/users` (profile, address management)
- **Products**: `/api/products` (listing, search, details)
- **Cart**: `/api/cart` (add, remove, update)
- **Orders**: `/api/orders` (checkout, tracking)
- **Logs**: `/api/logs` (system activity monitoring)
