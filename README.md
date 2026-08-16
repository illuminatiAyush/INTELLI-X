# IntelliX — Modern Coaching Institute Management Platform

IntelliX is a modern operating system for coaching institutes that transforms fragmented, manual workflows into a centralized, data-driven, and scalable system.

It enables institutes to manage students, batches, attendance, fees, and performance — all in one place, with real-time visibility and structured insights.

---

## Problem

Traditional coaching systems are:
- Fragmented  
- Manual  
- Inefficient  

---

## Solution

IntelliX digitizes the entire institute workflow into a unified platform:
- Centralized data management  
- Real-time tracking  
- Role-based access control  
- Performance analytics  
- Scalable multi-institute architecture  

---

## Core Modules

### Admin
- Institute-wide dashboard  
- Batch & student management  
- Performance analytics  
- Attendance & results tracking
- Fee management
- Notifications

### Teacher
- Batch management  
- Attendance marking (live sessions)  
- Student performance tracking  
- Test administration

### Student
- Personalized dashboard  
- Attendance & results view  
- Batch access  
- Test attempts
- Fee tracking

---

## System Architecture

```text
                ┌────────────────────────┐
                │      Frontend (React)  │
                │  UI + State + Routing  │
                └──────────┬─────────────┘
                           │
                           ▼
                ┌────────────────────────┐
                │   Service Layer        │
                │ (API + Logic Handling) │
                └──────────┬─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                                     ▼
┌──────────────┐                      ┌────────────────┐
│  Supabase    │                      │  Realtime Sync │
│ (PostgreSQL) │                      │ (WebSockets)   │
└──────────────┘                      └────────────────┘
        │
        ▼
┌────────────────────────────┐
│ Auth + RBAC + Storage      │
└────────────────────────────┘
```

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS

### Backend & Infra
- Supabase (PostgreSQL)
- Auth + Realtime + Storage
- FastAPI (Future)

---

## Database Design (Simplified)

```text
Profiles (auth users)
 ├── role (admin / teacher / student)
 ├── institute_id

Institutes
Batches
Batch_Students
Students
Teachers
Tests
Attempts
Attendance
Results
Materials
```

---

## Key Features

- Role-Based Access Control (RBAC)  
- Multi-tenant architecture (SaaS-ready)  
- Real-time updates  
- Optimized queries (no N+1)  
- Modular architecture  

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
git clone https://github.com/your-username/INTELLI-X-master.git
cd INTELLI-X-master
npm install
```

### Environment Variables

```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### Run

```bash
npm run dev
```

---

## Current Status

- Admin Dashboard  
- Batch & Student Management  
- Auth + RBAC  
- Real-time system
- Test Engine

---

## Vision

We don't change how institutes teach.  
We give them complete control, visibility, and intelligence over their system.

---

## License

Private (under development)