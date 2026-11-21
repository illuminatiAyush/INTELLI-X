import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Sparkles,
  Search,
  Check,
  ChevronDown,
  Users,
  BarChart3,
  Bell,
  Shield,
  Layers,
  Calendar,
  Clock,
  Briefcase,
  HelpCircle,
  ExternalLink,
  Plus,
  Send,
  Eye,
  FileText,
  Mail,
  Zap,
  Flame,
  CheckCircle2,
  Filter,
  Sliders,
  Maximize2,
  Sun,
  Moon,
  X,
  MessageSquare,
  ChevronRight,
  Lock,
  Globe,
  GraduationCap,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './LandingPage.css';

// ── ROLLING TEXT HOVER ANIMATION (Text scrolls up, same text rolls in) ──
function RollText({ children, icon: Icon, className = "" }) {
  return (
    <span className={`roll-clip relative inline-block overflow-hidden h-[1.3em] leading-[1.3em] align-middle ${className}`}>
      <span className="roll-track flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1/2">
        <span className="roll-item inline-flex items-center gap-1.5 h-[1.3em]">
          <span>{children}</span>
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
        </span>
        <span className="roll-item inline-flex items-center gap-1.5 h-[1.3em]">
          <span>{children}</span>
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
        </span>
      </span>
    </span>
  );
}

// ── EXACT WORKLIST INTERACTIVE ASCII PIXEL FIELD ──
const ASCII_CHARS = " .·:-=+*#@";

function AsciiField({ hollow = 0.2, opacity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -9999, y: -9999, active: false };
    let width = 0;
    let height = 0;
    let animId = 0;
    let lastTime = 0;
    let isIntersecting = true;
    let lastScrollTime = -1e9;
    let asciiRgb = "255 255 255";
    const colorCache = new Map();

    const updateColor = () => {
      const root = canvas.closest('.landing-page-root') || document.documentElement;
      const isLight = root.classList.contains('light') || document.documentElement.classList.contains('light');
      const val = getComputedStyle(root).getPropertyValue("--ascii").trim();
      asciiRgb = val && val !== "" ? val : (isLight ? "35 35 40" : "255 255 255");
      colorCache.clear();
    };

    const getColor = (alpha) => {
      const key = Math.min(100, Math.max(0, Math.round(100 * alpha)));
      let col = colorCache.get(key);
      if (!col) {
        col = `rgb(${asciiRgb} / ${key / 100})`;
        colorCache.set(key, col);
      }
      return col;
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px ui-monospace, "Geist Mono", monospace';
      ctx.textBaseline = "top";
      const midX = width / 2;

      for (let y = 0; y < height; y += 13) {
        const rowFade = Math.max(0, 1 - y / (0.95 * height));
        for (let x = 0; x < width; x += 11) {
          const wave = (
            Math.sin(0.045 * x + 0.00045 * time) +
            Math.sin(0.07 * y - 0.00035 * time) +
            Math.sin((x - y) * 0.03 + 0.0006 * time)
          ) / 3;

          const hollowFactor = Math.min(1, Math.max(0, (Math.abs(x - midX) / midX - hollow) / 0.42));
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          // Large generous hover influence radius (180px)
          const mouseInfluence = distToMouse < 180 ? Math.pow(1 - distToMouse / 180, 1.1) : 0;

          // Intensity combines ambient wave, hollow layout, and bright hover illumination
          const intensity = ((wave + 1) / 2) * hollowFactor * rowFade + 0.85 * mouseInfluence;
          const charIndex = Math.min(ASCII_CHARS.length - 1, Math.floor(intensity * ASCII_CHARS.length));

          if (charIndex !== 0 || mouseInfluence > 0.04) {
            const finalCharIdx = Math.max(charIndex, mouseInfluence > 0.35 ? 6 : (mouseInfluence > 0.1 ? 3 : 1));
            const baseAlpha = 0.15 + (finalCharIdx / ASCII_CHARS.length) * 0.45;
            const hoverAlpha = 0.58 * mouseInfluence;
            const alpha = Math.min(0.98, baseAlpha + hoverAlpha);

            if (mouseInfluence > 0.05) {
              const root = canvas.closest('.landing-page-root') || document.documentElement;
              const isLight = root.classList.contains('light');
              const hue = Math.round(210 + mouseInfluence * 70 + (x / width) * 40) % 360;
              ctx.fillStyle = `hsl(${hue}, 90%, ${isLight ? 42 : 68}%)`;
            } else {
              ctx.fillStyle = getColor(alpha);
            }

            // Subtle dynamic push/displacement when mouse is near
            let posX = x;
            let posY = y;
            if (mouseInfluence > 0) {
              const angle = Math.atan2(y - mouse.y, x - mouse.x);
              const push = Math.sin(mouseInfluence * Math.PI) * 3.5;
              posX += Math.cos(angle) * push;
              posY += Math.sin(angle) * push;
            }

            ctx.fillText(ASCII_CHARS[finalCharIdx], posX, posY);
          }
        }
      }
    };

    const loop = (time) => {
      animId = requestAnimationFrame(loop);
      if (!isIntersecting) return;
      if (time - lastTime < 30 || time - lastScrollTime < 100) return;
      lastTime = time;
      draw(time);
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (width < 1 || height < 1) return;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.active = false;
    };

    const handleScroll = () => {
      lastScrollTime = performance.now();
    };

    updateColor();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
    });
    intersectionObserver.observe(canvas);

    handleResize();

    if (!prefersReducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
      window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
      animId = requestAnimationFrame(loop);
    } else {
      draw(0);
    }

    const rootEl = canvas.closest('.landing-page-root') || document.documentElement;
    const mutationObserver = new MutationObserver(() => {
      updateColor();
      draw(performance.now());
    });
    mutationObserver.observe(rootEl, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [hollow]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ opacity }}
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}

// ── EXACT WORKLIST DITHER PIXEL WORD ANIMATION (Orange -> Pink -> Blue -> Purple every 4s) ──
const DITHER_COLORS = ["#f5821f", "#ec4f86", "#3f6dff", "#7c5cff"];
const DITHER_STEPS = [0.75, 0.5, 0.25, 0];
const BAYER_8X8 = (() => {
  let mat = [[0]];
  while (mat.length < 8) {
    const len = mat.length;
    mat = Array.from({ length: 2 * len }, (_, r) =>
      Array.from({ length: 2 * len }, (_, c) =>
        4 * mat[r % len][c % len] + [0, 2, 3, 1][(r < len ? 0 : 2) + (c < len ? 0 : 1)]
      )
    );
  }
  return mat;
})();

function DitherWord({ children }) {
  const ref = useRef(null);
  const colorIndexRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let timer = 0;
    let opacity = 1;
    let isIntersecting = true;

    const render = () => {
      const w = Math.ceil(el.offsetWidth / 2);
      const h = Math.ceil(el.offsetHeight / 2);
      if (w < 1 || h < 1) return;
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = DITHER_COLORS[colorIndexRef.current];
      for (let y = 0; y < h; y++) {
        const rowRatio = (y + 0.5) / h;
        const threshold = (rowRatio < 0.4 ? 0.5 : rowRatio < 0.5 ? 0.75 : 1) * opacity;
        for (let x = 0; x < w; x++) {
          if ((BAYER_8X8[y % 8][x % 8] + 0.5) / 64 < threshold) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      el.style.backgroundImage = `url(${canvas.toDataURL()})`;
      el.style.webkitBackgroundClip = "text";
      el.style.backgroundClip = "text";
      el.style.webkitTextFillColor = "transparent";
      el.style.color = "transparent";
    };

    const cycle = () => {
      const steps = [...DITHER_STEPS, ...DITHER_STEPS.slice(0, -1).reverse(), 1];
      let stepIdx = 0;
      const step = () => {
        opacity = steps[stepIdx];
        if (stepIdx === DITHER_STEPS.length - 1) {
          colorIndexRef.current = (colorIndexRef.current + 1) % DITHER_COLORS.length;
        }
        if (!document.hidden && isIntersecting) {
          render();
        }
        stepIdx++;
        timer = window.setTimeout(stepIdx < steps.length ? step : cycle, stepIdx < steps.length ? 50 : 3800);
      };
      timer = window.setTimeout(step, 3800);
    };

    const ro = new ResizeObserver(render);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
    });
    io.observe(el);

    if (document.fonts?.ready) {
      document.fonts.ready.then(render);
    } else {
      render();
    }
    cycle();

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <span
      ref={ref}
      style={{ color: DITHER_COLORS[0] }}
      className="inline-block bg-clip-text [background-size:100%_100%] [image-rendering:pixelated] transition-opacity"
    >
      {children}
    </span>
  );
}

// ── EXACT WORKLIST FOOTER DOT WORDMARK (Bayer 4x4 Dither Matrix Canvas) ──
const BAYER_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

function DotWordmark({ text = "INTELLI-X" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let points = [];
    let width = 0;
    let height = 0;
    let pointer = null;
    let animFrame = 0;
    let active = true;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = Math.round(0.22 * width);
      if (!active || width < 1 || height < 1) {
        points = [];
        return;
      }

      canvas.style.height = `${height}px`;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Offscreen rasterization using official brand logo
      const logoImg = new Image();
      logoImg.src = "/intellix-wordmark-white.png";

      const rasterize = (img) => {
        const offCanvas = document.createElement("canvas");
        offCanvas.width = width;
        offCanvas.height = height;
        const offCtx = offCanvas.getContext("2d");
        if (!offCtx) return;

        let baselineY = height * 0.85;

        if (img && img.complete && img.naturalWidth > 0) {
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const targetW = Math.min(width * 0.94, height * imgAspect * 1.05);
          const targetH = targetW / imgAspect;
          const drawX = (width - targetW) / 2;
          const drawY = (height - targetH) / 2;
          offCtx.drawImage(img, drawX, drawY, targetW, targetH);
          baselineY = drawY + targetH;
        } else {
          const fontFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
          offCtx.font = `700 100px ${fontFamily}`;
          const fontSize = Math.min((100 * width) / offCtx.measureText(text).width, 1.45 * height);
          offCtx.font = `700 ${fontSize}px ${fontFamily}`;
          offCtx.textAlign = "center";
          offCtx.textBaseline = "alphabetic";
          baselineY = height - 0.72 * fontSize;
          offCtx.fillText(text, width / 2, height + 0.06 * fontSize);
        }

        const imgData = offCtx.getImageData(0, 0, width, height).data;
        points = [];
        for (let row = 0, y = 0; y < height; row++, y += 4) {
          for (let col = 0, x = 0; x < width; col++, x += 4) {
            const pixelAlpha = imgData[(Math.floor(y + 2) * width + Math.floor(x + 2)) * 4 + 3];
            if (pixelAlpha > 120) {
              points.push({
                x,
                y,
                t: Math.max(0, (y - (height * 0.2)) / (height * 0.8)),
                b: BAYER_4X4[(row % 4) * 4 + (col % 4)]
              });
            }
          }
        }
        render();
      };

      if (logoImg.complete && logoImg.naturalWidth > 0) {
        rasterize(logoImg);
      } else {
        logoImg.onload = () => rasterize(logoImg);
        rasterize(null);
      }
    };

    const render = () => {
      const rootEl = canvas.closest('.landing-page-root') || document.documentElement;
      const comp = getComputedStyle(rootEl);
      const baseColor = comp.getPropertyValue("--wm-base").trim() || "#27272a";
      const inkColor = comp.getPropertyValue("--wm-ink").trim() || "#60a5fa";

      ctx.clearRect(0, 0, width, height);

      for (const p of points) {
        const threshold = p.t < 0.3 ? 1 : 1 - ((p.t - 0.3) / 0.7) * 0.85;
        const mouseDist = pointer ? Math.max(0, 1 - Math.hypot(p.x - pointer.x, p.y - pointer.y) / 160) : 0;

        if (mouseDist > 0 && p.b < 1.3 * mouseDist) {
          const hue = Math.round((p.x / width) * 280 + (pointer ? (pointer.x + pointer.y) * 0.35 : 0)) % 360;
          ctx.fillStyle = `hsl(${hue}, 95%, 62%)`;
          ctx.fillRect(p.x, p.y, 4, 4);
        } else if (p.b < threshold) {
          ctx.fillStyle = baseColor;
          ctx.fillRect(p.x, p.y, 4, 4);
        }
      }
    };

    const scheduleRender = () => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(render);
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      scheduleRender();
    };

    const onPointerLeave = () => {
      pointer = null;
      scheduleRender();
    };

    const resizeObserver = new ResizeObserver(setup);
    resizeObserver.observe(canvas);

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const rootEl = canvas.closest('.landing-page-root') || document.documentElement;
    const mutationObserver = new MutationObserver(render);
    mutationObserver.observe(rootEl, { attributes: true, attributeFilter: ['class'] });

    if (document.fonts?.ready) {
      document.fonts.ready.then(setup);
    }

    return () => {
      active = false;
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block w-full cursor-crosshair"
    />
  );
}

// ── FLOATING NAVBAR WITH DARK/LIGHT TOGGLE & LANGUAGE DROPDOWN ──
const Navbar = ({ isDark, setIsDark, toggleTheme }) => {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef(null);

  const handleToggle = toggleTheme || (() => setIsDark && setIsDark(!isDark));

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'HI', label: 'हिन्दी' },
    { code: 'ES', label: 'Español' },
    { code: 'FR', label: 'Français' },
    { code: 'DE', label: 'Deutsch' }
  ];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[var(--wl-bg)]/85 backdrop-blur-md border-b border-[var(--wl-line)] shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between gap-4">
        {/* Brand: Official IntelliX Wordmark */}
        <Link to="/" className="flex items-center group py-1" aria-label="IntelliX">
          <img
            src={isDark ? "/intellix-wordmark-white.png" : "/intellix-wordmark-black.png"}
            alt="IntelliX"
            className="h-6 sm:h-7 w-auto object-contain transition-opacity duration-200"
          />
        </Link>

        {/* Center Pill Menu (Exact Worklist 5-Item Pill) */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-[var(--wl-surface-2)]/90 border border-[var(--wl-line)] p-1 shadow-xs backdrop-blur-xs">
          <a href="#search-dir" className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[var(--wl-muted)] hover:text-[var(--wl-fg)] transition-colors">
            How it works
          </a>
          <a href="#proof-demo" className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[var(--wl-muted)] hover:text-[var(--wl-fg)] transition-colors">
            Live demo
          </a>
          <a href="#pricing" className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[var(--wl-muted)] hover:text-[var(--wl-fg)] transition-colors">
            Pricing
          </a>
          <a href="#batches" className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[var(--wl-muted)] hover:text-[var(--wl-fg)] transition-colors">
            Batches
          </a>
          <a href="#faq" className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[var(--wl-muted)] hover:text-[var(--wl-fg)] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Auth Actions: Language Selector, Theme Switcher, Sign in, CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[var(--wl-muted)] hover:text-[var(--wl-fg)] hover:bg-[var(--wl-surface-2)] transition-colors"
              aria-label="Select language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{selectedLang}</span>
              <ChevronDown className="w-3 h-3 text-[var(--wl-faint)]" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] p-1.5 shadow-xl z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setSelectedLang(l.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedLang === l.code
                        ? 'bg-blue-500/10 text-blue-500 font-semibold'
                        : 'text-[var(--wl-muted)] hover:bg-[var(--wl-surface-2)] hover:text-[var(--wl-fg)]'
                    }`}
                  >
                    <span>{l.label}</span>
                    {selectedLang === l.code && <Check className="w-3 h-3 text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ☀️ / 🌙 THEME TOGGLE (Exact Worklist Button Spec) */}
          <button
            onClick={handleToggle}
            aria-label="Switch between light and dark theme"
            className="grid size-8 place-items-center rounded-lg text-[var(--wl-muted)] transition-colors hover:bg-[var(--wl-surface-2)] hover:text-[var(--wl-fg)] border border-[var(--wl-line)]"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <Link
            to="/login"
            className="hidden sm:inline-flex text-[13px] font-medium text-[var(--wl-muted)] hover:text-[var(--wl-fg)] px-2 py-1 transition-colors"
          >
            Sign in
          </Link>

          <Link to="/register">
            <button
              type="button"
              className="group relative overflow-hidden wl-btn wl-btn-primary h-9 rounded-[10px] px-4 text-[13px] inline-flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_22px_rgba(59,130,246,0.5)] transition-all cursor-pointer"
            >
              <RollText icon={ArrowRight}>Get started</RollText>
            </button>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden grid size-8 place-items-center rounded-lg text-[var(--wl-muted)] hover:bg-[var(--wl-surface-2)] hover:text-[var(--wl-fg)] border border-[var(--wl-line)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--wl-line)] bg-[var(--wl-bg)] px-4 py-3 space-y-2">
          <div className="pb-2 border-b border-[var(--wl-line)] flex items-center justify-between">
            <img
              src={isDark ? "/intellix-wordmark-white.png" : "/intellix-wordmark-black.png"}
              alt="IntelliX"
              className="h-5.5 w-auto object-contain"
            />
          </div>
          <a
            href="#search-dir"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-[var(--wl-fg)] hover:bg-[var(--wl-surface-2)] rounded-lg"
          >
            How it works
          </a>
          <a
            href="#proof-demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-[var(--wl-fg)] hover:bg-[var(--wl-surface-2)] rounded-lg"
          >
            Live demo
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-[var(--wl-fg)] hover:bg-[var(--wl-surface-2)] rounded-lg"
          >
            Pricing
          </a>
          <a
            href="#batches"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-[var(--wl-fg)] hover:bg-[var(--wl-surface-2)] rounded-lg"
          >
            Batches
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-[var(--wl-fg)] hover:bg-[var(--wl-surface-2)] rounded-lg"
          >
            FAQ
          </a>
          <div className="pt-2 border-t border-[var(--wl-line)] flex items-center justify-between">
            <button
              onClick={handleToggle}
              className="flex items-center gap-2 text-xs text-[var(--wl-muted)] hover:text-[var(--wl-fg)] px-2.5 py-1.5 rounded-lg border border-[var(--wl-line)] bg-[var(--wl-surface)]"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-[var(--wl-muted)] px-2">
                Sign in
              </Link>
              <Link to="/register">
                <button className="group relative overflow-hidden wl-btn wl-btn-primary h-8 px-3 text-xs rounded-lg inline-flex items-center justify-center">
                  <RollText icon={ArrowRight}>Get started</RollText>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// ── HERO SECTION: Dynamic Interactive AsciiField + Preview Card ──
const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Interactive AsciiField Background Layer */}
      <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
        <AsciiField hollow={0.16} opacity={0.95} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Banner Pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wl-line)] bg-[var(--wl-surface)]/80 px-3.5 py-1.5 text-[12px] text-[var(--wl-muted)] backdrop-blur-sm mb-7 shadow-xs">
          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-500">New</span>
          <span className="rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold px-1.5 py-0.2">Y</span>
          <span>900+ Institutes switched to Intelli-X. See results →</span>
        </div>

        {/* Display H1 - Cormorant upright with Newsreader italic accent */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[var(--wl-fg)] leading-[1.08] max-w-3xl mx-auto">
          Don't just run classes.<br />
          <span className="text-[var(--wl-muted)]">Show the </span>
          <DitherWord>
            <span className="font-editorial-italic">results.</span>
          </DitherWord>
        </h1>

        {/* Light Montserrat 300 Subtext */}
        <p className="mt-6 text-base sm:text-lg text-[var(--wl-muted)] max-w-2xl mx-auto leading-relaxed">
          Intelli-X searches 90,000+ sessions, evaluates tests, logs attendance, and sends verifiable proof of progress to parents and management.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <button
              type="button"
              className="group relative overflow-hidden wl-btn wl-btn-primary h-11 rounded-[11px] px-6 text-[14px] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_28px_rgba(59,130,246,0.55)] transition-all cursor-pointer"
            >
              <RollText icon={ArrowRight}>Get started</RollText>
            </button>
          </Link>
          <a href="#proof-demo">
            <button
              type="button"
              className="group relative overflow-hidden wl-btn wl-btn-secondary h-11 rounded-[11px] px-6 text-[14px] hover:border-zinc-500/60 hover:shadow-[0_0_15px_rgba(255,255,255,0.06)] transition-all cursor-pointer"
            >
              <RollText>Try the live demo</RollText>
            </button>
          </a>
        </div>

        {/* Microcopy reassurance */}
        <p className="mt-4 text-[12px] text-[var(--wl-faint)]">
          Free to start · Instant setup for schools, coaching batches & academies
        </p>

        {/* Hero Interactive Preview Card */}
        <div className="mt-14 mx-auto max-w-4xl text-left">
          <div className="rounded-2xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-3 sm:p-5 shadow-2xl relative overflow-hidden">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between border-b border-[var(--wl-line)] pb-4 mb-4 gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={isDark ? "/intellix-wordmark-white.png" : "/intellix-wordmark-black.png"}
                  alt="IntelliX"
                  className="h-4 sm:h-5 w-auto object-contain"
                />
                <span className="rounded-md bg-[var(--wl-surface-2)] px-2 py-0.5 text-[11px] text-[var(--wl-muted)] font-medium">Workspace</span>
                <span className="text-[12px] text-[var(--wl-faint)]">Sessions</span>
                <span className="text-[12px] text-[var(--wl-faint)]">Attendance</span>
                <span className="text-[12px] text-[var(--wl-faint)]">Proofs <span className="rounded-full bg-blue-500/20 px-1.5 py-0.2 text-blue-500 text-[10px]">6</span></span>
              </div>
              <div className="flex items-center gap-2">
                <button className="wl-btn wl-btn-primary h-7 px-3 text-[12px] rounded-lg">
                  <Sparkles className="w-3 h-3" />
                  <span>Sync batches</span>
                </button>
              </div>
            </div>

            {/* Content preview split */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--wl-fg)]">Matched Sessions & Lectures</span>
                  <span className="text-[11px] text-[var(--wl-faint)]">Synced 8m ago</span>
                </div>
                {/* Row 1 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] hover:border-blue-500/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                      P
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[var(--wl-fg)]">Advanced Physics · Section A</div>
                      <div className="text-[11px] text-[var(--wl-faint)]">Prof. R. Sharma · Room 302</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-500 font-medium">✓ Proof ready</span>
                    <span className="text-[11px] text-[var(--wl-faint)]">2h ago</span>
                  </div>
                </div>
                {/* Row 2 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] hover:border-blue-500/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                      C
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[var(--wl-fg)]">Organic Chemistry & Mechanisms</div>
                      <div className="text-[11px] text-[var(--wl-faint)]">Dr. Priya Verma · Lab 4</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] text-blue-500 font-medium">96% score</span>
                    <span className="text-[11px] text-[var(--wl-faint)]">4h ago</span>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="rounded-xl bg-[var(--wl-surface-2)] p-3 border border-[var(--wl-line)] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--wl-fg)] mb-2">Faculty Summary</div>
                  <div className="space-y-1.5 text-xs text-[var(--wl-muted)]">
                    <div className="flex justify-between py-1 border-b border-[var(--wl-line)]">
                      <span>Active Lectures</span>
                      <span className="font-mono text-[var(--wl-fg)]">24</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--wl-line)]">
                      <span>Evaluations Sent</span>
                      <span className="font-mono text-emerald-500 font-semibold">18</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Pending Proofs</span>
                      <span className="font-mono text-blue-500 font-semibold">6</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--wl-line)]">
                  <div className="text-[11px] text-[var(--wl-faint)] flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time portal connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 1: SEARCH DIRECTORY + 4 STAT CARDS (Screenshot 1: 8383601c.jpg) ──
const SearchDirectorySection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('All');
  const searchInputRef = useRef(null);

  const allBatches = [
    { title: 'JEE Advanced 2026 · Batch Alpha', wing: 'Apex Wing · Prof. Sharma', mode: 'Offline · Room 401', color: 'bg-indigo-600', icon: 'JEE' },
    { title: 'NEET UG Medical · Target Batch', wing: 'Medical Wing · Dr. Priya', mode: 'Hybrid · Hall B', color: 'bg-emerald-600', icon: 'NEET' },
    { title: 'Foundation Class 10 · Mathematics', wing: 'Olympiad Division · Room 102', mode: 'Offline · Room 102', color: 'bg-blue-600', icon: 'CBSE' },
    { title: 'CUET + Board Exam Mastery', wing: 'Senior Secondary · Lab 2', mode: 'Hybrid · Lab 2', color: 'bg-orange-600', icon: 'CUET' },
    { title: 'Commerce & Accounts Pro', wing: 'CA Foundation Wing · Room 204', mode: 'Offline · Room 204', color: 'bg-slate-700', icon: 'CA' },
    { title: 'Data Science & AI for Juniors', wing: 'Tech Academy · Online Campus', mode: 'Online · Live', color: 'bg-amber-600', icon: 'AI' }
  ];

  // ⌘K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredBatches = allBatches.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.wing.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMode === 'All' || b.mode.toLowerCase().includes(filterMode.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <section id="search-dir" className="py-20 border-t border-[var(--wl-line)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            Every batch, student & exam,<br />
            <span className="text-[var(--wl-muted)]">one search.</span>
          </h2>
          <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
            Look up any student roll number, faculty timetable, fee installment, or test paper across all your institute branches in milliseconds.
          </p>
        </div>

        {/* Directory Card with Exact Interactive AsciiField Inside */}
        <div className="relative rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] overflow-hidden shadow-2xl">
          {/* Background Interactive ASCII pixels inside the card */}
          <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
            <AsciiField hollow={0.1} opacity={0.85} />
          </div>

          <div className="relative z-10 p-6 sm:p-10">
            {/* Search Box with ⌘K & Filter Pills */}
            <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--wl-line)] bg-[var(--wl-surface)]/95 p-3 sm:p-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-3 border-b border-[var(--wl-line)] pb-3">
                <Search className="w-5 h-5 text-[var(--wl-faint)]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search batches, roll numbers, subjects, or press ⌘K..."
                  className="flex-1 bg-transparent text-sm sm:text-base text-[var(--wl-fg)] placeholder-[var(--wl-faint)] outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-xs text-[var(--wl-faint)] hover:text-[var(--wl-fg)]">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd
                  onClick={() => searchInputRef.current?.focus()}
                  className="hidden sm:inline-flex items-center gap-1 rounded bg-[var(--wl-surface-2)] px-2 py-1 font-mono text-[11px] text-[var(--wl-muted)] border border-[var(--wl-line)] cursor-pointer hover:border-blue-500/50"
                >
                  ⌘K
                </kbd>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center gap-1.5 pt-3">
                <span className="text-[11px] text-[var(--wl-faint)] mr-1">Filter:</span>
                {['All', 'Offline', 'Hybrid', 'Online'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterMode(f)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                      filterMode === f
                        ? 'bg-blue-500 text-white shadow-xs'
                        : 'bg-[var(--wl-surface-2)] text-[var(--wl-muted)] hover:text-[var(--wl-fg)] border border-[var(--wl-line)]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Rows */}
              <div className="mt-4 space-y-2">
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-[var(--wl-surface-2)] p-3 border border-[var(--wl-line)] hover:border-blue-500/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center font-bold text-xs text-white shadow-xs`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-[var(--wl-fg)]">{item.title}</div>
                          <div className="text-[11px] text-[var(--wl-faint)]">{item.wing}</div>
                        </div>
                      </div>
                      <span className="rounded-md bg-[var(--wl-surface)] px-2.5 py-1 text-[11px] text-[var(--wl-muted)] border border-[var(--wl-line)]">
                        {item.mode}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-[var(--wl-faint)]">
                    No batches match "{searchTerm}". Try a different batch name or subject.
                  </div>
                )}
              </div>

              {/* Logo Pile Footer */}
              <div className="mt-4 pt-3 border-t border-[var(--wl-line)] flex items-center justify-between text-xs text-[var(--wl-faint)]">
                <div className="flex items-center -space-x-1.5">
                  {['JEE', 'NEET', 'CBSE', 'ICSE', 'CA', 'IB'].map((char, i) => (
                    <div key={i} className="w-7 h-6 rounded-md bg-[var(--wl-surface-2)] border border-[var(--wl-surface)] flex items-center justify-center font-mono text-[8px] font-bold text-[var(--wl-muted)]">
                      {char}
                    </div>
                  ))}
                  <span className="pl-3 text-[11px] text-[var(--wl-muted)] font-mono">+120 Syllabi</span>
                </div>
                <span className="text-[11px] text-[var(--wl-faint)]">Live synchronized</span>
              </div>
            </div>
          </div>

          {/* 4 Bottom Metric Stat Cards */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 border-t border-[var(--wl-line)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--wl-line)] bg-[var(--wl-surface-2)]/90 backdrop-blur-xs">
            <div className="p-6 text-left">
              <div className="text-2xl sm:text-3xl font-normal text-[var(--wl-fg)] tracking-tight">50,000+</div>
              <div className="mt-1 text-xs text-[var(--wl-faint)]">students managed daily</div>
            </div>
            <div className="p-6 text-left">
              <div className="text-2xl sm:text-3xl font-normal text-[var(--wl-fg)] tracking-tight">1,200+</div>
              <div className="mt-1 text-xs text-[var(--wl-faint)]">coaching centers & branches</div>
            </div>
            <div className="p-6 text-left">
              <div className="text-2xl sm:text-3xl font-normal text-[var(--wl-fg)] tracking-tight">99.8%</div>
              <div className="mt-1 text-xs text-[var(--wl-faint)]">on-time fee collection rate</div>
            </div>
            <div className="p-6 text-left">
              <div className="text-2xl sm:text-3xl font-normal text-[var(--wl-fg)] tracking-tight">100%</div>
              <div className="mt-1 text-xs text-[var(--wl-faint)]">automated attendance & report cards</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 2: KANBAN PIPELINE BOARD + 4 BOTTOM ICONS (Screenshot 2: 44d8d106.jpg) ──
const KanbanPipelineSection = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCard, setSelectedCard] = useState(null);

  const columns = [
    {
      id: 'Inquiries',
      title: 'Inquiries',
      dotColor: 'bg-blue-500',
      count: 6,
      cards: [
        { id: 1, title: 'Aarav Sharma · JEE 2026', company: 'Apex Wing · JEE Prep', char: 'A', color: 'bg-blue-600 text-white', msg: 'Website lead form submitted', time: 'Nov 4, 10:33 AM', notes: 'Interested in 2-year classroom program. Parent phone verified.' },
        { id: 2, title: 'Rohan Gupta · NEET Dropper', company: 'Medical Wing · Biology', char: 'R', color: 'bg-emerald-600 text-white', msg: 'WhatsApp inquiry received', time: 'Nov 3, 6:12 PM', notes: 'Requested fee structure for Medical Target Batch B.' }
      ]
    },
    {
      id: 'Demo Class',
      title: 'Demo Class',
      dotColor: 'bg-amber-500',
      count: 2,
      cards: [
        { id: 3, title: 'Ananya Patel · Class 10 NTSE', company: 'Olympiad Division', char: 'A', color: 'bg-amber-600 text-white', msg: 'Demo: Thursday 4pm (Room 204)', time: 'Nov 2, 4:05 PM', comments: 2, notes: 'Demo lecture with Prof. Verma. SMS reminder sent to parents.' },
        { id: 4, title: 'Sneha Reddy · Class 12 Boards', company: 'Senior Secondary PCM', char: 'S', color: 'bg-purple-600 text-white', msg: 'Attended demo · Highly satisfied', time: 'Oct 30, 11:20 AM', notes: 'Parent requested scholarship admission test.' }
      ]
    },
    {
      id: 'Enrolled',
      title: 'Enrolled',
      dotColor: 'bg-emerald-500',
      count: 1,
      cards: [
        { id: 5, title: 'Kabir Mehta · JEE Advanced Alpha', company: 'Batch A · Enrolled', char: 'K', color: 'bg-indigo-600 text-white', msg: 'Fee installment 1 paid (₹25,000)', time: 'Oct 28, 9:41 AM', comments: 3, notes: 'Admission confirmed. RFID card & student portal issued.' }
      ]
    },
    {
      id: 'Follow-up',
      title: 'Follow-up',
      dotColor: 'bg-rose-500',
      count: 3,
      cards: [
        { id: 6, title: 'Tanvi Deshmukh · Class 9', company: 'Junior Wing · Foundation', char: 'T', color: 'bg-rose-600 text-white', msg: 'Requested 3 days for decision', time: 'Oct 26, 2:15 PM', notes: 'Counseling call scheduled for Saturday.' },
        { id: 7, title: 'Ishan Verma · Commerce Class 12', company: 'CA Foundation Wing', char: 'I', color: 'bg-orange-600 text-white', msg: 'Pending parent consultation', time: 'Oct 24, 5:50 PM', notes: 'Follow-up reminder drafted for batch intake.' }
      ]
    }
  ];

  const visibleColumns = activeTab === 'All' ? columns : columns.filter(c => c.id === activeTab);

  return (
    <section id="kanban" className="py-20 border-t border-[var(--wl-line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            From student inquiry<br />
            <span className="text-[var(--wl-muted)]">to enrollment.</span>
          </h2>
          <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
            Capture inquiries, schedule demo classes, collect fees, and track admissions on one automated Kanban pipeline.
          </p>
        </div>

        {/* Board Container */}
        <div className="rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-4 sm:p-6 shadow-2xl">
          {/* Top Interactive Tab Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('All')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'All'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[var(--wl-surface-2)] text-[var(--wl-muted)] hover:text-[var(--wl-fg)] border border-[var(--wl-line)]'
              }`}
            >
              All Columns
            </button>
            {columns.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activeTab === c.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-[var(--wl-surface-2)] text-[var(--wl-muted)] hover:text-[var(--wl-fg)] border border-[var(--wl-line)]'
                }`}
              >
                {c.title} {c.count}
              </button>
            ))}
          </div>

          {/* Columns */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${visibleColumns.length > 2 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4`}>
            {visibleColumns.map((col) => (
              <div key={col.id} className="rounded-2xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--wl-muted)]">
                  <div className="flex items-center gap-2 font-medium">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="text-[var(--wl-fg)]">{col.title}</span>
                  </div>
                  <span className="rounded-full bg-[var(--wl-surface)] px-2 py-0.5 text-[10px] font-mono text-[var(--wl-muted)] border border-[var(--wl-line)]">
                    {col.count}
                  </span>
                </div>

                {col.cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className="rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] p-3 space-y-2 hover:border-blue-500/50 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-md ${card.color} font-bold text-[10px] flex items-center justify-center`}>
                        {card.char}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--wl-fg)]">{card.title}</div>
                        <div className="text-[10px] text-[var(--wl-faint)]">{card.company}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--wl-muted)] flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[var(--wl-faint)]" />
                      <span>{card.msg}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--wl-faint)]">
                      <span>{card.time}</span>
                      {card.comments && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-[var(--wl-faint)]" />
                          <span>{card.comments}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Drawer when a Card is Clicked */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-2xl bg-[var(--wl-surface)] border border-[var(--wl-line)] p-6 shadow-2xl space-y-4">
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 text-[var(--wl-faint)] hover:text-[var(--wl-fg)]"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedCard.color} font-bold text-sm flex items-center justify-center`}>
                  {selectedCard.char}
                </div>
                <div>
                  <h3 className="text-base font-semibold font-geist text-[var(--wl-fg)]">{selectedCard.title}</h3>
                  <div className="text-xs text-[var(--wl-muted)]">{selectedCard.company}</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--wl-surface-2)] text-xs text-[var(--wl-muted)] space-y-1">
                <div className="font-semibold text-[var(--wl-fg)]">Latest Event:</div>
                <div>{selectedCard.msg}</div>
                <div className="text-[11px] text-[var(--wl-faint)]">{selectedCard.time}</div>
              </div>
              <div className="text-xs text-[var(--wl-muted)]">
                <strong>Internal Note:</strong> {selectedCard.notes}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="wl-btn wl-btn-primary flex-1 h-9 text-xs rounded-lg"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4 Bottom Feature Blocks */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--wl-surface)] border border-[var(--wl-line)] flex items-center justify-center shrink-0 text-blue-500">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--wl-fg)]">Intake</div>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Multi-Channel CRM: Automatically collect student leads from website, walk-ins, Justdial & WhatsApp into one board.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--wl-surface)] border border-[var(--wl-line)] flex items-center justify-center shrink-0 text-emerald-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--wl-fg)]">Schedule</div>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Automated Demo Booking: Send instant calendar invites, room allocations, and reminder WhatsApp alerts to parents.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--wl-surface)] border border-[var(--wl-line)] flex items-center justify-center shrink-0 text-purple-500">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--wl-fg)]">Collect</div>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Instant Fee Reminders: One-click UPI, card, and net-banking payment links with automated GST tax receipts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--wl-surface)] border border-[var(--wl-line)] flex items-center justify-center shrink-0 text-amber-500">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--wl-fg)]">Track</div>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Student Lifecycle CRM: Track attendance, chapter test scores, and parent interactions from admission to board exams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 3: ROLE TICKER + BEFORE/AFTER SPLIT COMPARISON (Screenshot 3: de81365f.png) ──
const ProofRoleAndSplitComparison = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const [roles, setRoles] = useState([
    { name: 'JEE Advanced (Physics)', checked: true, color: 'bg-blue-600' },
    { name: 'NEET UG (Biology)', checked: true, color: 'bg-emerald-600' },
    { name: 'Class 10 CBSE Math', checked: true, color: 'bg-amber-600' },
    { name: 'Organic Mechanisms', checked: false, color: 'bg-purple-600' },
    { name: 'Calculus & Vectors', checked: true, color: 'bg-indigo-600' },
    { name: 'CA Foundation Accounts', checked: false, color: 'bg-rose-600' },
    { name: 'CUET General Test', checked: false, color: 'bg-cyan-600' },
    { name: 'NTSE Mental Ability', checked: true, color: 'bg-teal-600' },
    { name: 'Computer Science (Python)', checked: false, color: 'bg-slate-700' },
    { name: 'Class 12 Boards PCM', checked: false, color: 'bg-fuchsia-600' },
    { name: 'Medical Dropper Batch', checked: true, color: 'bg-emerald-600' },
    { name: 'Olympiad Foundation', checked: false, color: 'bg-amber-600' }
  ]);

  const toggleRole = (index) => {
    setRoles((prev) =>
      prev.map((r, i) => (i === index ? { ...r, checked: !r.checked } : r))
    );
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  const handlePointerDown = () => {
    isDragging.current = true;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <section className="relative py-20 border-t border-[var(--wl-line)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
        <AsciiField hollow={0.22} opacity={0.65} />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            Automated scorecards for<br />
            <span className="text-[var(--wl-muted)]">every stream & subject.</span>
          </h2>
          <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
            Engineering, Medical, Commerce, Foundations, Boards. Pick your syllabus and generate chapter-level proof of accuracy that parents trust.
          </p>
        </div>

        {/* Interactive Stream Pills Matrix */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mb-20">
          {roles.map((r, i) => (
            <button
              key={i}
              onClick={() => toggleRole(i)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                r.checked
                  ? `${r.color} text-white border-transparent shadow-xs`
                  : 'bg-[var(--wl-surface)] text-[var(--wl-muted)] border-[var(--wl-line)] hover:border-blue-500/40 hover:text-[var(--wl-fg)]'
              }`}
            >
              {r.checked && <Check className="w-3 h-3 text-white" />}
              <span>{r.name}</span>
            </button>
          ))}
        </div>

        {/* Middle Header for Split Report */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            Parents ignore fifty generic SMS blasts a month.<br />
            <span className="text-[var(--wl-muted)]">One clear report card wins their trust.</span>
          </h2>
          <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
            Institutes blast hundreds of vague messages that get ignored. An interactive report showing exact chapter accuracy, attendance, and rank gets read and shared.
          </p>
        </div>

        {/* Split Comparison Card Container with Vivid Multi-Colored Callout Tags */}
        <div className="relative mx-auto max-w-4xl">
          {/* Curved label on top-left: BEFORE */}
          <div className="absolute -top-7 left-4 text-xs font-mono font-bold tracking-widest text-rose-500 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>BEFORE (GENERIC COACHING NOTICE)</span>
          </div>

          {/* Interactive Split Card */}
          <div
            ref={containerRef}
            className="relative h-[420px] rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] overflow-hidden select-none shadow-2xl"
          >
            {/* Left Side: Before Report */}
            <div className="absolute inset-0 p-6 sm:p-10 bg-[var(--wl-surface)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">The usual generic SMS</span>
                <div className="mt-4 text-base sm:text-xl font-medium text-[var(--wl-muted)]">
                  Notice: Monthly Test Attendance & Marks
                </div>
                <div className="mt-4 text-xs sm:text-sm text-[var(--wl-faint)] leading-relaxed max-w-sm">
                  Dear Parent,<br /><br />
                  Your ward was present in class and scored 62/100 in Physics test. Please deposit the outstanding fee balance of ₹12,000 at the counter soon...
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs text-rose-400">
                  <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Monthly_Notice_Scanned.pdf</span>
                </div>
              </div>
            </div>

            {/* Right Side: Clipped Overlaid Intelli-X Student Proof */}
            <div
              className="absolute inset-0 p-6 sm:p-10 bg-[var(--wl-surface-2)] flex flex-col justify-between border-l border-blue-500/60"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Read by parent · 98% open rate
                  </span>
                  <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 text-[10px] text-blue-400 font-bold">Rank #3 in Batch</span>
                </div>
                <div className="mt-4 text-base sm:text-xl font-medium text-[var(--wl-fg)]">
                  Subject: Aarav scored 92% in Thermodynamics (+18% growth)
                </div>
                <div className="mt-4 text-xs sm:text-sm text-[var(--wl-muted)] leading-relaxed max-w-sm">
                  Dear Mr. Sharma,<br /><br />
                  Aarav solved 45/50 questions correctly today. His accuracy in numerical problems reached 94%. Tap below to view full test scorecard & teacher remarks.
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs text-white font-medium shadow-md hover:bg-blue-700 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>intelli-x.in/r/aarav-12a · Live scorecard</span>
                </div>
              </div>
            </div>

            {/* Draggable Vertical Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 cursor-ew-resize z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
              onPointerDown={handlePointerDown}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-xl text-white text-xs font-mono font-bold">
                |||
              </div>
            </div>
          </div>

          {/* Left Rose/Crimson Callout Pills */}
          <div className="hidden lg:block absolute -left-36 top-16 space-y-16 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/15 border border-rose-500/35 px-3 py-1 text-[11px] text-rose-400 font-semibold shadow-xs">Vague mark summary</span>
              <div className="w-8 h-px bg-rose-500/40" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/15 border border-rose-500/35 px-3 py-1 text-[11px] text-rose-400 font-semibold shadow-xs">No topic breakdown</span>
              <div className="w-8 h-px bg-rose-500/40" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/15 border border-amber-500/35 px-3 py-1 text-[11px] text-amber-400 font-semibold shadow-xs">Fee nag without proof</span>
              <div className="w-8 h-px bg-amber-500/40" />
            </div>
          </div>

          {/* Right Emerald/Blue/Purple Callout Pills */}
          <div className="hidden lg:block absolute -right-36 top-16 space-y-16 pointer-events-none">
            <div className="flex items-center gap-2 justify-end">
              <div className="w-8 h-px bg-emerald-500/40" />
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/35 px-3 py-1 text-[11px] text-emerald-400 font-semibold shadow-xs">Topic-level accuracy</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-8 h-px bg-blue-500/40" />
              <span className="rounded-full bg-blue-500/15 border border-blue-500/35 px-3 py-1 text-[11px] text-blue-400 font-semibold shadow-xs">Shows student progress</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-8 h-px bg-purple-500/40" />
              <span className="rounded-full bg-purple-500/15 border border-purple-500/35 px-3 py-1 text-[11px] text-purple-400 font-semibold shadow-xs">Interactive parent portal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 4: MACOS PROOF WINDOW + ACTIVITY SIDEBAR (Screenshot 4: 6ee77eaa.png) ──
const ProofWindowSection = () => {
  const [activeTab, setActiveTab] = useState('Academics');
  const [sentStatus, setSentStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailText, setEmailText] = useState(
    "Dear Mr. Sharma, Aarav scored top rank in today's mock test with 92% accuracy. View his scorecard & teacher remarks: intelli-x.app/r/aarav-12a"
  );

  const tabData = {
    Academics: {
      role: 'Head of Academics',
      heading: 'Batch 12-A · Weekly Physics & Chemistry Test Distribution',
      companies: [
        { name: 'Aarav Sharma', title: 'Roll #1042 · AIR Rank 45', badge: 'Top 1% in Thermodynamics', char: 'A', color: 'bg-blue-600' },
        { name: 'Priya Verma', title: 'Roll #1058 · AIR Rank 82', badge: '98% Accuracy in Mechanisms', char: 'P', color: 'bg-purple-600' },
        { name: 'Rohan Gupta', title: 'Roll #1089 · AIR Rank 120', badge: '+24 marks growth in 3 weeks', char: 'R', color: 'bg-emerald-600' }
      ]
    },
    Attendance: {
      role: 'Dean of Student Welfare',
      heading: 'Biometric & RFID Logs · Daily Attendance Overview (98.4%)',
      companies: [
        { name: 'Morning Batch Alpha', title: 'Room 401 · Prof. Sharma', badge: '98.2% present (2 alerted)', char: 'M', color: 'bg-amber-600' },
        { name: 'Evening Medical Wing', title: 'Hall B · Dr. Verma', badge: '100% present · Zero leaves', char: 'E', color: 'bg-emerald-600' },
        { name: 'Foundation Class 10', title: 'Room 102 · Olympiad', badge: '96.5% present (SMS sent)', char: 'F', color: 'bg-blue-600' }
      ]
    },
    'Fee Collection': {
      role: 'Chief Accounts Officer',
      heading: 'Automated Fee Installments & UPI Settlement Engine',
      companies: [
        { name: 'Tuition Installment #2', title: 'Batch 12-A · 32 Students', badge: '₹4,80,000 collected via UPI', char: 'T', color: 'bg-emerald-600' },
        { name: 'Scholarship Tier A', title: 'Olympiad Wing · 14 Students', badge: '100% cleared · Receipts issued', char: 'S', color: 'bg-indigo-600' },
        { name: 'Pending Reminders', title: 'Due today · 4 Students', badge: 'Automated WhatsApp sent at 9am', char: 'P', color: 'bg-rose-600' }
      ]
    }
  };

  const handleSend = () => {
    setSentStatus('sending');
    setTimeout(() => {
      setSentStatus('sent');
      setTimeout(() => setSentStatus(false), 3500);
    }, 800);
  };

  const current = tabData[activeTab];

  return (
    <section id="proof-demo" className="py-20 border-t border-[var(--wl-line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            This is what<br />
            <span className="text-[var(--wl-muted)]">parents & educators see.</span>
          </h2>
          <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
            Switch between student analytics, batch attendance, and fee recovery. Real-time verification links that parents can open on any phone.
          </p>
        </div>

        {/* Interactive Tab pills */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { id: 'Academics', icon: GraduationCap },
            { id: 'Attendance', icon: Clock },
            { id: 'Fee Collection', icon: CreditCard }
          ].map(({ id: tab, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[var(--wl-surface)] text-[var(--wl-muted)] hover:text-[var(--wl-fg)] border border-[var(--wl-line)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* macOS Window */}
        <div className="rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] overflow-hidden shadow-2xl">
          {/* Traffic dots bar & URL */}
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--wl-surface-2)] border-b border-[var(--wl-line)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>
            <div className="rounded-md bg-[var(--wl-surface)] px-3 py-1 text-[11px] font-mono text-[var(--wl-muted)] flex items-center gap-1.5 border border-[var(--wl-line)]">
              <Lock className="w-3 h-3 text-[var(--wl-faint)]" />
              <span>intelli-x.app/p/batch-12a</span>
            </div>
            <div className="w-12" />
          </div>

          {/* Window Body: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[var(--wl-line)]">
            {/* Left Col (2/3 width) */}
            <div className="lg:col-span-2 p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs text-[var(--wl-faint)]">Batch Dashboard · {current.role}</span>
                <h3 className="mt-1 text-lg sm:text-xl font-semibold font-geist text-[var(--wl-fg)]">
                  {current.heading}
                </h3>
              </div>

              {/* List */}
              <div className="space-y-3">
                {current.companies.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] hover:border-blue-500/40 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center font-bold text-xs text-white`}>
                        {c.char}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--wl-fg)]">{c.name}</div>
                        <div className="text-[10px] text-[var(--wl-faint)]">{c.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] text-amber-500 font-medium">
                      <Flame className="w-3 h-3" />
                      <span>{c.badge}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">
                + View all 42 students in roster
              </div>
            </div>

            {/* Right Col: Activity & Action Sidebar */}
            <div className="p-6 sm:p-8 space-y-6 bg-[var(--wl-surface-2)]/60">
              {/* Activity notification */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--wl-fg)]">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Activity</span>
                </div>
                <div className="text-xs text-blue-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span className="font-medium text-[var(--wl-fg)]">Parent opened report card</span>
                </div>
                <div className="text-[11px] text-[var(--wl-faint)]">Viewed for 4 minutes · Signed via OTP</div>
              </div>

              {/* Email draft preview with Live Edit & Send states */}
              <div className="space-y-2 pt-4 border-t border-[var(--wl-line)]">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--wl-fg)]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[var(--wl-faint)]" />
                    <span>WhatsApp dispatch draft</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[11px] text-blue-500 hover:underline"
                  >
                    {isEditing ? 'Done' : 'Edit'}
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    rows={3}
                    className="w-full text-xs text-[var(--wl-fg)] bg-[var(--wl-surface)] p-2.5 rounded-xl border border-[var(--wl-line)] outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-xs text-[var(--wl-muted)] leading-relaxed bg-[var(--wl-surface)] p-3 rounded-xl border border-[var(--wl-line)]">
                    "{emailText}"
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleSend}
                    disabled={sentStatus === 'sending' || sentStatus === 'sent'}
                    className="wl-btn wl-btn-primary h-8 px-4 text-xs flex-1"
                  >
                    {sentStatus === 'sending' ? 'Sending...' : sentStatus === 'sent' ? '✓ Dispatched to Parent!' : 'Approve & send via WhatsApp'}
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="wl-btn wl-btn-secondary h-8 px-3 text-xs"
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>

              {/* Based on */}
              <div className="space-y-2 pt-4 border-t border-[var(--wl-line)] text-xs text-[var(--wl-muted)]">
                <span className="font-semibold text-[var(--wl-fg)]">Based on</span>
                <div className="space-y-1.5 text-[11px] text-[var(--wl-faint)]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>OMR Scanner evaluation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Biometric gate check-in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Faculty remark notes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 5: ALTERNATING FEATURE ROWS (Screenshot 5: 84bec0f5.png) ──
const AlternatingFeaturesSection = () => {
  return (
    <section className="relative py-20 border-t border-[var(--wl-line)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
        <AsciiField hollow={0.22} opacity={0.65} />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            Batches tracked, fees collected,<br />
            <span className="text-[var(--wl-muted)]">and an institute that scales.</span>
          </h2>
        </div>

        {/* Feature Row 1: Follow-up Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-20">
          {/* Card Left with AsciiField Background */}
          <div className="relative rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
              <AsciiField hollow={0.12} opacity={0.8} />
            </div>

            <div className="relative z-10 rounded-2xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--wl-line)] pb-3 mb-3 text-xs text-[var(--wl-muted)]">
                <span className="font-semibold text-[var(--wl-fg)]">Institute Activity Dispatch</span>
                <span className="flex items-center gap-1.5 text-emerald-500 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced 2 min ago
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">B</span>
                    <div>
                      <div className="font-medium text-[var(--wl-fg)]">Batch 12-A Physics</div>
                      <div className="text-[10px] text-[var(--wl-faint)]">Test scores evaluated & ready</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--wl-faint)] flex items-center gap-1.5">10:24 <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" /></span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">F</span>
                    <div>
                      <div className="font-medium text-[var(--wl-fg)]">Fee Installment #2</div>
                      <div className="text-[10px] text-[var(--wl-faint)]">₹15,000 received via UPI</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--wl-faint)] flex items-center gap-1.5">9:02 <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /></span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">A</span>
                    <div>
                      <div className="font-medium text-[var(--wl-fg)]">Attendance Alert</div>
                      <div className="text-[10px] text-[var(--wl-faint)]">3 absentees flagged & parents alerted</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--wl-faint)] flex items-center gap-1.5">Yesterday <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" /></span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">P</span>
                    <div>
                      <div className="font-medium text-[var(--wl-fg)]">Parent Consultation</div>
                      <div className="text-[10px] text-[var(--wl-faint)]">Mr. Sharma requested faculty meeting</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--wl-faint)] flex items-center gap-1.5">Mon <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" /></span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:pl-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] flex items-center justify-center text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold font-geist text-[var(--wl-fg)]">
              Automated parent alerts & reminders
            </h3>
            <p className="text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
              Every fee installment, test scorecard, and absentee notice is tracked. When an action is due, Intelli-X drafts and dispatches polite automated notifications to parents.
            </p>
          </div>
        </div>

        {/* Feature Row 2: One Link Portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text Left */}
          <div className="order-2 lg:order-1 lg:pr-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] flex items-center justify-center text-blue-500">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold font-geist text-[var(--wl-fg)]">
              Branded student & parent portal
            </h3>
            <p className="text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
              Every enrolled student gets a branded digital portal at yourinstitute.intellix.in/student. Parents check homework, attendance, fee receipts, and test reports with zero paperwork.
            </p>
          </div>

          {/* Card Right with macOS Window and AsciiField */}
          <div className="order-1 lg:order-2 relative rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
              <AsciiField hollow={0.12} opacity={0.8} />
            </div>

            <div className="relative z-10 rounded-2xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] overflow-hidden shadow-xl">
              <div className="flex items-center px-4 py-2 bg-[var(--wl-surface)] border-b border-[var(--wl-line)] text-xs text-[var(--wl-muted)] gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="font-mono text-[10px] text-[var(--wl-faint)] mx-auto">intelli-x.in/u/aarav</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white border border-zinc-700 flex items-center justify-center font-bold text-xs shadow-md">
                    AS
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--wl-fg)]">Aarav Sharma</div>
                    <div className="text-[11px] text-[var(--wl-faint)]">Class 12 PCM · Roll #1042 · Batch Alpha</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded bg-[var(--wl-surface)] px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/30">Physics: 94%</span>
                  <span className="rounded bg-[var(--wl-surface)] px-2 py-0.5 text-[10px] text-blue-400 border border-blue-500/30">Chemistry: 91%</span>
                  <span className="rounded bg-[var(--wl-surface)] px-2 py-0.5 text-[10px] text-purple-400 border border-purple-500/30">Maths: 96%</span>
                  <span className="rounded bg-[var(--wl-surface)] px-2 py-0.5 text-[10px] text-amber-400 border border-amber-500/30">AIR Rank 45</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--wl-line)]">
                  <span className="text-xs text-[var(--wl-faint)] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Tests completed <strong className="text-[var(--wl-fg)] font-mono">24</strong></span>
                  </span>
                  <button className="rounded-lg bg-[var(--wl-surface)] hover:bg-[var(--wl-surface-2)] px-3 py-1 text-xs text-[var(--wl-fg)] font-medium border border-[var(--wl-line)] transition-colors">
                    Open Portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 6: ATS KEYWORD MATCH / INTERACTIVE GAUGE (Screenshot 6: 118b71ed.png) ──
const TabbedToolSection = () => {
  const [activeTab, setActiveTab] = useState('Syllabus coverage');
  const [inResume, setInResume] = useState(['Thermodynamics', 'Calculus', 'Optics', 'Electrostatics', 'Kinetics']);
  const [missing, setMissing] = useState(['Wave Optics', 'Rotational Motion']);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiReplies, setAiReplies] = useState([
    { from: 'ai', text: 'Ask me anything about batch performance, attendance trends, or fee collection!' }
  ]);

  const addMissingSkill = (skill) => {
    setMissing(missing.filter((s) => s !== skill));
    setInResume([...inResume, skill]);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;
    const userMsg = aiChatInput;
    setAiReplies((prev) => [...prev, { from: 'user', text: userMsg }]);
    setAiChatInput('');
    setTimeout(() => {
      setAiReplies((prev) => [
        ...prev,
        {
          from: 'ai',
          text: `Analyzed query "${userMsg}": 4 students in Batch 12-A need revision support in Rotational Motion before next mock test.`
        }
      ]);
    }, 600);
  };

  const syllabusProgress = Math.min(98, 45 + inResume.length * 9);

  return (
    <section className="relative py-20 border-t border-[var(--wl-line)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
        <AsciiField hollow={0.22} opacity={0.65} />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Banner Pill */}
        <div className="text-center mb-6">
          <span className="rounded-full border border-[var(--wl-line)] bg-[var(--wl-surface-2)] px-3.5 py-1 text-xs text-[var(--wl-muted)]">
            On every batch dashboard
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            Ready to run,<br />
            <span className="text-[var(--wl-muted)]">in one operating system.</span>
          </h2>
          <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
            Analyze syllabus completion, generate OMR exam papers, track fee dues, and query your institute's AI assistant without opening ten different apps.
          </p>
        </div>

        {/* Tab Pills Bar (Apple/Linear/Worklist floating pill container) */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-[var(--wl-surface-2)] p-1.5 border border-[var(--wl-line)] shadow-xl backdrop-blur-md">
            {[
              { id: 'Syllabus coverage', icon: Maximize2 },
              { id: 'Report card tone', icon: Mail },
              { id: 'Fee verification', icon: FileText },
              { id: 'Ask Intelli-X AI', icon: MessageSquare }
            ].map(({ id: tab, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-zinc-950 shadow-md ring-1 ring-black/5 dark:bg-white dark:text-zinc-950'
                    : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)] hover:bg-[var(--wl-surface)]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeTab === tab ? 'text-zinc-950' : 'text-[var(--wl-faint)]'}`} />
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Large Card with Split Layout */}
        <div className="relative rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
            <AsciiField hollow={0.12} opacity={0.8} />
          </div>

          {/* Left Text */}
          <div className="relative z-10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] text-blue-400 flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold font-geist text-[var(--wl-fg)]">
              {activeTab}
            </h3>
            <p className="text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
              {activeTab === 'Syllabus coverage' &&
                "Track NCERT & competitive syllabus completion chapter by chapter. See which topics are mastered, which require revision lectures, and how upcoming test scores align."}
              {activeTab === 'Report card tone' &&
                "Generate tailored, concise score updates for parents with automated teacher remarks, attendance percentages, and percentile rankings."}
              {activeTab === 'Fee verification' &&
                "Instantly verify UPI and cash collections, reconcile branch fee ledgers, and trigger automated WhatsApp receipts for parents."}
              {activeTab === 'Ask Intelli-X AI' &&
                "Query your institute's AI assistant directly to surface low-attendance batches, identify high-risk students, and optimize classroom timetables."}
            </p>
          </div>

          {/* Right Dynamic Interactive Preview */}
          <div className="relative z-10 rounded-2xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] p-6 space-y-6 shadow-xl">
            {activeTab === 'Syllabus coverage' && (
              <>
                <div className="flex items-center gap-5">
                  {/* Dynamic Glowing Circular SVG Gauge */}
                  <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                    <svg className="w-18 h-18 transform -rotate-90">
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <circle cx="36" cy="36" r="30" stroke="currentColor" className="text-[var(--wl-line)]" strokeWidth="6" fill="none" />
                      <circle
                        cx="36"
                        cy="36"
                        r="30"
                        stroke="url(#scoreGradient)"
                        strokeWidth="6"
                        strokeDasharray="188"
                        strokeDashoffset={188 - (188 * syllabusProgress) / 100}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute font-mono text-base font-extrabold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">{syllabusProgress}%</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[var(--wl-fg)]">Syllabus coverage</div>
                    <div className="text-xs text-[var(--wl-muted)] flex items-center gap-1.5 mt-0.5">
                      <span className="text-rose-400 font-medium">Term 1 target 45%</span>
                      <span>→</span>
                      <span className="text-emerald-400 font-bold">completed {syllabusProgress}%</span>
                    </div>
                  </div>
                </div>

                {/* Completed chapters */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-semibold text-[var(--wl-muted)] uppercase tracking-wider">Completed Chapters</div>
                  <div className="flex flex-wrap gap-2">
                    {inResume.map((chip, idx) => (
                      <span key={idx} className="rounded-lg bg-emerald-500/15 border border-emerald-500/35 px-3 py-1.5 text-xs text-emerald-400 font-semibold flex items-center gap-1.5 shadow-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pending syllabus chapters (Clickable to add) */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-semibold text-[var(--wl-muted)] uppercase tracking-wider">
                    Pending Revision Chapters <span className="text-[10px] text-amber-400 lowercase font-normal">(click to mark complete)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missing.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => addMissingSkill(chip)}
                        className="rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 px-3 py-1.5 text-xs text-amber-300 font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        {chip}
                      </button>
                    ))}
                    {missing.length === 0 && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 py-1">
                        <Check className="w-4 h-4 text-emerald-400" />
                        All term syllabus modules covered! 100% completed.
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Report card tone' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-[var(--wl-fg)]">Parent Notification Tone:</div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-blue-600 text-white px-3.5 py-1 text-xs font-semibold shadow-xs">Detailed Analysis</span>
                  <span className="rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30 px-3.5 py-1 text-xs font-semibold">Compact SMS</span>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold">Visual Scorecard</span>
                </div>
                <div className="text-xs text-[var(--wl-fg)] bg-[var(--wl-surface)] p-4 rounded-xl border border-[var(--wl-line)] leading-relaxed shadow-sm">
                  <span className="text-blue-400 font-mono text-[11px] block mb-1">Preview for Mr. Anil Sharma:</span>
                  "Dear Mr. Sharma, Aarav scored 92% in Thermodynamics with 100% attendance this month. He placed Rank #3 in Batch 12-A. Recommended focus: Rotational Motion revision."
                </div>
              </div>
            )}

            {activeTab === 'Fee verification' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-[var(--wl-fg)]">Batch 12-A tuition installments?</span>
                  </div>
                  <span className="rounded-md bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 text-[10px]">Verified (₹3.4L)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-[var(--wl-fg)]">Test series registration fees?</span>
                  </div>
                  <span className="rounded-md bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 text-[10px]">Verified (₹1.2L)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-medium text-[var(--wl-fg)]">Study material & lab charges?</span>
                  </div>
                  <span className="rounded-md bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 text-[10px]">Pending (₹28K)</span>
                </div>
              </div>
            )}

            {activeTab === 'Ask Intelli-X AI' && (
              <div className="space-y-3">
                <div className="h-36 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] text-xs">
                  {aiReplies.map((r, i) => (
                    <div key={i} className={`p-2.5 rounded-xl ${r.from === 'user' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto max-w-[80%] shadow-xs' : 'bg-[var(--wl-surface-2)] text-[var(--wl-fg)] max-w-[85%] border border-[var(--wl-line)]'}`}>
                      {r.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder="Ask AI e.g. low attendance in Batch 12-A..."
                    className="flex-1 bg-[var(--wl-surface)] border border-[var(--wl-line)] rounded-xl px-3 py-2 text-xs text-[var(--wl-fg)] outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="wl-btn wl-btn-primary px-3.5 py-2 text-xs rounded-xl">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 7: THE SMALL TOOLS BENTO GRID (Screenshot 7: 80a857a7.png) ──
const SmallToolsBentoSection = () => {
  const [filterPills, setFilterPills] = useState([
    { name: 'JEE Prep', active: true, color: 'bg-blue-600' },
    { name: 'NEET 2026', active: true, color: 'bg-sky-500' },
    { name: 'Class 10 CBSE', active: false, color: 'bg-amber-600' },
    { name: 'Morning Batch', active: false, color: 'bg-indigo-600' },
    { name: 'Evening Batch', active: true, color: 'bg-pink-600' },
    { name: 'Fee Cleared', active: true, color: 'bg-emerald-600' },
    { name: 'Scholarship Tier', active: false, color: 'bg-purple-600' },
    { name: 'Offline Hall A', active: false, color: 'bg-orange-600' },
    { name: 'Hostel Wing', active: false, color: 'bg-teal-600' }
  ]);

  const [activeBar, setActiveBar] = useState(4);

  const togglePill = (idx) => {
    setFilterPills((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <section id="small-tools" className="py-20 border-t border-[var(--wl-line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header with Girl Reading Drawing */}
        <div className="flex flex-wrap items-center justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
              The coaching tools<br />
              <span className="text-[var(--wl-muted)]">you'll use every day.</span>
            </h2>
            <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
              Engineered specifically for coaching owners, branch managers, teachers, and accountants.
            </p>
          </div>

          {/* Line art illustration of student reading */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 opacity-90 drop-shadow-md">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[var(--wl-fg)]">
              <path d="M50 15 C40 15 35 22 35 30 C35 38 42 42 50 42 C58 42 65 38 65 30 C65 22 60 15 50 15 Z" stroke="currentColor" strokeWidth="2" />
              <path d="M38 30 Q35 38 32 45 Q30 52 28 65 Q45 68 55 65 Q62 60 65 52 Q68 40 62 30" stroke="currentColor" strokeWidth="2" />
              <path d="M45 42 L42 60 L62 60 L60 42" stroke="currentColor" strokeWidth="2" />
              <path d="M30 65 L20 85 L70 85 L65 65" stroke="currentColor" strokeWidth="2" />
              <rect x="52" y="35" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
              <rect x="58" y="28" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="2" transform="rotate(-15 58 28)" />
            </svg>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Smart student & batch filters */}
          <div className="relative md:col-span-2 rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
              <AsciiField hollow={0.06} opacity={0.75} />
            </div>

            <div className="relative z-10 flex flex-wrap gap-2.5 max-w-lg">
              {filterPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => togglePill(idx)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 ${
                    pill.active
                      ? `${pill.color} text-white border-transparent shadow-md`
                      : 'bg-[var(--wl-surface-2)] text-[var(--wl-muted)] border-[var(--wl-line)] hover:text-[var(--wl-fg)] hover:border-blue-500/50'
                  }`}
                >
                  {pill.active && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  <span>{pill.name}</span>
                </button>
              ))}
            </div>
            <div className="relative z-10">
              <h4 className="text-lg font-bold font-geist text-[var(--wl-fg)]">Smart student & batch filters</h4>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Filter by course, branch, board, batch timing, fee status, and scholarship tier in one click.
              </p>
            </div>
          </div>

          {/* Card 2: AI Question Paper & Test Generator */}
          <div className="rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm group hover:border-emerald-500/40 transition-all">
            <div className="relative h-32 flex items-center justify-center">
              {/* Back tilted sheet */}
              <div className="absolute w-28 h-28 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] transform -rotate-6 shadow-sm opacity-80" />
              {/* Front sheet with code bars */}
              <div className="absolute w-28 h-28 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] transform rotate-3 flex flex-col justify-between p-2.5 shadow-xl group-hover:scale-105 transition-transform">
                <div className="space-y-1.5 pt-1">
                  <div className="w-12 h-1.5 rounded-full bg-blue-500" />
                  <div className="w-20 h-1 rounded-full bg-[var(--wl-line)]" />
                  <div className="w-16 h-1 rounded-full bg-[var(--wl-line)]" />
                  <div className="w-14 h-1 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex justify-end">
                  <span className="rounded-full bg-emerald-500 text-zinc-950 font-extrabold px-2 py-0.5 text-[10px] font-mono shadow-md flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    150K QB
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold font-geist text-[var(--wl-fg)]">AI Question Paper Generator</h4>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Create customized question papers from 150,000+ question bank with marking schemes, answer keys, and difficulty balance in seconds.
              </p>
            </div>
          </div>

          {/* Card 3: Morning attendance & fee alerts */}
          <div className="rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm group hover:border-blue-500/40 transition-all">
            <div className="rounded-2xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] p-3 text-xs space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-[var(--wl-muted)] pb-1.5 border-b border-[var(--wl-line)]">
                <span className="flex items-center gap-1.5 font-medium text-[var(--wl-fg)]">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  Morning Dispatch
                </span>
                <span className="rounded-full bg-blue-600 px-2 py-0.2 text-[10px] text-white font-bold font-mono">3 alerts</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--wl-fg)] hover:translate-x-1 transition-transform">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">A</span>
                <span>Daily Attendance <span className="text-[var(--wl-muted)]">98.4% Present</span></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--wl-fg)] hover:translate-x-1 transition-transform">
                <span className="w-5 h-5 rounded-md bg-orange-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">F</span>
                <span>Fees Due Today <span className="text-[var(--wl-muted)]">₹75,000</span></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--wl-fg)] hover:translate-x-1 transition-transform">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">S</span>
                <span>Faculty Substitute <span className="text-[var(--wl-muted)]">Room 302</span></span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold font-geist text-[var(--wl-fg)]">Daily morning briefing</h4>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Automated daily summary at 8:00 AM with biometric attendance totals, faculty leaves, and fee installments due.
              </p>
            </div>
          </div>

          {/* Card 4: Know when parents open reports */}
          <div className="rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm group hover:border-blue-500/40 transition-all">
            <div className="rounded-2xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] p-3.5 text-xs text-[var(--wl-fg)] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/25">
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--wl-fg)]">intelli-x.in/r/aarav-sharma</div>
                  <div className="text-[11px] text-[var(--wl-muted)]">Anil Sharma (Father) viewed test report</div>
                </div>
              </div>
              <span className="text-[10px] text-[var(--wl-faint)] font-mono">3m</span>
            </div>
            <div>
              <h4 className="text-lg font-bold font-geist text-[var(--wl-fg)]">Know when parents open reports</h4>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Track exact timestamps when parents review marks and attendance so counselors can reach out at the right moment.
              </p>
            </div>
          </div>

          {/* Card 5: Institute growth & revenue analytics */}
          <div className="relative rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="pointer-events-none absolute inset-0 size-full overflow-hidden z-0">
              <AsciiField hollow={0.06} opacity={0.65} />
            </div>

            <div className="relative z-10 rounded-2xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-[var(--wl-muted)] mb-3">
                <span className="font-semibold text-[var(--wl-fg)] flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                  Monthly Fee Intake
                </span>
                <span className="font-mono font-bold text-blue-500 text-sm">₹14.2L</span>
              </div>
              {/* Dynamic Interactive Bar Chart */}
              <div className="h-14 flex items-end gap-2 pt-2 px-1 border-b border-[var(--wl-line)] pb-2">
                {[
                  { h: 20, day: 'M' },
                  { h: 35, day: 'T' },
                  { h: 28, day: 'W' },
                  { h: 46, day: 'T' },
                  { h: 56, day: 'F', active: true },
                  { h: 38, day: 'S' }
                ].map((b, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setActiveBar(i)}
                    className="flex-1 flex flex-col items-center gap-1 cursor-pointer group/bar"
                  >
                    <div
                      style={{ height: `${b.h}px` }}
                      className={`w-full rounded-sm transition-all duration-300 ${
                        activeBar === i
                          ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-md shadow-cyan-500/40'
                          : 'bg-[var(--wl-line)] hover:bg-blue-500/50'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-[var(--wl-faint)]">{b.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 text-[10px] flex justify-between font-semibold">
                <span className="text-emerald-400">JEE 64%</span>
                <span className="text-blue-400">NEET 21%</span>
                <span className="text-purple-400">Foundation 15%</span>
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-lg font-bold font-geist text-[var(--wl-fg)]">Branch revenue & intake</h4>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Real-time dashboard of student enrollments, fee collections, branch revenue, and batch-wise academic outcomes.
              </p>
            </div>
          </div>

          {/* Card 6: Yearly Academic Consistency Heatmap */}
          <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-[var(--wl-line)] bg-[var(--wl-surface)] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm group hover:border-emerald-500/40 transition-all">
            <div>
              <h4 className="text-lg font-bold font-geist text-[var(--wl-fg)]">Consistent academic delivery</h4>
              <p className="mt-1 text-xs text-[var(--wl-muted)] leading-relaxed">
                Log daily sessions and syllabus progress. Verified academic milestones are synced to your branch portal.
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] p-4 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-[var(--wl-muted)] mb-2.5">
                <span className="font-medium text-[var(--wl-fg)]">@apex_institute</span>
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3,400+ lectures conducted this year
                </span>
              </div>
              <div className="grid grid-cols-12 gap-1.5">
                {Array.from({ length: 48 }).map((_, i) => {
                  const greenShades = [
                    'bg-[var(--wl-surface)] border border-[var(--wl-line)]',
                    'bg-emerald-950 border border-emerald-900/60',
                    'bg-emerald-700 hover:scale-125 transition-transform',
                    'bg-emerald-500 hover:scale-125 transition-transform shadow-xs shadow-emerald-500/50',
                    'bg-emerald-300 hover:scale-125 transition-transform shadow-sm shadow-emerald-400'
                  ];
                  const shade = greenShades[i % 5];
                  return <div key={i} className={`w-3 h-3 rounded-xs ${shade}`} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION: BATCHES & INSTITUTES TRANSFORMATION (#batches) ──
const BatchesSection = () => {
  return (
    <section id="batches" className="py-24 border-t border-[var(--wl-line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--wl-line)] bg-[var(--wl-surface-2)] px-3.5 py-1 text-xs text-[var(--wl-muted)] mb-4">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Built for Modern Institutes & Coaching Batches</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            Manage your batches,<br />
            <span className="text-[var(--wl-muted)] font-editorial-italic">without the chaos.</span>
          </h2>
          <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed font-light">
            Ditch paper attendance registers, lost receipt books, and messy chat groups. Everything you need to coordinate faculty, students, and parent updates on one board.
          </p>
        </div>

        {/* 2 Comparison Cards: Before vs After with Clear Readable Prices */}
        <div className="mx-auto">
          <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: The Problem (Manual Registers & Chaotic Groups) */}
            <div className="p-6 sm:p-8 rounded-3xl border border-rose-500/25 bg-[var(--wl-surface)] flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-[11px] font-semibold text-rose-500">
                  Traditional Institute Model
                </span>
                <h3 className="text-lg sm:text-xl font-semibold font-geist text-[var(--wl-fg)]">
                  Manual Registers & Chaotic Groups
                </h3>
                <p className="text-xs sm:text-sm text-[var(--wl-muted)] leading-relaxed font-light">
                  Coaching centers lose 20% of their operational bandwidth managing scattered spreadsheets and unverified student notes.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-[var(--wl-muted)]">
                  <div className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Paper registers and roll-calls taking 15+ minutes every lecture</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Unorganized WhatsApp groups where test circulars get buried</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Manual fee reminder phone calls and lost physical receipts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Zero automated visibility for parents into daily test analytics</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--wl-line)] flex items-center justify-between">
                <span className="text-xs text-[var(--wl-muted)] font-medium">Estimated administrative loss:</span>
                <div className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
                  <span className="text-rose-500 font-black text-xl sm:text-2xl font-geist">₹15,000+</span>
                  <span className="text-xs text-[var(--wl-muted)] font-medium">/mo overhead</span>
                </div>
              </div>
            </div>

            {/* Card 2: The Solution (Intelli-X Automation Engine) */}
            <div className="p-6 sm:p-8 rounded-3xl border border-blue-500/50 bg-[var(--wl-surface)] flex flex-col justify-between space-y-6 shadow-xl ring-1 ring-blue-500/30">
              <div className="space-y-4">
                <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-[11px] font-semibold text-blue-500 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  Intelli-X Automated Batch Engine
                </span>
                <h3 className="text-lg sm:text-xl font-semibold font-geist text-[var(--wl-fg)]">
                  Automated Batches & Real-Time Portals
                </h3>
                <p className="text-xs sm:text-sm text-[var(--wl-muted)] leading-relaxed font-light">
                  Replace chaos with precision. One-click attendance, automated parent alerts on WhatsApp, and verified proof dossiers.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-[var(--wl-muted)]">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1-Click biometric & app attendance synced immediately to parents</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Automated test evaluation, percentile scoring & diagnostic cards</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Smart fee management with digital receipts & automatic reminders</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Verified public student proof profiles with progress badges</span>
                  </div>
                </div>
              </div>

              {/* High Contrast Ultra-Readable Price */}
              <div className="pt-4 border-t border-[var(--wl-line)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--wl-fg)]">Complete institute tier:</span>
                <div className="flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 shadow-xs">
                  <span className="text-blue-500 font-bold text-xl sm:text-2xl font-geist">₹</span>
                  <span className="text-2xl sm:text-3xl font-black text-[var(--wl-fg)] tracking-tight font-geist">4,999</span>
                  <span className="text-xs text-[var(--wl-muted)] font-medium">/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 8: INTERACTIVE PRICING SECTION (Monthly / Annual Toggle) ──
const PricingSection = () => {
  const [billingAnnual, setBillingAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      priceMonthly: '₹0',
      priceAnnual: '₹0',
      period: 'forever',
      desc: 'Free to start. Manage up to 50 students and basic classroom batches.',
      features: [
        'Up to 50 active students & 2 batches',
        'Digital roll-call & attendance register',
        'Automated test scorecard generator',
        'Student & Parent portal access',
        'Community & email support'
      ],
      cta: 'Start free',
      popular: false
    },
    {
      name: 'Pro Institute',
      priceMonthly: '₹4,999',
      priceAnnual: '₹3,999',
      period: 'per month',
      desc: 'Complete automation suite for growing coaching centers and academies.',
      features: [
        'Unlimited active batches & student sync',
        'Automated parent WhatsApp updates',
        'Percentile & live exam diagnostic cards',
        'Automated fee receipts & reminder engine',
        'Custom branded report card templates',
        'Priority 24/7 dedicated support'
      ],
      cta: 'Get started with Pro',
      popular: true
    },
    {
      name: 'Enterprise / Multi-Branch',
      priceMonthly: '₹9,999',
      priceAnnual: '₹7,999',
      period: 'per month',
      desc: 'Multi-campus deployment, custom domain, and biometric machine integration.',
      features: [
        'Multi-campus franchise management',
        'Direct biometric & RFID attendance integration',
        'Custom domain (portal.yourinstitute.com)',
        'Centralized faculty payroll & timetable scheduler',
        'Dedicated account director & SLA',
        'Custom ERP & payment gateway integration'
      ],
      cta: 'Contact for Institute',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 border-t border-[var(--wl-line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
            Pick the plan for<br />
            <span className="text-[var(--wl-muted)]">your institute's growth.</span>
          </h2>
          <p className="mt-4 text-[var(--wl-muted)] text-sm sm:text-base leading-relaxed">
            Start free. Upgrade as your student enrollment scales across branches. Zero hidden commission.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center rounded-full bg-[var(--wl-surface-2)] p-1 border border-[var(--wl-line)]">
            <button
              onClick={() => setBillingAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                !billingAnnual ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)]'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
                billingAnnual ? 'bg-blue-600 text-white shadow-xs' : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)]'
              }`}
            >
              <span>Annual billing</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] px-1.5 py-0.2 font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all ${
                p.popular
                  ? 'border-blue-500 bg-[var(--wl-surface)] shadow-2xl ring-1 ring-blue-500/50'
                  : 'border-[var(--wl-line)] bg-[var(--wl-surface)] shadow-md'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold font-geist text-[var(--wl-fg)]">{p.name}</h3>
                <p className="mt-2 text-xs text-[var(--wl-muted)] leading-relaxed font-light">{p.desc}</p>

                <div className="mt-6 flex items-baseline gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] w-fit shadow-xs">
                  <span className="text-3xl sm:text-4xl font-black text-blue-500 tracking-tight font-geist">
                    {billingAnnual ? p.priceAnnual : p.priceMonthly}
                  </span>
                  <span className="text-xs text-[var(--wl-muted)] font-medium">/{p.period}</span>
                </div>

                <div className="mt-6 space-y-2.5 pt-6 border-t border-[var(--wl-line)]">
                  {p.features.map((feat, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-xs text-[var(--wl-muted)]">
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link to="/register" className="block">
                  <button
                    type="button"
                    className={`group relative overflow-hidden w-full h-11 text-xs rounded-xl font-semibold transition-all duration-300 flex items-center justify-center cursor-pointer ${
                      p.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)] border border-blue-400/30'
                        : 'bg-[var(--wl-surface-2)] text-[var(--wl-fg)] border border-[var(--wl-line)] hover:border-zinc-500/60 hover:shadow-[0_0_15px_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    <RollText icon={ArrowRight}>{p.cta}</RollText>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── SECTION 9: INTERACTIVE FAQ ACCORDION ──
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is Intelli-X?",
      a: "Intelli-X is the digital operating system built for modern coaching institutes, schools, and competitive exam centers. It replaces paper registers, unorganized WhatsApp groups, and chaotic fee tracking with one unified AI-powered platform."
    },
    {
      q: "How does the student report card system work?",
      a: "When faculty score a mock test or scan OMR sheets, Intelli-X automatically computes percentile ranks, subject-level accuracy, and chapter weak spots. It generates a verified digital report card link and stages a polite WhatsApp notification for parents."
    },
    {
      q: "Can I integrate our biometric attendance machines or RFID gates?",
      a: "Yes! Intelli-X connects with biometric finger/face scanners, RFID turnstiles, and mobile apps. Absentees are instantly detected and parent alerts can be dispatched with a single click."
    },
    {
      q: "How are fees collected and tracked?",
      a: "Intelli-X automatically tracks installment schedules, generates GST-compliant digital receipts, and sends automated WhatsApp payment links powered by UPI, debit/credit cards, and net banking."
    },
    {
      q: "Are student marks and phone numbers secure?",
      a: "We adhere to enterprise-grade SOC-2 security protocols and 256-bit AES encryption. Student marks, parent phone numbers, and institute financials remain 100% private and protected."
    }
  ];

  return (
    <section id="faq" className="py-24 border-t border-[var(--wl-line)] relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-10 md:gap-16 items-start">
          {/* Left Sticky Header (stays pinned while right accordion scrolls) */}
          <div className="md:sticky md:top-28 md:self-start space-y-4">
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[11px] font-semibold text-blue-500 inline-block">
              Knowledge Base
            </span>
            <h2 className="text-3xl sm:text-5xl font-normal text-[var(--wl-fg)] leading-tight">
              Questions,<br />
              <span className="text-[var(--wl-muted)]">answered.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--wl-muted)] leading-relaxed max-w-xs">
              Everything you need to know about switching your coaching institute or school to Intelli-X.
            </p>
            <div className="pt-2">
              <a
                href="mailto:support@intelli-x.app"
                className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 font-semibold underline underline-offset-4"
              >
                <span>Need custom integration? Talk to our team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Accordion with smooth animated reveal */}
          <div className="border-t border-[var(--wl-line)] divide-y divide-[var(--wl-line)]">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-5 transition-colors duration-200">
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left text-sm sm:text-base font-semibold text-[var(--wl-fg)] hover:text-blue-500 transition-colors cursor-pointer gap-4 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{faq.q}</span>
                    <span
                      className={`grid size-7 place-items-center rounded-full bg-[var(--wl-surface-2)] text-[var(--wl-fg)] transition-all duration-300 shrink-0 ${
                        isOpen ? 'rotate-45 bg-blue-600 text-white shadow-md' : 'group-hover:bg-blue-500/10 group-hover:text-blue-500'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-3.5' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm text-[var(--wl-muted)] leading-relaxed pr-6">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SECTION 10: CRAZY INTERACTIVE FOOTER (Crowd + Links + Exact DotWordmark) ──
const InteractiveFooter = ({ isDark }) => {
  return (
    <footer className="relative bg-[var(--wl-bg)] border-t border-[var(--wl-line)] pt-12 overflow-hidden transition-colors duration-200">
      {/* Top Crowd Drawing Section with Speech Bubbles */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative pt-12 pb-2">
          {/* 4 Interactive Speech Bubbles Floating Above Character Heads */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-2 max-w-4xl mx-auto items-stretch">
            {[
              "Did the parent open the test report?",
              "JEE Mock Test this Sunday 9am.",
              "Fee installment received via UPI!",
              "Batch 12-A completed syllabus."
            ].map((text, i) => (
              <div
                key={i}
                className="speech-bubble relative rounded-2xl bg-[var(--wl-surface)] border border-[var(--wl-line)] px-3.5 py-2.5 text-center shadow-lg flex items-center justify-center min-h-[52px]"
              >
                <span className="text-[11px] sm:text-xs text-[var(--wl-fg)] font-medium leading-tight">
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Crowd Illustration Image (dynamically adapts invert filter to dark/light mode!) */}
          <div className="w-full flex justify-center mt-2">
            <img
              src="/footer-crowd.webp"
              alt="Intelli-X educator and student community"
              className={`w-full max-w-4xl object-contain transition-all duration-300 ${
                isDark ? 'opacity-85 invert' : 'opacity-90'
              }`}
            />
          </div>
        </div>

        {/* 4-Column Footer Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-14 border-t border-[var(--wl-line)]">
          {/* Brand Col: Official IntelliX Logo & Wordmark */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="inline-block py-1" aria-label="IntelliX">
              <img
                src={isDark ? "/intellix-wordmark-white.png" : "/intellix-wordmark-black.png"}
                alt="IntelliX"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </Link>
            <div className="text-sm font-normal text-[var(--wl-fg)]">
              Empowering educators.<br />
              <span className="text-[var(--wl-muted)] font-editorial-italic">Inspiring students.</span>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold text-[var(--wl-fg)]">Product</h5>
            <ul className="space-y-2 text-xs text-[var(--wl-muted)]">
              <li><a href="#search-dir" className="hover:text-[var(--wl-fg)] transition-colors">Batches & Search</a></li>
              <li><a href="#kanban" className="hover:text-[var(--wl-fg)] transition-colors">Admissions CRM</a></li>
              <li><a href="#proof-demo" className="hover:text-[var(--wl-fg)] transition-colors">Student Scorecards</a></li>
              <li><a href="#batches" className="hover:text-[var(--wl-fg)] transition-colors">Transformation</a></li>
              <li><a href="#pricing" className="hover:text-[var(--wl-fg)] transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Features Col */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold text-[var(--wl-fg)]">Features</h5>
            <ul className="space-y-2 text-xs text-[var(--wl-muted)]">
              <li><a href="#small-tools" className="hover:text-[var(--wl-fg)] transition-colors">Biometric Attendance</a></li>
              <li><a href="#small-tools" className="hover:text-[var(--wl-fg)] transition-colors">AI Question Paper Gen</a></li>
              <li><a href="#small-tools" className="hover:text-[var(--wl-fg)] transition-colors">Automated Report Cards</a></li>
              <li><a href="#small-tools" className="hover:text-[var(--wl-fg)] transition-colors">Fee Invoicing & UPI</a></li>
              <li><a href="#small-tools" className="hover:text-[var(--wl-fg)] transition-colors">Parent WhatsApp Portal</a></li>
              <li><a href="#small-tools" className="hover:text-[var(--wl-fg)] transition-colors">Timetable Scheduler</a></li>
            </ul>
          </div>

          {/* Solutions / Institutes Col */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold text-[var(--wl-fg)]">Solutions</h5>
            <ul className="space-y-2 text-xs text-[var(--wl-muted)]">
              <li><a href="#batches" className="hover:text-[var(--wl-fg)] transition-colors">Coaching Centers</a></li>
              <li><a href="#batches" className="hover:text-[var(--wl-fg)] transition-colors">JEE / NEET Academies</a></li>
              <li><a href="#batches" className="hover:text-[var(--wl-fg)] transition-colors">Tuition Classes</a></li>
              <li><a href="#batches" className="hover:text-[var(--wl-fg)] transition-colors">K-12 School Wings</a></li>
              <li><a href="#batches" className="hover:text-[var(--wl-fg)] transition-colors">Franchise Networks</a></li>
              <li><a href="#pricing" className="hover:text-[var(--wl-fg)] transition-colors">Multi-Branch Hubs</a></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold text-[var(--wl-fg)]">Legal</h5>
            <ul className="space-y-2 text-xs text-[var(--wl-muted)]">
              <li><a href="#" className="hover:text-[var(--wl-fg)] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[var(--wl-fg)] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[var(--wl-fg)] transition-colors">Student Data Privacy</a></li>
              <li><a href="#" className="hover:text-[var(--wl-fg)] transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-[var(--wl-fg)] transition-colors">Security & SOC-2</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="flex flex-wrap items-center justify-between py-6 border-t border-[var(--wl-line)] text-[11px] text-[var(--wl-faint)] gap-2">
          <span>© Intelli-X. The Operating System for Modern Coaching Institutes · ISO 27001 Certified · Encrypted Data</span>
          <span>Empowering 1,200+ coaching institutes across India.</span>
        </div>
      </div>

      {/* Giant Interactive Dot Matrix Watermark Canvas across bottom */}
      <div className="w-full relative border-t border-[var(--wl-line)]">
        <DotWordmark text="IntelliX" />
      </div>
    </footer>
  );
};

// ── MAIN LANDING PAGE CONTAINER ──
export default function LandingPage() {
  let themeContext = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    themeContext = useTheme();
  } catch (e) {
    themeContext = null;
  }
  const [localDark, setLocalDark] = useState(true);
  const isDark = themeContext ? themeContext.isDark : localDark;
  const toggleTheme = themeContext ? themeContext.toggleTheme : () => setLocalDark((p) => !p);

  return (
    <div className={`landing-page-root ${isDark ? 'dark' : 'light'} min-h-screen bg-[var(--wl-bg)] text-[var(--wl-fg)]`}>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <SearchDirectorySection />
        <KanbanPipelineSection />
        <ProofRoleAndSplitComparison />
        <ProofWindowSection />
        <AlternatingFeaturesSection />
        <TabbedToolSection />
        <SmallToolsBentoSection />
        <BatchesSection />
        <PricingSection />
        <FAQSection />
      </main>
      <InteractiveFooter isDark={isDark} />
    </div>
  );
}
