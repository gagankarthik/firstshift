"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { NoSSR } from "@/components/ui/no-ssr";
import {
  ArrowRight,
  CalendarCheck,
  Users2,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  ChevronDown,
  Menu,
  X,
  Check,
  Star,
  Sparkles,
  Radio,
  KeyRound,
  Play,
  Smartphone,
  Globe,
  BarChart3,
  MessageSquare,
  Award,
  Target,
  TrendingUp,
  Eye,
  Lightbulb,
  Rocket,
  HeartHandshake,
  MousePointer,
  Palette,
  Layers,
} from "lucide-react";

// Fix hydration by using client-side only state
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useEffect : () => {};


// Animation variants for consistent motion design
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

const floatingAnimation = {
  y: [0, -10, 0],
};

// Hero particles component
const ParticleField = () => {
  const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number, delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Mouse follower component
const MouseFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  if (typeof window === 'undefined') return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-difference"
      animate={{
        x: mousePosition.x - 10,
        y: mousePosition.y - 10,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    >
      <div className="w-5 h-5 bg-white rounded-full" />
    </motion.div>
  );
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Enhanced feature set with detailed benefits and modern metrics
  const mainFeatures = [
    {
      icon: <CalendarCheck className="w-6 h-6" />,
      title: "AI-Powered Scheduling",
      description: "Smart algorithms automatically optimize schedules based on availability, skills, and business rules.",
      highlights: ["Conflict-free scheduling", "Automatic optimization", "Smart suggestions"],
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      metric: "90% faster",
      category: "Automation"
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: "Team Collaboration Hub",
      description: "Real-time communication and collaboration tools that keep your team connected and informed.",
      highlights: ["Instant messaging", "Team announcements", "Shift swapping"],
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      metric: "85% engagement",
      category: "Communication"
    },
    {
      icon: <Clock3 className="w-6 h-6" />,
      title: "Smart Time Tracking",
      description: "Advanced time tracking with GPS verification, break management, and overtime alerts.",
      highlights: ["GPS clock-in", "Break tracking", "Overtime alerts"],
      gradient: "from-emerald-500 via-green-500 to-lime-500",
      metric: "99.9% accuracy",
      category: "Tracking"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with role-based access, audit trails, and compliance monitoring.",
      highlights: ["SOC 2 compliant", "Multi-factor auth", "Audit trails"],
      gradient: "from-amber-500 via-orange-500 to-red-500",
      metric: "100% secure",
      category: "Security"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Performance",
      description: "Built for speed with real-time updates, offline capabilities, and instant sync.",
      highlights: ["Sub-second loading", "Offline mode", "Real-time sync"],
      gradient: "from-pink-500 via-rose-500 to-red-500",
      metric: "<100ms load",
      category: "Performance"
    },
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Analytics & Insights",
      description: "Comprehensive analytics with predictive insights, cost optimization, and performance metrics.",
      highlights: ["Predictive analytics", "Cost insights", "Performance KPIs"],
      gradient: "from-indigo-500 via-blue-500 to-cyan-500",
      metric: "360° visibility",
      category: "Analytics"
    },
  ];

  // Enhanced benefits with modern focus
  const benefits = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Launch in Minutes",
      description: "Get your entire team scheduled and operational in under 5 minutes with our intelligent setup wizard.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: "Team Happiness",
      description: "Increase employee satisfaction by 40% with fair scheduling, easy shift swaps, and transparent communication.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "ROI Guaranteed",
      description: "See immediate cost savings through optimized labor allocation and reduced scheduling overhead.",
      gradient: "from-emerald-500 to-green-500",
    },
  ];

  // Modern industry solutions
  const industries = [
    {
      name: "Healthcare",
      icon: "🏥",
      description: "24/7 coverage optimization",
      users: "2,500+ facilities",
      growth: "+145%"
    },
    {
      name: "Retail",
      icon: "🛍️",
      description: "Peak hour management",
      users: "1,800+ stores",
      growth: "+120%"
    },
    {
      name: "Hospitality",
      icon: "🏨",
      description: "Event-based scheduling",
      users: "950+ hotels",
      growth: "+89%"
    },
    {
      name: "Manufacturing",
      icon: "🏭",
      description: "Shift optimization",
      users: "650+ plants",
      growth: "+67%"
    },
  ];

  // Enhanced stats
  const stats = [
    { number: "50K+", label: "Active Users", icon: Users2 },
    { number: "99.9%", label: "Uptime", icon: Zap },
    { number: "4.9/5", label: "Rating", icon: Star },
    { number: "150+", label: "Countries", icon: Globe },
  ];

  // Testimonials with rich content
  const testimonials = [
    {
      content: "FirstShift revolutionized our scheduling process. We went from spending hours every week to having everything automated. Our team loves the interface and the mobile app is fantastic.",
      author: "Sarah Chen",
      role: "Operations Director",
      company: "TechFlow Dynamics",
      avatar: "/avatars/sarah.jpg",
      rating: 5
    },
    {
      content: "The AI scheduling suggestions are incredibly accurate. It's like having a dedicated scheduling manager that never makes mistakes. ROI was immediate.",
      author: "Marcus Rodriguez",
      role: "VP Operations",
      company: "RetailMax Chain",
      avatar: "/avatars/marcus.jpg",
      rating: 5
    },
    {
      content: "Managing 24/7 healthcare schedules used to be our biggest challenge. FirstShift made it effortless while ensuring we never have coverage gaps.",
      author: "Dr. Emily Watson",
      role: "Chief Medical Officer",
      company: "HealthFirst Hospital",
      avatar: "/avatars/emily.jpg",
      rating: 5
    },
  ];

  // Enhanced interactivity states
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [hoveredIndustry, setHoveredIndustry] = useState<number | null>(null);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % mainFeatures.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [mainFeatures.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white overflow-x-hidden relative">
      <NoSSR>
        <MouseFollower />
      </NoSSR>

      {/* Advanced background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              background: [
                "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            className="absolute inset-0"
          />
        </div>

        {/* Particle field */}
        <NoSSR>
          <ParticleField />
        </NoSSR>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Enhanced Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-2xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <Link href="/" className="flex items-center space-x-3 group">
                <Image src="/logo.svg" alt="FirstShift Logo" width={124} height={24} />
              </Link>
            </motion.div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: "Features", href: "#features" },
                { name: "Solutions", href: "#solutions" },
                { name: "Pricing", href: "#pricing" },
                { name: "About", href: "#about" },
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ y: -2 }}
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  {item.name}
                </motion.a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/40 backdrop-blur-2xl border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {[
                  { name: "Features", href: "#features" },
                  { name: "Solutions", href: "#solutions" },
                  { name: "Pricing", href: "#pricing" },
                  { name: "About", href: "#about" },
                ].map((item, index) => (
                  <motion.a
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </motion.a>
                ))}
                <div className="flex flex-col space-y-3 pt-4">
                  <Link href="/auth/login">
                    <button className="w-full px-4 py-2 text-center text-gray-300 hover:text-white transition-colors duration-200 border border-white/20 rounded-xl">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section - Revolutionary Design */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Hero Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-200">
                Introducing AI-Powered Scheduling
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-black leading-tight mb-6"
            >
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Schedule
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Smarter
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
            >
              The world's most intelligent workforce management platform.
              <span className="text-white font-semibold"> Powered by AI</span>,
              loved by teams, trusted by enterprises.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
            >
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 25px 50px rgba(168, 85, 247, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/50 transition-all duration-300"
                >
                  Start Free Trial
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    className="inline-block ml-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2 inline" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12 text-sm text-gray-400"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <stat.icon className="w-4 h-4 text-violet-400" />
                  <span className="font-bold text-white">{stat.number}</span>
                  <span>{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 right-20 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
            className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl shadow-2xl shadow-purple-500/25 flex items-center justify-center"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-32 left-20 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1
            }}
            className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-2xl shadow-cyan-500/25 flex items-center justify-center"
          >
            <Users2 className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex flex-col items-center text-gray-400"
          >
            <span className="text-xs mb-2">Scroll to explore</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Modern Grid */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center space-x-2 bg-violet-500/10 backdrop-blur-xl border border-violet-500/20 rounded-full px-6 py-3 mb-6"
            >
              <Palette className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">
                Powerful Features
              </span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Built for the
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Future of Work
              </span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Experience the next generation of workforce management with AI-powered automation,
              real-time collaboration, and enterprise-grade security.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                onMouseEnter={() => setActiveFeature(index)}
                className="group relative"
              >
                <div className="relative h-full p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-white/20 transition-all duration-500">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                  {/* Category badge */}
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1 text-xs font-semibold bg-white/10 backdrop-blur-xl rounded-full text-gray-300 border border-white/10">
                      {feature.category}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white">{feature.icon}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-6">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-3 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  {/* Metric */}
                  <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${feature.gradient} rounded-full text-white font-bold text-sm`}>
                    {feature.metric}
                  </div>
                </div>

                {/* Active indicator */}
                {activeFeature === index && (
                  <motion.div
                    layoutId="activeFeature"
                    className="absolute inset-0 rounded-3xl border-2 border-violet-400/50 pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-black mb-6"
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Teams Choose
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                FirstShift
              </span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center group"
              >
                <div className={`w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white">{benefit.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 leading-relaxed max-w-sm mx-auto">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section id="solutions" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center space-x-2 bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-6 py-3 mb-6"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">
                Industry Solutions
              </span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-black mb-6"
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Trusted Across
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Every Industry
              </span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                onMouseEnter={() => setHoveredIndustry(index)}
                onMouseLeave={() => setHoveredIndustry(null)}
                className="relative group"
              >
                <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center hover:border-white/20 transition-all duration-300">
                  <div className="text-5xl mb-4">{industry.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {industry.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {industry.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-violet-400 font-semibold">
                      {industry.users}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 bg-green-500/20 rounded-full">
                      <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                      <span className="text-green-400 text-xs font-bold">
                        {industry.growth}
                      </span>
                    </div>
                  </div>
                </div>

                {hoveredIndustry === index && (
                  <motion.div
                    layoutId="industryHover"
                    className="absolute inset-0 rounded-3xl border-2 border-cyan-400/50 pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-white/5 via-transparent to-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-black mb-6"
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Loved by
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Thousands
              </span>
            </motion.h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-2xl sm:text-3xl font-medium text-white leading-relaxed mb-8">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>

                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl mr-4">
                      {testimonials[activeTestimonial].author.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-lg">
                        {testimonials[activeTestimonial].author}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {testimonials[activeTestimonial].role}
                      </div>
                      <div className="text-violet-400 text-sm font-semibold">
                        {testimonials[activeTestimonial].company}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'bg-violet-400 scale-125'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Your Workforce?
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of companies already using FirstShift to optimize their operations
              and empower their teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 25px 50px rgba(168, 85, 247, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/50 transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5 mr-2 inline" />
                Talk to Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <Image src="/logo.svg" alt="FirstShift Logo" width={124} height={24} />
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                The world's most intelligent workforce management platform.
              </p>
              <div className="flex space-x-4">
                {/* Social links would go here */}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Product",
                links: [
                  { text: "Features", href: "/docs" },
                  { text: "Pricing", href: "/pricing" },
                  { text: "Security", href: "/security" },
                  { text: "Integrations", href: "/integrations" }
                ],
              },
              {
                title: "Company",
                links: [
                  { text: "About", href: "/about" },
                  { text: "Blog", href: "/blog" },
                  { text: "Careers", href: "/careers" },
                  { text: "Contact", href: "/contact" }
                ],
              },
              {
                title: "Resources",
                links: [
                  { text: "Documentation", href: "/docs" },
                  { text: "Help Center", href: "/help" },
                  { text: "Community", href: "/community" },
                  { text: "API", href: "/docs/api" }
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-white mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 FirstShift. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}