# IntelliX – AI-Powered Coaching Institute OS

**IntelliX** is the comprehensive digital operating system designed specifically for modern coaching institutes. With IntelliX, you can transform your institute with AI-powered automation, intelligent analytics, and seamless real-time management. Run your entire coaching institute like a well-oiled, AI-driven machine.

## 🚀 Features

- **Performant & Modern UI**: Built with React 19 and Tailwind CSS for rapid, scalable client-side rendering.
- **Engaging Animations**: Bringing the UI to life utilizing Framer Motion.
- **3D Graphics & Visualizations**: Interactive 3D charts and elements using Three.js, React Three Fiber, and Drei.
- **Intelligent Data Insights**: Rich, interactive data visualisations powered by Chart.js and React-Chartjs-2.
- **Robust Backend**: Integrated with Supabase for robust Authentication, Database management, Role-Based Access Control (RBAC), and Data Storage.
- **Scroll Tracking & UI Polish**: Intersection Observer and React Scroll for scroll-based triggers and deeply immersive navigation.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Headless UI
- **Animations & Interaction**: Framer Motion, React Intersection Observer, React Scroll
- **3D Elements**: Three.js, React Three Fiber, React Three Drei
- **Data Visualization**: Chart.js, React-Chartjs-2
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Realtime, Auth, Storage)
- **Deployment & Tooling**: ESLint, Vite

## 📂 Project Structure

```bash
📦 INTELLI-X
 ┣ 📂 public/          # Static assets including favicons and logos
 ┣ 📂 scripts/         # Utility and tool scripts
 ┣ 📂 src/             # Source code
 ┃ ┣ 📂 animations/    # Framer Motion animation configurations
 ┃ ┣ 📂 assets/        # Project images, fonts, media
 ┃ ┣ 📂 components/    # Reusable React UI Components
 ┃ ┣ 📂 config/        # Environment and project configuration files
 ┃ ┣ 📂 context/       # React Context Providers for global state
 ┃ ┣ 📂 lib/           # Utility functions and library helpers
 ┃ ┣ 📂 pages/         # Full-page components mapping to Routes
 ┃ ┣ 📂 sections/      # Distinct page sections (e.g., Hero, Footer)
 ┃ ┣ 📂 services/      # External API & Backend integrations (Supabase services)
 ┃ ┣ 📜 App.jsx        # Main App component with Routing
 ┃ ┣ 📜 main.jsx       # Entry point for React DOM
 ┃ ┗ 📜 index.css      # Core standard CSS, Tailwind directives
 ┣ 📜 *.sql            # Supabase database migration and configuration files
 ┣ 📜 index.html       # Vite HTML Entry Point
 ┣ 📜 package.json     # Node Dependencies & Scripts
 ┣ 📜 vite.config.js   # Vite module bundler configuration
 ┗ 📜 tailwind.config.js # Tailwind CSS configuration
```

## 💻 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+ recommended) and `npm` installed.

### Installation

1. **Clone the repository** (if pushed to remote):
   ```bash
   git clone https://github.com/your-username/INTELLI-X-master.git
   cd INTELLI-X-master
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file referencing `.env.example` in the root and add your Supabase credentials and other configuration keys:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## 🗄️ Database Set Up (Supabase)

You can run the existing SQL scripts directly in the Supabase shell to scaffold the DB schema and RLS policies:
- `supabase_rbac_setup.sql` — Injects RBAC (Role-Based Access Control) setup
- `supabase_add_phone_selfregister.sql` / `supabase_fix_student_selfregister.sql` — Handles authentication forms/profiles
- `supabase_saas_migration.sql` — Main structural application setups

## 🛡️ Linting

We maintain code quality using ESLint. Check code health by running:
```bash
npm run lint
```
