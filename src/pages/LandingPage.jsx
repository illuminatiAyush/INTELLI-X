import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Layers, Zap, Globe, Github, Twitter, Linkedin, CheckCircle2, Users, BookOpen, BarChart3, Clock, Award, Check, ChevronDown, Star, TrendingUp, Play } from 'lucide-react';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// --- Shared chart data (same figures as the real DashboardPreview) ---
const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(17,17,17,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      titleColor: '#fff',
      bodyColor: '#d1d5db',
    }
  },
  animation: { duration: 1200, easing: 'easeInOutQuart' },
};

const axisStyle = {
  x: {
    grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
    ticks: { color: '#9ca3af', font: { size: 10 } },
  },
  y: {
    grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
    ticks: { color: '#9ca3af', font: { size: 10 } },
  }
};

const revenueData = {
  labels: MONTHS,
  datasets: [{
    label: 'Revenue (₹L)',
    data: [8.2, 9.1, 10.4, 11.8, 10.2, 12.6, 13.1, 14.0, 14.2],
    borderColor: '#F97316',
    backgroundColor: 'rgba(249,115,22,0.08)',
    tension: 0.4,
    fill: true,
    pointBackgroundColor: '#F97316',
    pointRadius: 3,
    borderWidth: 2,
  }]
};

const attendanceData = {
  labels: MONTHS,
  datasets: [{
    label: 'Attendance %',
    data: [88, 91, 93, 89, 95, 92, 94, 96, 94],
    borderColor: '#111827',
    backgroundColor: 'rgba(17,24,39,0.05)',
    tension: 0.4,
    fill: true,
    pointBackgroundColor: '#111827',
    pointRadius: 3,
    borderWidth: 2,
  }]
};

const feeData = {
  labels: MONTHS,
  datasets: [{
    label: 'Fees Collected',
    data: [72, 85, 91, 88, 95, 89, 94, 97, 99],
    backgroundColor: MONTHS.map((_, i) =>
      i === MONTHS.length - 1 ? 'rgba(249,115,22,0.9)' : 'rgba(249,115,22,0.25)'
    ),
    borderRadius: 6,
    borderSkipped: false,
  }]
};

const enrollmentData = {
  labels: ['Physics', 'Chemistry', 'Math', 'Biology', 'English'],
  datasets: [{
    data: [280, 210, 320, 190, 150],
    backgroundColor: [
      '#F97316',
      '#111827',
      '#FDBA74',
      '#D1D5DB',
      '#FDE68A',
    ],
    borderWidth: 0,
  }]
};

const lineOpts = { ...chartDefaults, scales: axisStyle };
const barOpts = {
  ...chartDefaults,
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } },
    y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { color: '#9ca3af', font: { size: 10 } }, max: 100 }
  }
};
const doughnutOpts = {
  ...chartDefaults,
  cutout: '68%',
  plugins: {
    ...chartDefaults.plugins,
    legend: {
      display: true,
      position: 'right',
      labels: { color: '#6b7280', font: { size: 10 }, boxWidth: 10, padding: 8 }
    }
  }
};

// --- Reveal helper ---
const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- Navbar ---
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 24);
    });
  }, [scrollY]);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-[#FDFCF9]/90 backdrop-blur-md border-gray-200/80 py-3' : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#hero" className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">I</div>
          INTELLI-X
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#platform" className="hover:text-orange-600 transition-colors">Platform</a>
          <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-orange-600 transition-colors">Customers</a>
          <a href="#pricing" className="hover:text-orange-600 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden md:block text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors px-3 py-2">Log in</Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-5 py-2.5 rounded-full bg-[#111] text-white text-sm font-medium hover:bg-black transition-colors shadow-sm"
            >
              Start for free
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

// --- Dashboard preview (real charts, same data as DashboardPreview.jsx) ---
const DashboardPreview = () => {
  const kpis = [
    { label: 'Total Students', value: '1,248', change: '+12%', up: true },
    { label: 'Monthly Revenue', value: '₹14.2L', change: '+8%', up: true },
    { label: 'Avg Attendance', value: '94.2%', change: '-1.2%', up: false },
    { label: 'Fees Collected', value: '99%', change: '+4%', up: true },
  ];

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 32, rotate: 1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[1.75rem] bg-white border border-gray-200/90 shadow-[0_24px_70px_-24px_rgba(17,24,39,0.25)] overflow-hidden"
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs font-semibold text-gray-500">IntelliX Analytics — FY 2025-26</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-500">Live</span>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 gap-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5">
                <p className="text-[11px] font-medium text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-900 tracking-tight leading-none mb-1.5">{kpi.value}</p>
                <p className={`text-[11px] font-semibold ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                  {kpi.change} vs last month
                </p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-900">Revenue Trend</p>
              <p className="text-xs text-gray-500 mb-3">Monthly revenue (₹ Lakhs) — last 9 months</p>
              <div className="h-40"><Line data={revenueData} options={lineOpts} /></div>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-900">Enrollment by Subject</p>
              <p className="text-xs text-gray-500 mb-3">Active students per subject</p>
              <div className="h-40"><Doughnut data={enrollmentData} options={doughnutOpts} /></div>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-900">Attendance Trend</p>
              <p className="text-xs text-gray-500 mb-3">Monthly average attendance %</p>
              <div className="h-36"><Line data={attendanceData} options={lineOpts} /></div>
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-900">Fee Collection Rate</p>
              <p className="text-xs text-gray-500 mb-3">Percentage of total fees collected each month</p>
              <div className="h-36"><Bar data={feeData} options={barOpts} /></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating attendance card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-5 -left-3 md:-left-8 bg-white rounded-2xl border border-gray-100 shadow-xl px-4 py-3.5 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-none mb-1">Attendance marked</p>
          <p className="text-xs text-gray-500">Batch A · Physics · 94.2% present</p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Hero Section ---
const Hero = () => {
  return (
    <section className="relative w-full bg-[#FDFCF9] overflow-hidden" id="hero">
      {/* Soft background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[480px] h-[480px] rounded-full bg-orange-200/30 blur-[110px]" />
        <div className="absolute top-[30%] right-[-5%] w-[420px] h-[420px] rounded-full bg-purple-200/25 blur-[110px]" />
        <div className="absolute bottom-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-amber-100/40 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-32 md:pt-40 pb-20 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Copy */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-orange-700 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            For modern coaching institutes
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-black leading-[1.05] mb-6">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Manage your
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              institute with{' '}
              <span className="font-serif italic font-normal text-orange-500 relative inline-block pr-1">
                clarity
                <svg className="absolute w-[110%] h-3 -bottom-1 left-[-5%] text-orange-400 opacity-90 -rotate-2" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M5 15 C 30 5, 70 5, 95 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-gray-600 font-normal max-w-md mb-8 leading-relaxed"
          >
            The all-in-one platform to manage students, attendance, and exams effortlessly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-3.5 w-full sm:w-auto rounded-full bg-[#111] text-white text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 group shadow-lg shadow-black/10"
              >
                Start your free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <a href="#features">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-3.5 w-full sm:w-auto rounded-full bg-white text-gray-900 text-sm font-medium border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-orange-500" />
                See the platform
              </motion.button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-gray-500"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> Cancel anytime</span>
          </motion.div>
        </div>

        {/* Dashboard preview */}
        <div className="lg:col-span-7 pb-6">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
};

// --- Logo Cloud Marquee ---
const LogoCloud = () => {
  const names = [
    { name: 'Apex Classes', cls: 'font-serif font-bold text-gray-800' },
    { name: 'Resonance', cls: 'font-black text-blue-900 tracking-tight' },
    { name: 'Vidyamandir', cls: 'font-medium italic text-gray-600' },
    { name: 'Allen Academy', cls: 'font-semibold text-gray-800 uppercase' },
    { name: 'SKYLIGHT', cls: 'font-normal text-gray-700 tracking-widest' },
  ];
  return (
    <section className="py-10 bg-white border-y border-gray-100 overflow-hidden">
      <p className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-6">
        Built for institutes like
      </p>
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          className="flex gap-14 items-center pr-14"
          animate={{ x: [0, -900] }}
          transition={{ ease: 'linear', duration: 32, repeat: Infinity }}
        >
          {[0, 1, 2, 3].map((set) => (
            <React.Fragment key={set}>
              {names.map((n) => (
                <div key={`${set}-${n.name}`} className={`text-xl ${n.cls}`}>{n.name}</div>
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// --- Value Clarity ---
const ValueClarity = () => {
  const items = [
    { icon: <Clock className="w-6 h-6 text-orange-600" />, title: 'Save 15+ Hours a Week', desc: 'Automate attendance, grade generation, and fee reminders instantly.' },
    { icon: <BarChart3 className="w-6 h-6 text-orange-600" />, title: 'Actionable Insights', desc: 'Track batch performance, student weaknesses, and attendance trends in real-time.' },
    { icon: <Globe className="w-6 h-6 text-orange-600" />, title: 'Unified Ecosystem', desc: 'Connect students, parents, and teachers in one centralized platform.' }
  ];
  return (
    <section className="py-24 bg-[#FDFCF9]" id="platform">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-14 text-center mx-auto">
          <h2 className="text-3xl md:text-[2.5rem] font-medium text-black tracking-tight leading-tight mb-4">
            Empowering educators.<br />Inspiring students.
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            INTELLI-X is built for modern institutes that want to scale gracefully. We eliminate the administrative burden so teachers can focus on what they do best: teaching.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="p-7 rounded-3xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-[0_16px_40px_-16px_rgba(249,115,22,0.25)] hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="mb-5 bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Features (Bento Grid with live mini-UIs) ---
const Features = () => {
  const students = [
    { name: 'Aarav Patel', batch: 'Batch A · Physics', att: 96, color: 'bg-orange-500' },
    { name: 'Sneha Kulkarni', batch: 'Batch B · Chemistry', att: 92, color: 'bg-gray-900' },
    { name: 'Rohan Desai', batch: 'Batch A · Maths', att: 88, color: 'bg-amber-400' },
  ];
  const leaders = [
    { rank: 1, name: 'Aarav Patel', pts: '2,480 pts', color: 'bg-orange-500' },
    { rank: 2, name: 'Sneha Kulkarni', pts: '2,315 pts', color: 'bg-gray-900' },
    { rank: 3, name: 'Rohan Desai', pts: '2,190 pts', color: 'bg-amber-400' },
  ];
  const bars = [42, 58, 50, 70, 64, 82, 76, 92, 88, 100];

  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="flex flex-col md:flex-row gap-6 items-end justify-between mb-12">
          <h2 className="text-3xl md:text-[2.5rem] font-medium text-black tracking-tight leading-tight">
            Everything you need.<br />Perfectly integrated.
          </h2>
          <p className="text-gray-600 max-w-sm pb-1 text-sm md:text-base leading-relaxed">
            Ditch the fragmented tools and messy Excel sheets. Welcome to absolute clarity.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Batch & Student Management */}
          <Reveal className="md:col-span-8" delay={0}>
            <div className="p-8 rounded-3xl bg-[#FDFCF9] border border-gray-100 overflow-hidden relative h-full flex flex-col">
              <div className="w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-sm text-orange-600 flex items-center justify-center mb-5">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Batch &amp; Student Management</h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md mb-6">Organize students into batches, manage complete profiles, track attendance, and process fees seamlessly.</p>
              <div className="mt-auto space-y-2.5">
                {students.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3">
                    <div className={`w-9 h-9 rounded-full ${s.color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>{s.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.batch}</p>
                    </div>
                    <div className="w-24 hidden sm:block">
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-orange-500" style={{ width: `${s.att}%` }} /></div>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{s.att}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Exam Engine */}
          <Reveal className="md:col-span-4" delay={0.08}>
            <div className="p-8 rounded-3xl bg-white border border-gray-100 h-full flex flex-col">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Exam Engine</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">Create tests, manage question banks, and instantly publish comprehensive results.</p>
              <div className="mt-auto space-y-2">
                {[
                  { q: 'Physics Unit Test 4', meta: '40 marks · 32 attempted' },
                  { q: 'Chemistry Mock JEE', meta: '100 marks · Results out' },
                ].map((t) => (
                  <div key={t.q} className="rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.q}</p>
                      <p className="text-xs text-gray-500">{t.meta}</p>
                    </div>
                    <span className="text-[11px] font-bold text-green-700 bg-green-50 rounded-full px-2.5 py-1 shrink-0">Live</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Leaderboards */}
          <Reveal className="md:col-span-4" delay={0.08}>
            <div className="p-8 rounded-3xl bg-white border border-gray-100 h-full flex flex-col">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Leaderboards</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">Gamify learning with dynamic rank lists to motivate students and track toppers.</p>
              <div className="mt-auto space-y-2">
                {leaders.map((l) => (
                  <div key={l.rank} className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-2.5">
                    <span className={`w-7 h-7 rounded-full ${l.color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>{l.rank}</span>
                    <p className="text-sm font-semibold text-gray-900 flex-1 truncate">{l.name}</p>
                    <span className="text-xs font-bold text-orange-600">{l.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Advanced Analytics */}
          <Reveal className="md:col-span-8" delay={0}>
            <div className="p-8 rounded-3xl bg-[#111] text-white overflow-hidden relative h-full flex flex-col">
              <div className="w-11 h-11 rounded-2xl bg-white/10 text-orange-400 flex items-center justify-center mb-5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">Deep insights into institute growth, revenue trends, and individual student progress over time.</p>
              <div className="mt-auto">
                <div className="flex items-end gap-2 h-24 mb-6">
                  {bars.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-orange-500/40 to-orange-400" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <button className="px-5 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-orange-500 hover:text-white transition-colors">
                  View full feature list
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// --- Statistics ---
const Statistics = () => {
  const stats = [
    { label: 'Active Institutes', value: '500+' },
    { label: 'Students Enrolled', value: '50k+' },
    { label: 'Tests Conducted', value: '1M+' },
    { label: 'Platform Uptime', value: '99.9%' }
  ];
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.08} className="text-center">
              <h4 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">{stat.value}</h4>
              <p className="text-gray-500 font-semibold text-[11px] tracking-[0.18em] uppercase">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Testimonials ---
const Testimonials = () => {
  const reviews = [
    { name: 'Rahul Sharma', role: 'Director, Apex Classes', text: 'INTELLI-X entirely changed how we manage our institute. Attendance takes seconds, and students love the gamified leaderboards.', color: 'bg-orange-100 text-orange-600' },
    { name: 'Priya Menon', role: 'Lead Educator', text: 'The test engine is phenomenal. Generating detailed result analytics for 500 students used to take hours—now it’s instantaneous.', color: 'bg-gray-900 text-white' },
    { name: 'Amit Kumar', role: 'Owner, Resonance Coaching', text: 'Finally, a platform that feels like it was designed in the 21st century. It’s clean, fast, and incredibly powerful for our scale.', color: 'bg-amber-100 text-amber-700' }
  ];

  return (
    <section className="py-24 bg-[#FDFCF9]" id="testimonials">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-[2.5rem] font-medium text-black tracking-tight">Loved by top educators.</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((rev, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="p-7 rounded-3xl bg-white border border-gray-100 hover:shadow-[0_16px_40px_-16px_rgba(17,24,39,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                <div className="flex gap-1 mb-5 text-orange-400">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-700 text-[15px] leading-relaxed mb-6 font-medium">&ldquo;{rev.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-auto pt-5 border-t border-gray-50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${rev.color}`}>
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-sm">{rev.name}</h4>
                    <p className="text-xs font-medium text-gray-500">{rev.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CTA Section ---
const CTA = () => {
  return (
    <section className="py-24 bg-black relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Ready to scale gracefully?</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-base md:text-lg text-gray-300 font-medium max-w-xl mx-auto mb-10">
            Join hundreds of modern institutes building the future of education. Get started today with a free trial.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-8 py-4 rounded-full bg-white text-black text-base font-bold flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-colors shadow-xl"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </Reveal>
        <div className="mt-8 flex items-center gap-5 justify-center text-gray-400">
          <div className="flex items-center gap-1.5 font-medium text-xs"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> 14-day free trial</div>
          <div className="flex items-center gap-1.5 font-medium text-xs"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Cancel anytime</div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-16">
          <div className="col-span-2 md:col-span-4">
            <a href="#hero" className="text-xl font-bold text-black tracking-tight mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-bold">I</div>
              INTELLI-X
            </a>
            <p className="text-gray-600 font-medium max-w-xs mb-6 text-sm leading-relaxed">
              The intelligence platform for modern educational institutes.
            </p>
            <div className="flex gap-3 text-gray-500">
              <a href="#" aria-label="Twitter" className="hover:text-orange-600 transition-colors p-2.5 bg-gray-50 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50"><Twitter className="w-4 h-4" /></a>
              <a href="#" aria-label="GitHub" className="hover:text-orange-600 transition-colors p-2.5 bg-gray-50 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50"><Github className="w-4 h-4" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-orange-600 transition-colors p-2.5 bg-gray-50 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

          <div className="md:col-start-7 col-span-1 md:col-span-2">
            <h4 className="text-black font-bold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-gray-600 font-medium text-sm">
              <li><a href="#features" className="hover:text-orange-600 transition-colors">Student Management</a></li>
              <li><a href="#features" className="hover:text-orange-600 transition-colors">Exam Engine</a></li>
              <li><a href="#features" className="hover:text-orange-600 transition-colors">Analytics &amp; Reports</a></li>
              <li><a href="#features" className="hover:text-orange-600 transition-colors">Teacher Portals</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-black font-bold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5 text-gray-600 font-medium text-sm">
              <li><a href="#" className="hover:text-orange-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Customer Stories</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">API Documentation</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-black font-bold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-gray-600 font-medium text-sm">
              <li><a href="#" className="hover:text-orange-600 transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Partners</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500 font-medium">
          <p>© 2026 INTELLI-X Inc. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  // Scroll progress bar physics
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Force light mode globally for the landing page
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  return (
    <div className="bg-[#FDFCF9] min-h-screen text-black font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-orange-500 origin-left z-50"
        style={{ scaleX }}
      />

      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <ValueClarity />
        <Features />
        <Statistics />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
