import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Layers, Zap, Globe, Github, Twitter, Linkedin, CheckCircle2, Users, BookOpen, BarChart3, Clock, Award, Check, ChevronDown } from 'lucide-react';
import './LandingPage.css';
import { Link } from 'react-router-dom';

// --- Custom Cursor ---
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (
        e.target.tagName.toLowerCase() === 'button' || 
        e.target.tagName.toLowerCase() === 'a' || 
        e.target.closest('button') || 
        e.target.closest('a') ||
        e.target.classList.contains('hover-target')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div className="hidden md:block">
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-black rounded-full pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - 5,
          y: mousePosition.y - 5,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.1 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-black/20 rounded-full pointer-events-none z-[9998] flex items-center justify-center backdrop-invert"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.2 }}
      />
    </div>
  );
};

// --- Preloader ---
const Preloader = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#FDFCF9] text-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="overflow-hidden flex flex-col items-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="text-3xl md:text-4xl font-medium tracking-tight"
        >
          INTELLI-X
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- Navbar ---
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-gray-200 py-3' : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="text-lg font-bold text-black tracking-tight hover-target flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">I</div>
          INTELLI-X
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#platform" className="hover:text-purple-600 transition-colors">Platform</a>
          <a href="#features" className="hover:text-pink-600 transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-orange-600 transition-colors">Customers</a>
          <a href="#pricing" className="hover:text-purple-600 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden md:block text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors px-3 py-2">Log in</Link>
          <Link to="/register">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 rounded-full bg-[#111] text-white text-sm font-medium hover:bg-black transition-colors shadow-sm"
            >
              Start for free
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

// --- Hero Section ---
const Hero = () => {
  return (
    <section className="relative w-full h-[100vh] min-h-[700px] bg-[#FDFCF9] overflow-hidden" id="hero">
      
      {/* Vibrant Mixed Background Orbs */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[100px]" />
         <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-orange-200/40 blur-[100px]" />
         <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-200/30 blur-[100px]" />
         <div className="absolute top-[30%] left-[30%] w-[300px] h-[300px] rounded-full bg-pink-200/30 blur-[80px]" />
      </div>

      {/* Background Graphic / Screen Mockup (Right Side) */}
      <motion.div 
        initial={{ opacity: 0, x: 100, y: 50, rotate: 5 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: -3 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[15%] left-[50%] md:left-[45%] w-[900px] h-[700px] bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-purple-900/5 z-10 overflow-hidden flex flex-col hidden sm:flex"
      >
        {/* Mockup Header */}
        <div className="w-full h-12 border-b border-gray-100 flex items-center px-6 gap-2 bg-gray-50/80 shrink-0 backdrop-blur-sm">
           <div className="w-3 h-3 rounded-full bg-red-400" />
           <div className="w-3 h-3 rounded-full bg-yellow-400" />
           <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        {/* Mockup Content - Mixed Colors */}
        <div className="flex-1 p-8 grid grid-cols-12 gap-6 bg-gray-50/20">
           <div className="col-span-3 space-y-4">
              <div className="w-full h-8 bg-purple-50 rounded-lg border border-purple-100" />
              <div className="w-3/4 h-6 bg-gray-100 rounded-md mt-8" />
              <div className="w-2/3 h-6 bg-gray-100 rounded-md" />
              <div className="w-4/5 h-6 bg-gray-100 rounded-md" />
           </div>
           <div className="col-span-9 space-y-6">
              {/* Purple Accent Card */}
              <div className="w-full h-40 bg-orange-50 border border-orange-100/50 rounded-2xl p-6 flex gap-6 items-center shadow-sm">
                 <div className="w-20 h-20 rounded-full bg-orange-200/50 flex items-center justify-center text-orange-600"><Users className="w-8 h-8"/></div>
                 <div className="flex-1 space-y-3">
                    <div className="w-1/3 h-4 bg-orange-200 rounded" />
                    <div className="w-1/2 h-4 bg-orange-100 rounded" />
                 </div>
              </div>
              <div className="flex gap-6">
                 {/* Orange Accent Card */}
                 <div className="flex-1 h-56 bg-white border border-orange-100 rounded-2xl shadow-sm p-6 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full pointer-events-none" />
                    <div className="w-10 h-10 rounded-full bg-orange-100 z-10" />
                    <div className="w-full h-2 bg-gray-100 rounded mt-auto z-10" />
                    <div className="w-3/4 h-2 bg-gray-100 rounded z-10" />
                 </div>
                 {/* Cyan Accent Card */}
                 <div className="flex-1 h-56 bg-white border border-cyan-100 rounded-2xl shadow-sm p-6 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-bl-full pointer-events-none" />
                    <div className="w-10 h-10 rounded-full bg-cyan-100 z-10" />
                    <div className="w-full h-2 bg-gray-100 rounded mt-auto z-10" />
                    <div className="w-3/4 h-2 bg-gray-100 rounded z-10" />
                 </div>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Floating Secondary Mockup */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[10%] right-[-5%] w-[350px] h-[250px] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(255,100,150,0.15)] z-20 p-6 flex-col gap-4 hidden lg:flex"
      >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600"><CheckCircle2 className="w-6 h-6"/></div>
            <div>
              <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
              <div className="w-16 h-3 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="mt-auto w-full h-24 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center">
             <BarChart3 className="w-8 h-8 text-orange-300" />
          </div>
      </motion.div>

      {/* Text Content (Bottom Left) */}
      <div className="absolute inset-0 container mx-auto px-6 pointer-events-none">
        <div className="absolute bottom-[12%] left-6 z-30 pointer-events-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200/50 bg-white/60 backdrop-blur-md shadow-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-700">INTELLI-X 2.0 is live</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-black leading-[1.1] mb-6 text-left">
            <motion.span 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.8 }} 
              className="block"
            >
              Manage your
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.9 }} 
              className="block"
            >
              institute with <span className="font-serif italic font-normal text-orange-500 relative inline-block pr-2">
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
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-base md:text-lg text-gray-600 font-normal max-w-md mb-8 text-left"
          >
            The all-in-one platform to manage students, attendance, and exams effortlessly.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
             <Link to="/register" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 w-full rounded-full bg-[#111] text-white text-sm font-medium hover:bg-black shadow-[0_8px_20px_rgb(0,0,0,0.15)] flex items-center justify-center gap-2 group"
              >
                Start your free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Logo Cloud Marquee ---
const LogoCloud = () => {
  return (
    <section className="py-8 bg-white border-y border-gray-100 overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trusted by 500+ innovative institutes</p>
      </div>
      <div className="flex whitespace-nowrap">
         <motion.div 
           className="flex gap-12 items-center"
           animate={{ x: [0, -1000] }}
           transition={{ ease: "linear", duration: 30, repeat: Infinity }}
         >
           {[1,2,3,4].map((set) => (
             <React.Fragment key={set}>
                <div className="text-xl font-bold font-serif text-gray-800">Apex Classes</div>
                <div className="text-xl font-black text-blue-900 tracking-tight">Resonance</div>
                <div className="text-xl font-medium italic text-gray-600">Vidyamandir</div>
                <div className="text-xl font-semibold text-gray-800 uppercase">Allen Academy</div>
                <div className="text-xl font-normal text-gray-700 tracking-widest">SKYLIGHT</div>
             </React.Fragment>
           ))}
         </motion.div>
       </div>
    </section>
  )
}

// --- Value Clarity ---
const ValueClarity = () => {
  return (
    <section className="py-20 bg-[#FDFCF9]" id="platform">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16 text-center mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium text-black tracking-tight mb-4"
          >
            Empowering educators. <br />
            Inspiring students.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 font-normal text-base"
          >
            INTELLI-X is built for modern institutes that want to scale gracefully. We eliminate the administrative burden so teachers can focus on what they do best: teaching.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Clock className="w-6 h-6 text-blue-600" />, bg: "bg-blue-50 border-blue-100", title: "Save 15+ Hours a Week", desc: "Automate attendance, grade generation, and fee reminders instantly." },
            { icon: <BarChart3 className="w-6 h-6 text-yellow-600" />, bg: "bg-yellow-50 border-yellow-100", title: "Actionable Insights", desc: "Track batch performance, student weaknesses, and attendance trends in real-time." },
            { icon: <Globe className="w-6 h-6 text-green-600" />, bg: "bg-green-50 border-green-100", title: "Unified Ecosystem", desc: "Connect students, parents, and teachers in one centralized platform." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-6 rounded-2xl border ${item.bg} hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="mb-4 bg-white w-12 h-12 rounded-xl shadow-sm flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
              <p className="text-gray-600 font-normal text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Features (Colorful Bento Grid) ---
const Features = () => {
  return (
    <section className="py-20 bg-white" id="features">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-12">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium text-black tracking-tight"
          >
            Everything you need. <br/>
            Perfectly integrated.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-gray-600 font-normal max-w-sm pb-1 text-sm md:text-base"
          >
            Ditch the fragmented tools and messy Excel sheets. Welcome to absolute clarity.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Blue Block */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="col-span-1 md:col-span-8 p-8 min-h-[300px] flex flex-col justify-between rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden relative"
          >
            <div className="z-10 max-w-sm">
              <div className="w-10 h-10 rounded-lg bg-white text-blue-600 shadow-sm flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-blue-950 mb-2">Batch & Student Management</h3>
              <p className="text-blue-800/80 font-medium text-sm leading-relaxed">Organize students into batches, manage complete profiles, track attendance, and process fees seamlessly.</p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          {/* Yellow Block */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="col-span-1 md:col-span-4 p-8 min-h-[300px] flex flex-col justify-between rounded-2xl bg-yellow-50 border border-yellow-100 relative overflow-hidden"
          >
             <div className="z-10">
              <div className="w-10 h-10 rounded-lg bg-white text-yellow-600 shadow-sm flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-950 mb-2">Exam Engine</h3>
              <p className="text-yellow-800/80 font-medium text-sm">Create tests, manage question banks, and instantly publish comprehensive results.</p>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-200/40 rounded-full blur-2xl pointer-events-none" />
          </motion.div>

          {/* Green Block */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="col-span-1 md:col-span-4 p-8 min-h-[300px] flex flex-col justify-between rounded-2xl bg-green-50 border border-green-100 relative overflow-hidden"
          >
             <div className="z-10">
              <div className="w-10 h-10 rounded-lg bg-white text-green-600 shadow-sm flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-green-950 mb-2">Leaderboards</h3>
              <p className="text-green-800/80 font-medium text-sm">Gamify learning with dynamic rank lists to motivate students and track toppers.</p>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-200/40 rounded-full blur-2xl pointer-events-none" />
          </motion.div>

          {/* Purple Block */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="col-span-1 md:col-span-8 p-8 min-h-[300px] flex flex-col justify-between rounded-2xl bg-purple-50 border border-purple-100 relative overflow-hidden"
          >
            <div className="z-10 max-w-sm">
              <div className="w-10 h-10 rounded-lg bg-white text-purple-600 shadow-sm flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-purple-950 mb-2">Advanced Analytics</h3>
              <p className="text-purple-800/80 font-medium text-sm leading-relaxed">Deep insights into institute growth, revenue trends, and individual student progress over time.</p>
            </div>
            <div className="absolute right-6 bottom-6 z-10">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="px-5 py-2.5 rounded-full bg-purple-600 text-white font-medium text-sm shadow-md hover:bg-purple-700"
               >
                  View full feature list
               </motion.button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Statistics ---
const Statistics = () => {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Institutes', value: '500+' },
            { label: 'Students Enrolled', value: '50k+' },
            { label: 'Tests Conducted', value: '1M+' },
            { label: 'Platform Uptime', value: '99.9%' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <h4 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-1">{stat.value}</h4>
              <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Testimonials ---
const Testimonials = () => {
  const reviews = [
    { name: "Rahul Sharma", role: "Director, Apex Classes", text: "INTELLI-X entirely changed how we manage our institute. Attendance takes seconds, and students love the gamified leaderboards.", color: "purple" },
    { name: "Priya Menon", role: "Lead Educator", text: "The test engine is phenomenal. Generating detailed result analytics for 500 students used to take hours—now it's instantaneous.", color: "orange" },
    { name: "Amit Kumar", role: "Owner, Resonance Coaching", text: "Finally, a platform that feels like it was designed in the 21st century. It's clean, fast, and incredibly powerful for our scale.", color: "cyan" }
  ]
  
  const getColorClasses = (color) => {
     if (color === 'purple') return 'bg-purple-100 text-purple-600';
     if (color === 'orange') return 'bg-orange-100 text-orange-600';
     return 'bg-cyan-100 text-cyan-600';
  }

  return (
    <section className="py-24 bg-[#FDFCF9]" id="testimonials">
      <div className="container mx-auto px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-medium text-black tracking-tight text-center mb-12"
        >
          Loved by top educators.
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[1,2,3,4,5].map(s => <Sparkles key={s} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-700 text-sm md:text-base mb-6 font-medium italic">"{rev.text}"</p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getColorClasses(rev.color)}`}>
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">{rev.name}</h4>
                  <p className="text-xs font-medium text-gray-500">{rev.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Mixed Gradient CTA Section ---
const CTA = () => {
  return (
    <section className="py-24 bg-black relative overflow-hidden flex flex-col items-center">
      {/* Decorative mixed background patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/40 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-pink-600/30 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6"
        >
          Ready to scale gracefully?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base md:text-lg text-gray-300 font-medium max-w-xl mx-auto mb-10"
        >
          Join hundreds of modern institutes building the future of education. Get started today with a free trial.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/register">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-white text-black text-base font-bold flex items-center gap-2 hover:bg-gray-100 shadow-xl shadow-white/10 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        <div className="mt-8 flex items-center gap-5 justify-center opacity-70">
           <div className="flex items-center gap-1.5 text-white font-medium text-xs"><CheckCircle2 className="w-3.5 h-3.5"/> 14-day free trial</div>
           <div className="flex items-center gap-1.5 text-white font-medium text-xs"><CheckCircle2 className="w-3.5 h-3.5"/> Cancel anytime</div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-16">
          <div className="col-span-2 md:col-span-4">
            <a href="#" className="text-xl font-bold text-black tracking-tight mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center text-xs font-bold">I</div>
              INTELLI-X
            </a>
            <p className="text-gray-600 font-medium max-w-xs mb-6 text-sm leading-relaxed">
              The intelligence platform for modern educational institutes.
            </p>
            <div className="flex gap-3 text-gray-500">
              <a href="#" className="hover:text-purple-600 transition-colors p-2 bg-gray-50 rounded-full border border-gray-200 hover:border-purple-200 hover:bg-purple-50"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-pink-600 transition-colors p-2 bg-gray-50 rounded-full border border-gray-200 hover:border-pink-200 hover:bg-pink-50"><Github className="w-4 h-4" /></a>
              <a href="#" className="hover:text-orange-600 transition-colors p-2 bg-gray-50 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div className="md:col-start-7 col-span-1 md:col-span-2">
            <h4 className="text-black font-bold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2 text-gray-600 font-medium text-xs">
              <li><a href="#" className="hover:text-purple-600 transition-colors">Student Management</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Exam Engine</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Analytics & Reports</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Teacher Portals</a></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-black font-bold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-gray-600 font-medium text-xs">
              <li><a href="#" className="hover:text-pink-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">Customer Stories</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">API Documentation</a></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-black font-bold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-gray-600 font-medium text-xs">
              <li><a href="#" className="hover:text-orange-600 transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Careers 🚀</a></li>
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
  const [loading, setLoading] = useState(true);

  // Initialize smooth scrolling physics
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
    
    if (loading) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [loading]);

  return (
    <div className="bg-[#FDFCF9] min-h-screen text-black font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-orange-500 origin-left z-50"
        style={{ scaleX }}
      />

      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {!loading && <CustomCursor />}
      
      <div className={loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}>
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
    </div>
  );
}
