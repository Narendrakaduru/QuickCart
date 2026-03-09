# QuickCart - E-commerce Platform

QuickCart is a modern, full-stack e-commerce application designed for a seamless shopping experience. It features a robust backend, a responsive frontend, and is fully containerized for easy deployment.

## 🚀 Tech Stack

### Frontend

- **React**: Modern UI library for building dynamic user interfaces.
- **Redux Toolkit**: State management for cart, wishlist, notifications, and authentication.
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
- **Coupons**: Initial coupons for testing:
  - **QUICK50**: 50% discount on orders above ₹1,000.
  - **FLAT200**: Flat ₹200 discount on orders above ₹500.

## ✨ Key Features

- **User Authentication**: Secure Login/Register with JWT, **password visibility toggles**, **email verification**, and **forgot/reset password** flows.
- **Role-Based Access**: Specialized dashboards for Admins, and Superadmins.
- **System Activity Monitoring**: Advanced log viewer for **Superadmins** to track system actions, errors, and logins with detailed metadata (IP, Method, Path).
- **Enhanced Admin Controls**: **Dynamic sorting** and searching across all administrative tables (Products, Orders, Users, Logs).
- **Product Management**: Complete CRUD for products with image upload support and interactive carousels.
- **Coupon Management & Logic**:
  - Admins can create/edit/delete coupons via the dashboard.
  - Supports **Percentage** (%) and **Fixed** (₹) discounts.
  - Configurable **Minimum Purchase** and **Expiry Dates**.
  - **Usage Limits & Tracking**:
    - Restrict how many times a code can be used globally.
    - **Usage Counting**: Every successful order placement automatically increments the `usedCount` for the applied coupon.
    - **Real-time Checkout Integration**: Validation for availability, expiry, minimum purchase, and usage limits with instant price recalculation.
- **Shopping Cart & Wishlist**: Persistent state management for user selections.
- **Order Tracking**: Real-time status updates and order history.
- **In-App Notifications**:
  - **Bell icon** in the Navbar with animated **unread count badge**.
  - **Dropdown panel** showing recent notifications with type-specific icons (order placed, shipped, payment, cancelled, abandoned cart).
  - **Full history page** at `/notifications` with read/unread visual distinction.
  - **Automatic triggers**: Notifications created on order placement, status updates, payment changes, cancellations, and abandoned carts.
  - **Mark as read**: Individual or bulk "mark all read" support.
- **Abandoned Cart Tracking**: Background worker (`node-cron`) that automatically detects carts inactive for 5 minutes (configurable), sends branded email reminders, triggers in-app notifications, and logs the automated action in System Activity Logs.
- **Responsive Design**: Optimized for all devices, featuring a **single product per row** layout on small screens for better visibility.

## 📧 Email Verification & Password Reset

QuickCart includes a complete email-based authentication flow powered by **Nodemailer** with branded HTML email templates.

### How It Works

1. **Registration → Email Verification**
   - User registers → receives a branded verification email → clicks "Verify My Email" → account activated.
   - Unverified users cannot log in. Re-registration with the same email resends the verification link.

2. **Forgot Password → Reset Password**
   - User submits email on the Forgot Password page → receives a branded reset email → clicks "Reset My Password" → sets a new password.
   - Reset links expire after **10 minutes** for security.

### Email Templates

Templates are defined in `backend/utils/emailTemplates.js` and share a common branded shell:

| Element | Style |
|---|---|
| Logo | Dark `#111827` pill — italic bold **Quick**Cart (`#60a5fa`) — matches the Navbar |
| Card | White, rounded, with a subtle shadow |
| Footer | Copyright + disclaimer in muted text |

| Template | Function | Accent | CTA |
|---|---|---|---|
| Verify Email | `verifyEmailTemplate(name, url)` | Blue-400 → Teal | Green button |
| Reset Password | `resetPasswordEmail(name, url)` | Gray-900 → Blue-400 | Dark button with blue text |

All templates use **inline CSS** for maximum compatibility across Gmail, Outlook, Apple Mail, etc. A plain-text fallback is always included.

### Frontend Pages

| Page | Route | Component |
|---|---|---|
| Forgot Password | `/forgot-password` | `ForgotPassword.jsx` |
| Reset Password | `/reset-password/:token` | `ResetPassword.jsx` |
| Email Verification | `/verify-email/:token` | `VerifyEmail.jsx` |

All pages show success modals on completion and handle error states from the API.

### Required Environment Variables

```env
SMTP_HOST=          # SMTP server host
SMTP_PORT=          # SMTP port (465 for SSL)
SMTP_EMAIL=         # SMTP username
SMTP_PASSWORD=      # SMTP password
FROM_NAME=QuickCart  # Sender display name
FROM_EMAIL=         # Sender email address
FRONTEND_URL=       # Frontend base URL for email links
```

> [!NOTE]
> In **development mode**, if SMTP sending fails, emails are logged to the server console instead of throwing an error — so you can still test the flow without a real mail server.

## 🔗 API Endpoints

- **Auth**: `/api/auth` (login, register, logout, verify email, forgot password, reset password)
- **Users**: `/api/users` (profile, address management)
- **Products**: `/api/products` (listing, search, details)
- **Cart**: `/api/cart` (add, remove, update)
- **Orders**: `/api/orders` (checkout, tracking)
- **Coupons**: `/api/coupons` (creation, validation, management)
- **Notifications**: `/api/notifications` (list, unread count, mark read)
- **Logs**: `/api/logs` (system activity monitoring - Superadmin only)
