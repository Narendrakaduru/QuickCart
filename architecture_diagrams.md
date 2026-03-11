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
        subgraph DB["Service Cluster"]
            MONGO[("MongoDB")]
            REDIS[("Redis")]
            ELASTIC[("Elasticsearch")]
            LOGSTASH["Logstash"]
            KIBANA["Kibana :5601"]
        end
        subgraph Q["Message Queue"]
            BULLMQ["BullMQ (Redis-backed)"]
        end
    end

    subgraph External["☁️ External Services"]
        SMTP["SMTP Email Server"]
        RAZORPAY["Razorpay API (Test Mode)"]
        CLOUDINARY["Cloudinary"]
        INSIGHT["RedisInsight :8005"]
    end

    REACT -- "HTTP Requests" --> NGINX
    NGINX -- "Reverse Proxy" --> EXPRESS
    EXPRESS -- "Mongoose ODM" --> MONGO
    EXPRESS -- "Redis Client" --> REDIS
    EXPRESS -- "Nodemailer" --> SMTP
    EXPRESS -- "Razorpay SDK" --> RAZORPAY
    EXPRESS -- "REST API" --> LOGSTASH
    EXPRESS -- "Job Producer" --> BULLMQ
    BULLMQ -- "Job Consumer" --> WORKER["Main Worker"]
    WORKER -- "Nodemailer" --> SMTP
    LOGSTASH -- "Indexing" --> ELASTIC
    ELASTIC -- "Visualize" --> KIBANA
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
        RATE["rateLimit()"]
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
        R11["/api/notifications"]
        R12["/api/payment"]
        R13["/api/analytics"]
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
        C11["notificationController"]
        C12["paymentController"]
        C13["analyticsController"]
    end

    subgraph Models["Model Layer (Mongoose)"]
        M1["User"]
        M2["Product"]
        M3["Order"]
        M4["Cart"]
        M5["Address"]
        M6["Coupon"]
        M7["Log"]
        M8["Notification"]
        M9["InventoryLock"]
    end

    subgraph "Storage & Infrastructure"
        MongoDB[("MongoDB (Products, Users, Orders)")]
        Redis[("Redis (Cache)")]
        Elasticsearch[("Elasticsearch (Search Index)")]
        Logstash["Logstash (Hybrid JSON Engine)"]
        BullMQ["BullMQ (Job Queue)"]
        Worker["Main Worker (Background Tasks)"]
    end

    subgraph "External Services"
        RedisInsight["RedisInsight (UI)"]
        Kibana["Kibana (Visualization)"]
        Mailtrap["Mailtrap (SMTP)"]
        Cloudinary["Cloudinary (Images)"]
        Razorpay["Razorpay (Payments)"]
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
    R11 --> C11
    R12 --> C12
    R13 --> C13

    C1 --> M1
    C2 --> M1
    C3 --> M2
    C4 --> M4
    C5 --> M1
    C6 --> M3
    C6 --> M8
    C6 --> M9
    C8 --> M5
    C9 --> M7
    C10 --> M6
    C11 --> M8
    C12 --> M3
    C12 --> Razorpay
    C13 --> Elasticsearch
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
    USER ||--o{ NOTIFICATION : "receives"

    PRODUCT ||--o{ ORDER_ITEM : "appears in"
    ORDER ||--|{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ CART_ITEM : "added to"
    CART ||--|{ CART_ITEM : "has"
    ORDER ||--o{ NOTIFICATION : "triggers"
    USER ||--o{ INVENTORY_LOCK : "holds"
    PRODUCT ||--o{ INVENTORY_LOCK : "locked in"

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
        number reservedCount
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
        boolean abandonedEmailSent
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

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        enum type "order_placed | order_status | order_payment | order_cancelled | abandoned_cart"
        string title
        string message
        ObjectId orderId FK
        boolean isRead
        date createdAt
    }

    INVENTORY_LOCK {
        ObjectId _id PK
        ObjectId user FK
        ObjectId product FK
        number quantity
        date expiresAt
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
        NAVBAR --> NOTIF_DD["NotificationDropdown"]
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
        APP --> NOTIF_P["Notifications"]
    end

    subgraph Modals["Modal Components"]
        ADMIN --> PM["ProductModal"]
        ADMIN --> CM["CouponModal"]
        ADMIN --> UM["UserModal"]
        ADMIN --> SA["SearchAnalytics"]
        PROF --> AM["AddressModal"]
        ADMIN --> CONFIRM["ConfirmModal"]
    end

    subgraph Store["Redux Store (11 Slices)"]
        AUTH_S["authSlice"]
        PRODUCT_S["productSlice"]
        CART_S["cartSlice"]
        WL_S["wishlistSlice"]
        ORDER_S["orderSlice"]
        USER_S["userSlice"]
        COUPON_S["couponSlice"]
        LOG_S["logSlice"]
        ADDR_S["addressSlice"]
        NOTIF_S["notificationSlice"]
        ANLY_S["analyticsSlice"]
    end

    Pages -- "dispatch / useSelector" --> Store
    Store -- "Async Thunks (fetch)" --> API["Backend API :5001"]
```

---

## 5. Authentication Flow

```mermaid
flowchart TD
    A([User opens app]) --> B{Logged in?}
    B -- Yes --> C["Load Cart, Wishlist & Unread Notifications"]
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
    M --> L1([Lock Inventory])
    L1 --> L2["POST /api/orders/lock"]
    L2 --> L3["Server: Atomic inc reservedCount"]
    L3 --> L4["Server: Create InventoryLock"]
    L4 --> L5["UI: Show Items Secured Banner"]
    L5 --> N["Place Order → POST /api/orders"]

    N --> O["Server: Create Order doc"]
    O --> P["Server: Clear Cart & Delete Lock"]
    P --> Q["Server: Dec stock & reservedCount"]
    Q --> PA["Create Notification: Order Placed"]
    PA --> R{Coupon used?}
    R -- Yes --> S["Increment coupon usedCount"]
    R -- No --> T["Skip"]
    S --> U["Return order confirmation"]
    T --> U

    U --> V([Order Confirmation shown])
    V --> W([Track Order page])
    W --> X["GET /api/orders/:id"]
    X --> Y["Show status: ordered → packed → shipped → delivered"]
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
    E3 --> E4["Notification sent to user"]

    C --> F["👥 Users Tab"]
    F --> F1["GET /api/users — list all"]
    F1 --> F2["Update role via UserModal"]
    F2 --> F3["PUT /api/users/:id"]

    C --> G["🎟️ Coupons Tab"]
    G --> G1["GET /api/coupons — list all"]
    G1 --> G2["CRUD via CouponModal"]

    C --> I["🔒 Reservations Tab"]
    I --> I1["GET /api/orders/locks"]
    I1 --> I2["Monitor active holds & expiration"]

    C --> H["📊 Logs Tab (Superadmin only)"]
    H --> H1["GET /api/logs"]
    H1 --> H2["View system activity, errors, logins"]

    C --> J["📈 Analytics Tab (Superadmin only)"]
    J --> J1["GET /api/analytics/search"]
    J1 --> J2["View search trends and zero-result queries"]
```

---

## 8. API Request Lifecycle

```mermaid
sequenceDiagram
    participant Browser
    participant Express
    participant RateLimiter
    participant AuthMiddleware
    participant Logger
    participant Controller
    participant Mongoose
    participant MongoDB

    Browser->>Express: HTTP Request + JWT
    Express->>Express: Parse JSON & Cookies (built-in middleware)
    Express->>RateLimiter: Check Tiered Limits (Redis)
    RateLimiter-->>Express: Accept (If within limits)
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
    Controller-->>Express: JSON Response
    Express-->>Browser: HTTP Response (Finish)
    Note right of Express: Start Post-Response Logging
    Express->>Logger: logRequestMetadata()
    Logger->>Logstash: Send JSON Payload (Timing, Engine, Status)
    Logstash->>Elasticsearch: Index Log Entry
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

        subgraph Cache["redis"]
            REDIS_STACK["redis-stack :6379"]
        end
    end

    DC --> FE
    DC --> BE
    DC --> DB
    DC --> Cache

    NGINX -- "proxy_pass /api" --> NODE
    NODE -- "mongoose connect" --> MONGOD
    NODE -- "redis connect" --> REDIS_STACK

    FE -- "Port 3000" --> EXT_FE["localhost:3000"]
    BE -- "Port 5001" --> EXT_BE["localhost:5001"]
    DB -- "Port 27027" --> EXT_DB["localhost:27027"]
    Cache -- "Port 8005" --> EXT_RI["localhost:8005 (RedisInsight)"]
    MONGOD -- "Volume" --> PERSIST[("./mongo_data")]
    REDIS_STACK -- "Volume" --> REDIS_P[("./redis_data")]
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
| `/notifications` | `Notifications` | ✅ | User |

---

## 11. Redux State Shape

```mermaid
graph LR
    STORE["Redux Store"] --> AUTH["auth: { user, token, loading, error }"]
    STORE --> PROD["product: { products, product, loading }"]
    STORE --> CART["cart: { items, loading }"]
    STORE --> WL["wishlist: { items, loading }"]
    STORE --> ORD["order: { orders, locks, order, loading }"]
    STORE --> USR["user: { users, loading }"]
    STORE --> CPN["coupon: { coupons, loading }"]
    STORE --> LOG["log: { logs, loading }"]
    STORE --> ADDR["address: { addresses, loading }"]
    STORE --> NOTIF["notifications: { notifications, unreadCount, loading }"]
    STORE --> ANLY["analytics: { data, loading, error }"]
```

---

## 12. Abandoned Cart Tracking Flow (BullMQ)

```mermaid
flowchart TD
    A([BullMQ Repeatable Job: Runs every 5 mins]) --> B["Check DB for Abandoned Carts"]
    B --> C{"Cart > 5 mins old & items > 0 & abandonedEmailSent == false?"}
    C -- No --> D["Ignore"]
    C -- Yes --> E["Process Cart"]
    
    E --> F["Send Email via Nodemailer"]
    E --> G["Create 'abandoned_cart' Notification"]
    E --> H["Create System Activity Log"]
    
    F --> I["Update Cart (abandonedEmailSent = true)"]
    G --> I
    H --> I
    I --> J([Job Finishes])
```

---

## 13. Razorpay Payment Workflow

```mermaid
sequenceDiagram
    participant User as 👤 User (Browser)
    participant SDK as 🛡️ Razorpay SDK
    participant FE as 🖥️ Frontend (React)
    participant BE as ⚙️ Backend (Node/Express)
    participant RP as 💳 Razorpay API

    User->>FE: Click "Confirm & Place Order"
    FE->>BE: POST /api/orders (Create Order)
    BE->>BE: Validation & Stock Check
    BE-->>FE: Return Order Doc (status: pending)
    
    FE->>BE: POST /api/payment/order (SmallPaise Amt)
    BE->>RP: instance.orders.create(options)
    RP-->>BE: Return razorpay_order_id
    BE-->>FE: Return Payment Order JSON
    
    FE->>SDK: window.Razorpay(options).open()
    SDK->>User: Show Checkout Modal
    User->>SDK: Enter OTP / Payment Details
    SDK->>RP: Authorize Transaction
    RP-->>SDK: Success Response (Signatures)
    SDK-->>FE: handler(response) callback
    
    FE->>BE: POST /api/payment/verify (Signatures + orderId)
    BE->>BE: crypto.createHmac("sha256").verify()
    BE->>BE: Update local Order (paymentStatus: completed)
    BE-->>FE: Verification Success
    FE->>User: Redirect to Success / Orders Page
```
