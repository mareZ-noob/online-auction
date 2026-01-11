# 🎯 Online Auction Platform

A comprehensive, enterprise-grade online auction platform built with modern technologies, featuring real-time bidding, payment integration, and advanced monitoring capabilities.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Monitoring \& Logging](#monitoring--logging)
- [Security](#security)
- [Contributing](#contributing)

---

## 🎯 Overview

The Online Auction Platform is a full-stack application that enables users to participate in online auctions with real-time bidding capabilities. The platform supports multiple user roles (Bidder, Seller, Admin) with comprehensive features including payment processing, user management, and detailed analytics.

### Key Highlights

- **Real-time Bidding**: Live auction updates using Server-Sent Events (SSE)
- **Multi-Role System**: Support for Bidders, Sellers, and Administrators
- **Payment Integration**: Stripe payment gateway with VND currency support
- **Enterprise Security**: OAuth2 authentication via Keycloak
- **Comprehensive Monitoring**: ELK Stack + Prometheus + Grafana
- **Scalable Architecture**: Microservices-ready with Kafka event streaming
- **Production-Ready**: Docker deployment with HTTPS support via Caddy

---

## 🏗️ Architecture

The platform follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────┐
│                  Frontend Layer                      │
│  ┌──────────────────┐    ┌──────────────────┐      │
│  │  User Frontend   │    │  Admin Frontend  │      │
│  │   (Port 5173)    │    │   (Port 5174)    │      │
│  └──────────────────┘    └──────────────────┘      │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│              Reverse Proxy (Caddy)                   │
│                HTTPS (Port 8443)                     │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│              Backend Layer (Spring Boot)             │
│                  Port 8088                           │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│                Data & Services Layer                 │
│  ┌──────────┐ ┌──────┐ ┌──────┐ ┌────────┐         │
│  │PostgreSQL│ │Redis │ │Kafka │ │Keycloak│         │
│  └──────────┘ └──────┘ └──────┘ └────────┘         │
│  ┌──────┐ ┌──────────┐                              │
│  │MinIO │ │ MailHog  │                              │
│  └──────┘ └──────────┘                              │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│           Monitoring & Logging Layer                 │
│  ┌────────────┐ ┌──────────┐ ┌─────────┐           │
│  │Elasticsearch││Prometheus││ Grafana │           │
│  │  Logstash  │ │          │ │         │           │
│  │   Kibana   │ │          │ │         │           │
│  └────────────┘ └──────────┘ └─────────┘           │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend

- **Framework**: Spring Boot 3.5.7
- **Language**: Java 21
- **Build Tool**: Maven
- **ORM**: Hibernate/JPA
- **Database**: PostgreSQL 15
- **Cache**: Redis 8
- **Message Broker**: Apache Kafka 4.1.0
- **Scheduler**: Quartz
- **Authentication**: OAuth2 + JWT
- **Identity Provider**: Keycloak 26.0
- **Email**: JavaMail + MailHog (dev)
- **File Storage**: MinIO / Local Storage
- **Payment Gateway**: Stripe API
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Validation**: Hibernate Validator
- **Security**: Spring Security 6

### Frontend (User)

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **UI Library**: Radix UI
- **Styling**: Tailwind CSS 4.1.17
- **State Management**: Zustand 5.0.8
- **Data Fetching**: TanStack Query 5.90.11
- **Routing**: React Router DOM 7.9.6
- **Form Handling**: React Hook Form 7.66.1 + Zod 4.1.13
- **Rich Text Editor**: TipTap 3.13.0
- **Internationalization**: i18next 25.7.3
- **Animations**: Framer Motion 12.23.26
- **HTTP Client**: Axios 1.13.2
- **Code Quality**: Biome 2.3.6

### Frontend (Admin)

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **UI Library**: Radix UI
- **Styling**: Tailwind CSS 4.1.17
- **Charts**: Recharts 2.15.4
- **State Management**: Zustand 5.0.8
- **Data Fetching**: TanStack Query 5.90.11
- **Code Quality**: Biome 2.3.6

### DevOps & Infrastructure

- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Caddy 2
- **Monitoring**: Prometheus 2.48.1 + Grafana 10.2.3
- **Logging**: ELK Stack (Elasticsearch 8.11.3, Logstash 8.11.3, Kibana 8.11.3)
- **Metrics Exporters**:
  - Node Exporter 1.7.0
  - PostgreSQL Exporter 0.15.0
  - Redis Exporter 1.55.0
  - Kafka Exporter 1.7.0
- **Object Storage**: MinIO (S3-compatible)

### Supporting Libraries & Tools

- **JWT**: jjwt 0.13.0
- **Logging**: Logstash Logback Encoder 8.1
- **Utilities**: Apache Commons IO, Commons Validator
- **Security**: Bouncy Castle (bcprov-jdk15on)
- **HTTP Client**: OkHttp 4.12.0
- **Code Formatting**: Spotless Maven Plugin 3.1.0
- **Recaptcha**: Google reCAPTCHA

---

## ✨ Features

### 🎯 Advanced Auction System

#### Intelligent Auto-Bidding Algorithm

- **Reactive Auto-Bid System**: Automatically counter-bids against competitors within predefined limits
- **Smart Price Calculation**: Winner determined by highest max bid + loser's max + step price logic
- **Zombie Bid Prevention**: Filters and uses only the latest auto-bid per user
- **Conflict Resolution**: Timestamp-based winner selection when max bids are equal
- **Buy Now Option**: Instant purchase at set price with immediate auction closure

#### Dynamic Auto-Extend Feature

- **Configurable Thresholds**: Admin-controlled extend threshold (default: 5 minutes before end)
- **Flexible Duration**: Configurable extension period (default: 10 minutes)
- **Quartz-Based Scheduling**: Reliable distributed job scheduling with cluster support
- **Automatic Rescheduling**: Job rescheduling on each qualifying bid
- **Persistent Jobs**: Survives server restarts with database-backed job storage

#### Seller Controls

- **Bidder Blocking System**: Block problematic bidders from specific auctions
- **Automatic Reranking**: Instantly reassigns highest bidder when current leader is blocked
- **Rating-Based Access Control**: Optional restriction requiring 80%+ positive rating to bid
- **Question Management**: Answer bidder inquiries with notification system

### 🔴 Real-Time Communication (SSE)

#### Multi-Channel Server-Sent Events

- **User Notification Stream**: Personal notifications for outbids, auction ends, wins
- **Product Bid Stream**: Live bid updates for all product watchers with leaderboard
- **Chat Stream**: Real-time messaging between buyer and seller post-auction
- **Heartbeat Mechanism**: 30-second keep-alive pings to maintain connections
- **Concurrent Connection Management**: Thread-safe `ConcurrentHashMap` with `CopyOnWriteArrayList`
- **Automatic Cleanup**: Connection removal on timeout, error, or completion
- **Masked User Privacy**: Bidder names masked in public streams

### 🔒 Advanced Security & Authentication

#### Multi-Provider OAuth2 Integration

- **Keycloak Identity Provider**: Centralized authentication with OpenID Connect
- **Social Login**: Google, Facebook integration via Keycloak
- **Dual Registration Clients**: Separate clients for user and admin frontends
- **Session Management**: Automatic Keycloak session clearing on access denial

#### JWT Token Management

- **Access Token**: 15-minute expiry with automatic refresh
- **Refresh Token**: 7-day validity with secure rotation
- **Token Blacklist**: Logout immediately invalidates tokens
- **Role-Based Access Control (RBAC)**: USER, SELLER, ADMIN roles
- **Protected Routes**: Frontend and backend route protection

#### Security Features

- **OTP Email Verification**: 5-minute expiring one-time passwords
- **Google reCAPTCHA v2**: Bot protection on registration and login
- **Password Reset Flow**: Secure token-based password recovery
- **BCrypt Hashing**: Industry-standard password encryption
- **CORS Configuration**: Configured allowed origins
- **SQL Injection Protection**: JPA parameterized queries
- **XSS Protection**: Input sanitization and output encoding

### 📊 Enterprise-Grade Monitoring & Observability

#### Comprehensive Audit Logging

- **AOP-Based Tracking**: Automatic logging via AspectJ
- **Service Execution Logs**: Method-level performance tracking with execution time
- **Controller Audit**: All API requests logged with user context
- **Exception Tracking**: Full stack traces sent to Kafka
- **Distributed Tracing**: UUID trace IDs across service calls
- **Kafka Event Streaming**: Audit logs published to `audit-log` topic
- **User Context**: User ID and email captured in every log

#### Prometheus Metrics Exposure

- **JVM Metrics**: Heap, non-heap memory, GC stats, thread counts
- **HTTP Server Metrics**: Request rates, latencies, status codes
- **Custom Business Metrics**: Auction events, bid counts, transaction volumes
- **Database Connection Pool**: Active connections, wait times
- **Kafka Producer/Consumer**: Throughput, lag, error rates
- **Redis Cache Metrics**: Hit/miss ratios, eviction counts

#### Pre-Configured Grafana Dashboards

- **JVM Performance Dashboard**: Memory usage, GC activity, CPU
- **System Resources**: Node exporter metrics (disk, CPU, network)
- **PostgreSQL Dashboard**: Query performance, connection stats
- **Redis Dashboard**: Cache performance, memory usage
- **Kafka Dashboard**: Topic metrics, consumer lag

#### ELK Stack Integration

- **Logstash Pipeline**: Structured JSON logs from backend
- **Elasticsearch Storage**: Centralized log repository
- **Kibana Visualization**: Log searching and analysis with `auction*` index pattern
- **Log Levels**: INFO, DEBUG, ERROR with configurable thresholds
- **Structured Logging**: JSON format with correlation IDs

### 💳 Payment & Transaction System

#### Stripe Integration

- **VND Currency Support**: Vietnamese Dong as default currency
- **Secure Payment Processing**: PCI-compliant via Stripe
- **Transaction Records**: Complete payment history
- **Seller Payouts**: Revenue tracking and payout management
- **Payment Receipts**: Automatic receipt generation
- **Subscription Ready**: Infrastructure supports recurring payments

#### Transaction Management

- **Automatic Creation**: Transaction created on auction win
- **Status Tracking**: PENDING, COMPLETED, FAILED, REFUNDED states
- **Email Notifications**: Winner and seller notified on transaction events
- **Chat Channel**: Post-auction communication between parties

### 📧 Comprehensive Email Notification System

#### Automated Email Triggers

- **Bid Notifications**: Seller notified on each bid
- **Outbid Alerts**: Previous highest bidder notified when outbid
- **Auction End Notifications**: All participants notified with results
- **Winner Confirmation**: Detailed winning notification with amount
- **Seller Sale Alert**: Notification when product sells
- **Bidder Blocked Notice**: Email when seller blocks a bidder
- **Password Reset**: Secure password recovery emails
- **OTP Delivery**: Account verification codes
- **Template-Based**: Thymeleaf HTML email templates

### ⏰ Advanced Job Scheduling (Quartz)

#### Distributed Scheduler Features

- **Clustered Jobs**: Multi-instance coordination via PostgreSQL
- **Automatic Failover**: Jobs picked up by available instances
- **Persistent Storage**: Job details stored in database
- **Misfire Handling**: Configurable strategies for missed executions
- **Dynamic Scheduling**: Jobs created/updated at runtime

#### Scheduled Jobs

- **Auction Close Jobs**: Automatically close auctions at end time
- **Token Cleanup**: Daily cleanup of expired tokens (configurable cron)
- **SSE Heartbeat**: 30-second keep-alive pings
- **Job Rescheduling**: Update end times on auto-extend

### 🗂️ Product Management

#### Rich Product Features

- **Multiple Images**: Upload and manage product galleries
- **Rich Text Descriptions**: TipTap WYSIWYG editor with formatting
- **Description History**: Track all description changes with timestamps
- **Category System**: Hierarchical category organization
- **Product Status**: DRAFT, ACTIVE, COMPLETED, CANCELLED states
- **New Product Highlight**: Auto-highlight products added within last 60 minutes

#### Search & Discovery

- **Advanced Filtering**: By category, price range, status, seller
- **Sorting Options**: Price, end time, bid count, newest
- **Pagination**: Efficient large dataset handling
- **Full-Text Search**: Product name and description search
- **Watchlist**: Save favorite products for quick access

### 👥 User Management

#### User Features

- **Profile Management**: Update personal information
- **Social Account Linking**: Connect Google, Facebook accounts
- **Rating System**: Bidder and seller ratings with percentage calculation
- **Upgrade Requests**: Request seller privileges (admin approval)
- **Activity History**: Complete bidding and selling history

#### Admin Capabilities

- **User Search & Filter**: Find users by email, name, role, status
- **Account Activation Control**: Enable/disable user accounts
- **Password Reset**: Admin-initiated password reset with email
- **Role Management**: Approve seller upgrade requests
- **User Activity Tracking**: View user auction participation
- **Keycloak Integration**: Sync activate/deactivate to Keycloak

### 🎨 Advanced Frontend Features

#### User Experience

- **Dark Mode**: Theme switching with persistent preference
- **Internationalization (i18n)**: Multi-language support (English, Vietnamese)
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Loading States**: Skeleton screens and suspense boundaries
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: Real-time feedback via Sonner
- **Form Validation**: Zod schema validation with React Hook Form
- **Lazy Loading**: Code splitting for optimal performance

#### State Management

- **Zustand Stores**: Lightweight state management
- **TanStack Query**: Server state with caching, refetching
- **Optimistic Updates**: Instant UI feedback
- **Persistent State**: LocalStorage integration

### 🔧 Developer Experience

#### Code Quality

- **Spotless Formatting**: Automatic Java code formatting (Palantir style)
- **Biome Linting**: Fast JavaScript/TypeScript linting and formatting
- **TypeScript**: Full type safety in frontend
- **Lombok**: Reduced boilerplate in Java
- **Builder Pattern**: Fluent object creation

#### Development Tools

- **Hot Reload**: Instant feedback during development
- **Docker Compose**: One-command environment setup
- **Environment Configs**: Separate dev, prod configurations
- **API Documentation**: Interactive Swagger UI
- **Health Checks**: All services have health endpoints
- **MailHog**: Email testing in development

### 🚀 Performance & Scalability

#### Optimization Techniques

- **Virtual Threads (Java 21)**: Lightweight concurrency
- **Redis Caching**: Fast data access for frequently used data
- **Connection Pooling**: Efficient database connections
- **Async Processing**: Non-blocking Kafka event handling
- **CDN-Ready**: Static assets can be served from CDN
- **Database Indexing**: Optimized query performance

#### Scalability Features

- **Stateless Backend**: Horizontal scaling ready
- **Kafka Event Streaming**: Decoupled async communication
- **Clustered Quartz**: Distributed job execution
- **Load Balancer Ready**: Caddy reverse proxy
- **Database Replication**: Support for read replicas
- **MinIO Distributed**: Scalable S3-compatible storage

---

## 📁 Project Structure

The project is organized into several main components:

### Backend (`/backend`)

Spring Boot application containing:

- **Controllers**: REST API endpoints for Admin, Auth, Bidder, Chat, File Upload, Notification, Payment, Public, Seller, Transaction, and User management
- **Models**: JPA entities including Bid, BlockedBidder, Category, ChatMessage, Otp, Product, Question, Rating, RefreshToken, SocialAccount, SystemConfig, TokenBlacklist, Transaction, UpgradeRequest, User, WatchList
- **Services**: Business logic for auction, bidding, payments, authentication, file storage, email, notifications, and scheduled tasks
- **Security**: OAuth2 configuration, JWT handling, role-based access control
- **Configuration**: Application settings, database, Redis, Kafka, Keycloak integration

### Frontend User (`/frontend`)

React/TypeScript application for end users with:

- Authentication pages (Sign in/up, OAuth2, OTP, Password reset)
- Dashboard and product browsing
- Bidding interface with real-time updates
- Product publishing (for sellers)
- Payment processing
- User profile and watchlist management
- Rich text editor for product descriptions

### Frontend Admin (`/frontend-admin`)

React/TypeScript admin dashboard featuring:

- Reports and analytics with charts
- Category management (create, edit, delete)
- Product management and auction settings
- User management (list, activate/deactivate, password reset)
- Seller upgrade request approval

### Infrastructure

- **`/deploy`**: Deployment configurations including Caddy reverse proxy, Keycloak realms, and logging setup
- **`/monitoring`**: Prometheus, Grafana, and ELK stack configurations with pre-built dashboards
- **`/keycloak`**: Identity provider realm configuration
- **`/quartz`**: Scheduler database schema
- **Docker Compose files**: Local, dev, prod, and monitoring environment setups
- **Environment files**: `.env.dev` and `.env.prod` for configuration management

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

### Required

- **Docker**: 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.0+ ([Install Docker Compose](https://docs.docker.com/compose/install/))

### For Local Development (without Docker)

- **Java**: JDK 21 ([Download](https://adoptium.net/))
- **Maven**: 3.8+ ([Download](https://maven.apache.org/download.cgi))
- **Node.js**: 20+ ([Download](https://nodejs.org/))
- **pnpm**: 9+ (Install via `npm install -g pnpm`)
- **PostgreSQL**: 15+ ([Download](https://www.postgresql.org/download/))
- **Redis**: 8+ ([Download](https://redis.io/download))

### Recommended

- **Git**: For version control
- **IDE**: IntelliJ IDEA (backend) / VS Code (frontend)

---

## 🚀 Getting Started

### Option 1: Local Development (Direct Access)

This setup runs services in Docker while allowing direct access to the backend and frontends.

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/online-auction.git
cd online-auction
```

#### 2. Start Infrastructure Services

```bash
docker-compose up -d
```

This starts:

- PostgreSQL (5432)
- Redis (6379)
- Keycloak (8180)
- Kafka (9092)
- MinIO (9000, 9001)
- MailHog (1025, 8025)

#### 3. Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend will be available at: <http://localhost:8088>

#### 4. Run User Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend will be available at: <http://localhost:5173>

#### 5. Run Admin Frontend

```bash
cd frontend-admin
pnpm install
pnpm dev
```

Admin frontend will be available at: <http://localhost:5174>

### Option 2: Development Environment (with HTTPS)

Full containerized environment with Caddy reverse proxy and HTTPS.

#### 1. Start the Development Environment

```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### 2. Access the Application

- **User Frontend**: <https://localhost:8443>
- **Admin Frontend**: <https://localhost:8443/admin>
- **Backend API**: <https://localhost:8443/api>
- **Keycloak**: <https://localhost:8443/keycloak>
- **Swagger UI**: <https://localhost:8443/api/swagger-ui.html>

### Option 3: Production Environment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoring Stack (Optional)

To enable monitoring and logging:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Access monitoring services:

- **Prometheus**: <http://localhost:9090>
- **Grafana**: <http://localhost:3000> (admin/admin)
- **Kibana**: <http://localhost:5601>
- **Elasticsearch**: <http://localhost:9200> (elastic/changeme)

---

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for configuration. See `.env.dev` and `.env.prod` for all available options.

#### Key Configuration Variables

**Database**

```env
POSTGRES_URL=jdbc:postgresql://localhost:5432/auction_db
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
```

**Redis**

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Kafka**

```env
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

**Keycloak**

```env
KEYCLOAK_ISSUER_URI=http://localhost:8180/keycloak/realms/auction-realm
```

**MinIO**

```env
MINIO_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

**Stripe**

```env
STRIPE_API_KEY=your_stripe_api_key
STRIPE_CURRENCY=vnd
```

**JWT**

```env
JWT_SECRET=your-secret-key-change-this-in-production-min-256-bits
```

**Mail**

```env
MAIL_HOST=localhost
MAIL_PORT=1025
```

**reCAPTCHA**

```env
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Database Initialization

The application uses **code-first approach** with Hibernate:

- Database schema is automatically created/updated on application startup
- Quartz tables are initialized via SQL script (`quartz/quartz-schema.sql`)
- No manual database setup required

### Ports Reference

| Service | Local | Dev (Docker) | Prod (Docker) |
|---------|-------|--------------|---------------|
| Backend | 8088 | 8088 (internal) | 8088 (internal) |
| User Frontend | 5173 | <https://8443> | <https://443> |
| Admin Frontend | 5174 | <https://8443/admin> | <https://443/admin> |
| PostgreSQL | 5432 | 5432 | 5432 (internal) |
| Redis | 6379 | 6379 | 6379 (internal) |
| Keycloak | 8180 | <https://8443/keycloak> | <https://443/keycloak> |
| Kafka | 9092 | 9092 | 9092 (internal) |
| MinIO | 9000, 9001 | 9000, 9001 | 9000 (internal) |
| MailHog | 1025, 8025 | 1025, 8025 | - |
| Kafka UI | - | 8081 | - |

---

## 📚 API Documentation

### Swagger UI

Access interactive API documentation at:

- **Local**: <http://localhost:8088/swagger-ui.html>
- **Dev**: <https://localhost:8443/api/swagger-ui.html>

### OpenAPI Spec

- **Local**: <http://localhost:8088/api-docs>
- **Dev**: <https://localhost:8443/api/api-docs>

### Main API Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### Products

- `GET /api/public/products` - List products (with filters)
- `GET /api/public/products/{id}` - Get product details
- `POST /api/seller/products` - Create new product (seller)
- `PUT /api/seller/products/{id}` - Update product (seller)
- `DELETE /api/seller/products/{id}` - Delete product (seller)

#### Bidding

- `POST /api/bidder/bids` - Place a bid
- `GET /api/bidder/bids/history/{productId}` - Get bid history
- `GET /api/bidder/products/bidding` - Get products user is bidding on

#### Watchlist

- `POST /api/user/watchlist` - Add to watchlist
- `DELETE /api/user/watchlist/{productId}` - Remove from watchlist
- `GET /api/user/watchlist` - Get watchlist

#### Admin

- `GET /api/admin/users` - List users
- `PUT /api/admin/users/{id}/activate` - Activate/deactivate user
- `POST /api/admin/users/{id}/reset-password` - Reset user password
- `GET /api/admin/categories` - Manage categories
- `GET /api/admin/upgrade-requests` - List upgrade requests

#### Notifications (SSE)

- `GET /sse/notifications` - Subscribe to notifications stream

---

## 📊 Monitoring & Logging

### Prometheus Metrics

The backend exposes metrics at `/actuator/prometheus`. Available metrics include:

- **JVM Metrics**: Memory, GC, threads
- **HTTP Metrics**: Request count, duration, errors
- **Database Metrics**: Connection pool, query performance
- **Kafka Metrics**: Producer/consumer metrics
- **Custom Business Metrics**: Auction events, bids, transactions

### Grafana Dashboards

Pre-configured dashboards located in `monitoring/grafana/provisioning/dashboards/`:

- **JVM Dashboard**: Java application metrics
- **System Dashboard**: Node exporter metrics
- **PostgreSQL Dashboard**: Database performance
- **Redis Dashboard**: Cache performance
- **Kafka Dashboard**: Message queue metrics

### ELK Stack

**Logstash** collects logs from the backend and forwards them to **Elasticsearch**. View logs in **Kibana**:

1. Access Kibana: <http://localhost:5601>
2. Create index pattern: `auction*`
3. View logs in Discover tab

Logs include:

- Application logs (INFO, DEBUG, ERROR)
- Audit logs (user actions via Kafka)
- Exception logs
- Access logs

### Health Checks

- **Backend**: <http://localhost:8088/actuator/health>
- **Database**: Included in health endpoint
- **Redis**: Included in health endpoint
- **Services**: Each Docker service has health checks configured

---

## 🔒 Security

### Authentication Flow

1. User logs in via Keycloak (OAuth2) or local credentials
2. Backend issues JWT access token (15 min expiry) and refresh token (7 days)
3. Frontend stores tokens securely
4. Access token sent in Authorization header for protected endpoints
5. Refresh token used to obtain new access token when expired

### Authorization

- **Role-Based Access Control (RBAC)**
  - `USER`: Basic user permissions
  - `SELLER`: Can publish and manage products
  - `ADMIN`: Full system access
- **Protected Routes**: Frontend routes protected based on user role
- **API Security**: Endpoints secured with Spring Security

### Security Features

- ✅ JWT token blacklist for logout
- ✅ OAuth2 with Keycloak
- ✅ Password hashing (BCrypt)
- ✅ reCAPTCHA bot protection
- ✅ OTP verification for email
- ✅ HTTPS in production (Caddy)
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ SQL injection protection (JPA)
- ✅ XSS protection

### Admin User

Keycloak admin console:

- **URL**: <http://localhost:8180/keycloak/admin>
- **Username**: admin
- **Password**: admin

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style

- **Backend**: Follow Google Java Style Guide (enforced by Spotless)
- **Frontend**: Use Biome for linting and formatting
  - Run `pnpm check:fix` before committing

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve code coverage

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Spring Boot Team for the excellent framework
- React Team for the UI library
- Keycloak for authentication
- All open-source contributors

---

**Made with ❤️ by the Online Auction Team**
