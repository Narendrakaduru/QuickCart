# QuickCart — Architecture Diagrams & Flowcharts

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Browser"]
        REACT["React App (Vite)"]
    end

    subgraph Docker["🐳 Docker Compose Stack"]
        subgraph FE["Frontend Container :3000"]
            NGINX["Nginx"]
        end
        subgraph BE["Backend Container :5001"]
            EXPRESS["Express.js API"]
        end
        subgraph DB["MongoDB Container :27027"]
            MONGO[("MongoDB")]
        end
    end

    subgraph External["☁️ External Services"]
        SMTP["SMTP Email Server"]
    end

    REACT -- "HTTP Requests" --> NGINX
    NGINX -- "Reverse Proxy" --> EXPRESS
    EXPRESS -- "Mongoose ODM" --> MONGO
    EXPRESS -- "Nodemailer" --> SMTP
    MONGO -- "Persisted Volume" --> DISK[("mongo_data/")]
```

---

## 2. Backend Architecture (Express API)

```mermaid
graph LR
    subgraph Middleware["Middleware Layer"]
        JSON["express.json()"]
        COOKIE["cookieParser()"]
        CORS["cors()"]
        AUTH["protect()"]
        ROLE["authorize()"]
        LOGGER["logger()"]
    end

    subgraph Routes["Route Layer"]
        R1["/api/auth"]
        R2["/api/users"]
        R3["/api/products"]
        R4["/api/cart"]
        R5["/api/wishlist"]
        R6["/api/orders"]
        R7["/api/upload"]
        R8["/api/addresses"]
        R9["/api/logs"]
        R10["/api/coupons"]
    end

    subgraph Controllers["Controller Layer"]
        C1["authController"]
        C2["userController"]
        C3["productController"]
        C4["cartController"]
        C5["wishlistController"]
        C6["orderController"]
        C7["uploadRoutes"]
        C8["addressController"]
        C9["logController"]
        C10["couponController"]
    end

    subgraph Models["Model Layer (Mongoose)"]
        M1["User"]
        M2["Product"]
        M3["Order"]
        M4["Cart"]
        M5["Address"]
        M6["Coupon"]
        M7["Log"]
    end

    R1 --> C1
    R2 --> C2
    R3 --> C3
    R4 --> C4
    R5 --> C5
    R6 --> C6
    R7 --> C7
    R8 --> C8
    R9 --> C9
    R10 --> C10

    C1 --> M1
    C2 --> M1
    C3 --> M2
    C4 --> M4
    C5 --> M1
    C6 --> M3
    C8 --> M5
    C9 --> M7
    C10 --> M6
```

---

## 3. Database Schema (Entity Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    USER ||--o| CART : "owns"
    USER ||--o{ ADDRESS : "has"
    USER ||--o{ PRODUCT : "wishlists"
    USER ||--o{ PRODUCT : "creates (admin)"
    USER ||--o{ COUPON : "creates (admin)"
    USER ||--o{ PRODUCT : "reviews"

    PRODUCT ||--o{ ORDER_ITEM : "appears in"
    ORDER ||--|{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ CART_ITEM : "added to"
    CART ||--|{ CART_ITEM : "has"

    COUPON ||--o{ ORDER : "applied to"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        enum role "user | admin | superadmin"
        boolean isVerified
        string verificationToken
        string resetPasswordToken
        date resetPasswordExpires
        ObjectId[] wishlist FK
        date createdAt
    }

    PRODUCT {
        ObjectId _id PK
        ObjectId user FK
        string title
        string brand
        string description
        string[] highlights
        json[] specifications
        number price
        number discountPercentage
        string[] images
        string category
        number stockCount
        boolean isFeatured
        boolean isActive
        json[] reviews
        number rating
        number numReviews
        date createdAt
    }

    ORDER {
        ObjectId _id PK
        ObjectId user FK
        json[] items
        json shippingDetails
        enum paymentStatus "pending | completed | failed"
        enum orderStatus "ordered | packed | shipped | delivered | cancelled"
        number totalAmount
        number discountAmount
        string couponCode
        date createdAt
        date updatedAt
    }

    CART {
        ObjectId _id PK
        ObjectId user FK
        json[] items
        date createdAt
        date updatedAt
    }

    ADDRESS {
        ObjectId _id PK
        ObjectId user FK
        enum addressType "Home | Office | Other"
        string fullName
        string street
        string city
        string state
        string zip
        string country
        string phone
        boolean isDefault
        date createdAt
    }

    COUPON {
        ObjectId _id PK
        string code UK
        enum discountType "percentage | fixed"
        number discountValue
        number minPurchase
        date expiryDate
        number usageLimit
        number usedCount
        boolean isActive
        ObjectId createdBy FK
        date createdAt
        date updatedAt
    }

    LOG {
        ObjectId _id PK
        string level
        string message
        json meta
        date timestamp
    }
```

---

## 4. Frontend Architecture (React + Redux)

```mermaid
graph TB
    subgraph Entry["App Entry"]
        MAIN["main.jsx"] --> PROVIDER["Redux Provider"]
        PROVIDER --> APP["App.jsx (Router)"]
    end

    subgraph Layout["Layout Components"]
        APP --> NAVBAR["Navbar"]
        APP --> MEGA["MegaMenu"]
        APP --> FOOTER["Footer"]
        APP --> SCROLL["ScrollToTop"]
    end

    subgraph Pages["Page Components"]
        APP --> HOME["Home"]
        APP --> PL["ProductList"]
        APP --> PD["ProductDetail"]
        APP --> CART_P["Cart"]
        APP --> WL["Wishlist"]
        APP --> CO["Checkout"]
        APP --> ORD["Orders"]
        APP --> TRACK["TrackOrder"]
        APP --> PROF["Profile"]
        APP --> ADMIN["AdminDashboard"]
        APP --> LOGIN["Login"]
        APP --> REG["Register"]
        APP --> FP["ForgotPassword"]
        APP --> RP["ResetPassword"]
        APP --> VE["VerifyEmail"]
    end

    subgraph Modals["Modal Components"]
        ADMIN --> PM["ProductModal"]
        ADMIN --> CM["CouponModal"]
        ADMIN --> UM["UserModal"]
        PROF --> AM["AddressModal"]
        ADMIN --> CONFIRM["ConfirmModal"]
    end

    subgraph Store["Redux Store (9 Slices)"]
        AUTH_S["authSlice"]
        PRODUCT_S["productSlice"]
        CART_S["cartSlice"]
        WL_S["wishlistSlice"]
        ORDER_S["orderSlice"]
        USER_S["userSlice"]
        COUPON_S["couponSlice"]
        LOG_S["logSlice"]
        ADDR_S["addressSlice"]
    end

    Pages -- "dispatch / useSelector" --> Store
    Store -- "Async Thunks (fetch)" --> API["Backend API :5001"]
```

---

## 5. Authentication Flow

```mermaid
flowchart TD
    A([User opens app]) --> B{Logged in?}
    B -- Yes --> C[Load Cart & Wishlist]
    C --> D([Browse App])
    B -- No --> E[Show Login / Register]

    E --> F{Action?}
    F -- Register --> G["POST /api/auth/register"]
    G --> H["Hash password & save User"]
    H --> I["Send verification email"]
    I --> J([User clicks email link])
    J --> K["GET /api/auth/verify-email/:token"]
    K --> L["Set isVerified = true"]
    L --> M([Redirect to Login])

    F -- Login --> N["POST /api/auth/login"]
    N --> O{isVerified?}
    O -- No --> P["❌ Return error: verify email first"]
    O -- Yes --> Q["Validate password"]
    Q --> R{Password valid?}
    R -- No --> S["❌ Invalid credentials"]
    R -- Yes --> T["Generate JWT"]
    T --> U["Store token in Redux + localStorage"]
    U --> C

    F -- Forgot Password --> V["POST /api/auth/forgot-password"]
    V --> W["Generate resetToken & expiry"]
    W --> X["Send reset email"]
    X --> Y([User clicks reset link])
    Y --> Z["PUT /api/auth/reset-password/:token"]
    Z --> AA["Update password, clear token"]
    AA --> M
```

---

## 6. Order / Checkout Flow

```mermaid
flowchart TD
    A([User browses products]) --> B["Add to Cart"]
    B --> C["POST /api/cart"]
    C --> D["Cart updated in DB & Redux"]
    D --> E([Go to Cart page])
    E --> F{Apply Coupon?}

    F -- Yes --> G["POST /api/coupons/validate"]
    G --> H{Valid?}
    H -- No --> I["❌ Show error"]
    H -- Yes --> J["Recalculate discount"]
    F -- No --> K["Proceed to Checkout"]
    J --> K

    K --> L["Select / Enter shipping address"]
    L --> M["Review order summary"]
    M --> N["Place Order → POST /api/orders"]

    N --> O["Server: Create Order doc"]
    O --> P["Server: Clear Cart"]
    P --> Q{Coupon used?}
    Q -- Yes --> R["Increment coupon usedCount"]
    Q -- No --> S["Skip"]
    R --> T["Return order confirmation"]
    S --> T

    T --> U([Order Confirmation shown])
    U --> V([Track Order page])
    V --> W["GET /api/orders/:id"]
    W --> X["Show status: ordered → packed → shipped → delivered"]
```

---

## 7. Admin Management Flow

```mermaid
flowchart TD
    A([Admin/Superadmin logs in]) --> B["AdminDashboard.jsx"]
    B --> C{Select Tab}

    C --> D["📦 Products Tab"]
    D --> D1["GET /api/products — list all"]
    D1 --> D2["CRUD via ProductModal"]
    D2 --> D3["Upload images via /api/upload"]

    C --> E["📋 Orders Tab"]
    E --> E1["GET /api/orders/all — admin"]
    E1 --> E2["Update order status"]
    E2 --> E3["PUT /api/orders/:id/status"]

    C --> F["👥 Users Tab"]
    F --> F1["GET /api/users — list all"]
    F1 --> F2["Update role via UserModal"]
    F2 --> F3["PUT /api/users/:id"]

    C --> G["🎟️ Coupons Tab"]
    G --> G1["GET /api/coupons — list all"]
    G1 --> G2["CRUD via CouponModal"]

    C --> H["📊 Logs Tab (Superadmin only)"]
    H --> H1["GET /api/logs"]
    H1 --> H2["View system activity, errors, logins"]
```

---

## 8. API Request Lifecycle

```mermaid
sequenceDiagram
    participant Browser
    participant Express
    participant AuthMiddleware
    participant Logger
    participant Controller
    participant Mongoose
    participant MongoDB

    Browser->>Express: HTTP Request + JWT
    Express->>Express: Parse JSON & Cookies (built-in middleware)
    Express->>AuthMiddleware: protect()
    AuthMiddleware->>AuthMiddleware: Verify JWT
    AuthMiddleware->>Mongoose: User.findById(decoded.id)
    Mongoose->>MongoDB: Query user
    MongoDB-->>Mongoose: User document
    Mongoose-->>AuthMiddleware: req.user set
    AuthMiddleware->>Logger: logAction()
    Logger->>Mongoose: Log.create(meta)
    Mongoose->>MongoDB: Insert log
    AuthMiddleware->>Controller: next()
    Controller->>Mongoose: Model operation
    Mongoose->>MongoDB: DB query
    MongoDB-->>Mongoose: Result
    Mongoose-->>Controller: Data
    Controller-->>Browser: JSON Response
```

---

## 9. Deployment Architecture (Docker Compose)

```mermaid
graph TB
    subgraph Host["Host Machine"]
        DC["docker-compose.yml"]
    end

    subgraph Network["Docker Bridge Network"]
        subgraph FE["frontend"]
            NGINX["Nginx :80"]
            REACT_BUILD["React Prod Build (dist/)"]
        end

        subgraph BE["backend"]
            NODE["Node.js :5001"]
            UPLOADS["uploads/ volume"]
        end

        subgraph DB["mongodb"]
            MONGOD["mongod :27017"]
        end
    end

    DC --> FE
    DC --> BE
    DC --> DB

    NGINX -- "proxy_pass /api" --> NODE
    NODE -- "mongoose connect" --> MONGOD

    FE -- "Port 3000" --> EXT_FE["localhost:3000"]
    BE -- "Port 5001" --> EXT_BE["localhost:5001"]
    DB -- "Port 27027" --> EXT_DB["localhost:27027"]
    MONGOD -- "Volume" --> PERSIST[("./mongo_data")]
```

---

## 10. Frontend Route Map

| Route | Page Component | Auth Required | Role |
|---|---|---|---|
| `/` | `Home` | ❌ | Any |
| `/products` | `ProductList` | ❌ | Any |
| `/product/:id` | `ProductDetail` | ❌ | Any |
| `/cart` | `Cart` | ✅ | User |
| `/wishlist` | `Wishlist` | ✅ | User |
| `/checkout` | `Checkout` | ✅ | User |
| `/orders` | `Orders` | ✅ | User |
| `/order/:id/track` | `TrackOrder` | ✅ | User |
| `/profile` | `Profile` | ✅ | User |
| `/admin` | `AdminDashboard` | ✅ | Admin / Superadmin |
| `/login` | `Login` | ❌ | Any |
| `/register` | `Register` | ❌ | Any |
| `/forgot-password` | `ForgotPassword` | ❌ | Any |
| `/reset-password/:token` | `ResetPassword` | ❌ | Any |
| `/verify-email/:token` | `VerifyEmail` | ❌ | Any |

---

## 11. Redux State Shape

```mermaid
graph LR
    STORE["Redux Store"] --> AUTH["auth: { user, token, loading, error }"]
    STORE --> PROD["product: { products, product, loading }"]
    STORE --> CART["cart: { items, loading }"]
    STORE --> WL["wishlist: { items, loading }"]
    STORE --> ORD["order: { orders, order, loading }"]
    STORE --> USR["user: { users, loading }"]
    STORE --> CPN["coupon: { coupons, loading }"]
    STORE --> LOG["log: { logs, loading }"]
    STORE --> ADDR["address: { addresses, loading }"]
```
