# IntelliX — AI-Powered Coaching Institute Operating System

IntelliX is a modern operating system for coaching institutes that transforms fragmented, manual workflows into a centralized, data-driven, and scalable system.

It enables institutes to manage students, batches, attendance, and performance — all in one place, with real-time visibility and structured insights.

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

### Teacher
- Batch management  
- Attendance marking (live sessions)  
- Student performance tracking  

### Student
- Personalized dashboard  
- Attendance & results view  
- Batch access  

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
        ▼                  ▼                  ▼
┌──────────────┐  ┌────────────────┐  ┌────────────────┐
│  Supabase    │  │   AI Layer     │  │  Realtime Sync │
│ (PostgreSQL) │  │ (LLM / RAG)    │  │ (WebSockets)   │
└──────────────┘  └────────────────┘  └────────────────┘
        │
        ▼
┌────────────────────────────┐
│ Auth + RBAC + Storage      │
└────────────────────────────┘
```

---

## AI Layer (In Progress)

```text
User Input (Text / Image)
        ↓
OCR (Text Extraction)
        ↓
LLM Processing
        ↓
Structured Answer (Step-by-step)
        ↓
Chat Interface
```

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS

### Backend & Infra
- Supabase (PostgreSQL)
- Auth + Realtime + Storage

### AI (Planned)
- LLM APIs  
- OCR pipeline  
- RAG (vector search)

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
VITE_GROQ_API_KEY=your-ai-key
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

**In Progress:**
- AI Doubt Solver  
- Test Engine  
- RAG-based learning  

---

## Vision

We don’t change how institutes teach.  
We give them complete control, visibility, and intelligence over their system.

---

## License

Private (under development)