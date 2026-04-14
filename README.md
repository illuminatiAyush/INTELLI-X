IntelliX – AI-Powered Coaching Institute Operating System

IntelliX is a next-generation AI-driven operating system built for modern coaching institutes.
It transforms traditional institute workflows into a fully automated, data-driven, intelligent ecosystem — enabling real-time management, personalized analytics, and AI-assisted decision making.

⚡ Built to scale from a single institute to a full SaaS platform.

🧠 Vision

Traditional coaching systems are:

fragmented ❌
manual ❌
inefficient ❌

IntelliX converts them into:

Centralized + Automated + AI-Augmented System
⚙️ Core Capabilities
🧑‍💼 Admin Control System
Institute-wide analytics dashboard
Batch-wise & student-wise drilldowns
Attendance + test + performance insights
Real-time monitoring
👨‍🏫 Teacher System
Test creation & evaluation
Batch management
Student performance tracking
AI-assisted insights
👨‍🎓 Student System
Personalized dashboard
Test attempts & results
Leaderboard ranking
AI doubt-solving assistant (WIP)
🤖 AI Layer (Next-Gen Feature)
AI chatbot → evolving into full Doubt Solver
Image + text input support (OCR pipeline)
Structured teaching responses (step-by-step)
Future-ready for RAG (Retrieval Augmented Generation)
🧩 System Architecture (Current)
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
│ (PostgreSQL) │  │ (Groq / LLM)   │  │ (WebSockets)   │
└──────────────┘  └────────────────┘  └────────────────┘
        │
        ▼
┌────────────────────────────┐
│ Auth + RBAC + Storage      │
└────────────────────────────┘
🧠 AI Doubt Solver Flow (Upcoming Core Feature)
User (Image / Text)
        ↓
Image Crop Tool (Frontend)
        ↓
OCR (Text Extraction)
        ↓
LLM (Groq / AI)
        ↓
Structured Answer (Teacher Style)
        ↓
Chat Interface
🛠 Tech Stack
🎨 Frontend
React 19
Vite
Tailwind CSS
Headless UI
⚡ Interaction & Animations
Framer Motion
Intersection Observer
React Scroll
📊 Visualization
Chart.js
React-Chartjs-2
🧠 AI / Future ML Stack
Groq API (LLM)
OCR (Tesseract.js – planned)
RAG (planned: pgvector / Pinecone)
🗄 Backend & Infra
Supabase
PostgreSQL
Auth
Realtime
Storage
RBAC
📂 Project Structure
📦 INTELLI-X
 ┣ 📂 public/
 ┣ 📂 scripts/
 ┣ 📂 src/
 ┃ ┣ 📂 animations/
 ┃ ┣ 📂 assets/
 ┃ ┣ 📂 components/
 ┃ ┃ ┣ 📂 dashboard/
 ┃ ┃ ┣ 📂 teacher/
 ┃ ┃ ┣ 📂 profile/
 ┃ ┃ ┗ 📂 ui/
 ┃ ┣ 📂 config/
 ┃ ┣ 📂 context/
 ┃ ┣ 📂 lib/
 ┃ ┣ 📂 pages/
 ┃ ┃ ┗ 📂 dashboard/
 ┃ ┣ 📂 sections/
 ┃ ┣ 📂 services/
 ┃ ┣ 📜 App.jsx
 ┃ ┣ 📜 main.jsx
 ┃ ┗ 📜 index.css
 ┣ 📂 supabase/
 ┃ ┗ 📂 migrations/
 ┣ 📜 package.json
 ┣ 📜 vite.config.js
 ┗ 📜 tailwind.config.js
🔐 Database Architecture (Simplified)
Users
 ├── role (admin / teacher / student)
 ├── institute_id

Institutes
Batches
Students
Teachers
Tests
Test_Attempts
Attendance
Results
Leaderboard
Materials
⚡ Key Engineering Highlights
🔒 Strict RBAC (Role-Based Access Control)
⚡ Real-time updates using Supabase subscriptions
🧠 Optimized batch-wise analytics (no N+1 queries)
🛡 Crash-safe UI with null-safe rendering
🔄 Modular service architecture
🚀 SaaS-ready multi-institute design
💻 Getting Started
Prerequisites
Node.js (v18+)
npm
Installation
git clone https://github.com/your-username/INTELLI-X-master.git
cd INTELLI-X-master
npm install
Environment Setup
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
VITE_GROQ_API_KEY=your-ai-key
Run Dev Server
npm run dev
Build
npm run build
🧪 Current Status
✔ Admin Dashboard (Functional)
✔ Batch & Student Management
✔ Analytics System (Drilldown Enabled)
✔ Auth + RBAC
✔ UI System (Refined Minimal Theme)

🚧 AI Doubt Solver (MVP in progress)
🚧 Test Creation Engine (Upcoming Core)
🚧 RAG-based Learning System
🚀 Roadmap
Phase 1 (Current)
Admin + Teacher + Student system
Analytics + dashboards
Core UI/UX
Phase 2
AI doubt solver (image + text)
Test creation engine
Performance insights AI
Phase 3
RAG-based intelligent learning
SaaS multi-institute scaling
Advanced analytics + predictions
🧠 Philosophy

“The best systems are not managed — they are engineered.”

IntelliX is not just software.
It is an operating system for education.

🤝 Contributing

Currently under active development. Contributions will be opened soon.

📜 License

Private project (for now)