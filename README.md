# How to run frontend

1. cd frontend
2. pnpm install
3. pnpm dev

# Tech Stack used in frontend

1. ShadCN
2. TailwindCSS
3. React
4. TypeScript
5. Vite

# Project Overview

This project is built with **React 19**, **TypeScript**, and **Vite**, and is structured into two separate applications:

- **Frontend** – Customer-facing web application
- **Frontend-admin** – Administration panel for system management

---

## Architecture & Routing

- Routing implemented using **react-router-dom v7** with `RouterProvider`
- **App shell architecture** with shared layouts
- **Feature-based routing** structure
- **Protected routes** enforced based on:
  - Authentication state
  - User roles

---

## Authentication & State Management

- Authentication handled via **JWT**:
  - Access token
  - Refresh token
- Tokens decoded client-side using **jwt-decode**
- Global authentication state and token lifecycle managed with **Zustand**

---

## Forms & Validation

- Forms implemented using:
  - **React Hook Form**
  - **Zod**
  - **@hookform/resolvers**
- **DOMPurify** used to sanitize HTML content rendered from backend responses to mitigate **XSS attacks**

---

## Data Fetching & Server State

- Server state managed using **@tanstack/react-query**
- Integrated with a **centralized Axios instance**
- Key techniques applied:
  - Query invalidation
  - Optimistic refresh
  - Mutation-based cache updates

Used extensively in features such as:

- Bidding
- Product publishing

---

## Realtime & Live Updates

### Server-Sent Events (SSE)

- Implemented via a custom `createSSE` wrapper
- Used for:
  - Live bid updates during auctions
  - Real-time notifications
  - Chat between sellers and bidders

### Short Polling

- Used for real-time monitoring of platform statistics:
  - Total users
  - Active users
  - Total products
  - Available products

---

## Product Publishing & Content

- Sellers publish products using a **Tiptap-powered rich-text editor**
- Supports advanced product descriptions

---

## Internationalization & UI

- **i18n support**:
  - Vietnamese
  - English
- UI stack:
  - **Tailwind CSS**
  - **Shadcn UI**
  - **Radix UI primitives**
- Icons powered by **Lucide React**
- Animations and parallax effects implemented with **Framer Motion**

---

## Admin Panel Features

The **Frontend-admin** application includes:

- Full **CRUD management** for:
  - Products
  - Users
  - Orders
  - Categories
- Dashboards and analytics using **Shadcn UI chart components**

---

## Code Quality & Tooling

- Code formatting and consistency enforced with **Biome**
