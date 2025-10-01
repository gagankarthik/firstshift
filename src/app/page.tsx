"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { NoSSR } from "@/components/ui/no-ssr";
import {
  ArrowRight,
  CalendarCheck,
  Users2,
  Clock,
  ShieldCheck,
  Zap,
  ChevronDown,
  Menu,
  X,
  Check,
  Star,
  Sparkles,
  Play,
  Globe,
  Brain,
  Calendar,
  CheckCircle,
  DollarSign,
  Timer,
  Rocket,
  Heart,
  TrendingUp,
  Shield,
  PieChart,
  UserCheck,
  MessageSquare,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// 3D Card Component
const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
};

// Floating particle component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Features data
  const features = [
    {
      icon: <Brain className="w-7 h-7" />,
      title: "AI-Powered Scheduling",
      description: "Smart algorithms that learn your patterns and create optimal schedules automatically, preventing conflicts and ensuring fair distribution.",
      gradient: "from-blue-500 to-indigo-600",
      highlights: ["Auto conflict resolution", "Fair distribution", "Predictive scheduling"],
      metric: "95% efficiency",
    },
    {
      icon: <UserCheck className="w-7 h-7" />,
      title: "Team Management",
      description: "Centralized hub for managing your workforce with instant communication, shift swapping, and live attendance tracking.",
      gradient: "from-emerald-500 to-teal-600",
      highlights: ["Live tracking", "Instant swaps", "Team chat"],
      metric: "87% engagement",
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: "Time & Attendance",
      description: "GPS-verified clock-ins, automatic break calculations, overtime alerts, and comprehensive timesheet management.",
      gradient: "from-orange-500 to-red-600",
      highlights: ["GPS verification", "Auto breaks", "Overtime alerts"],
      metric: "99.8% accuracy",
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: "Schedule Optimization",
      description: "Intelligent builder considering preferences, availability, skills, and business requirements for perfect allocation.",
      gradient: "from-violet-500 to-purple-600",
      highlights: ["Skill matching", "Cost optimization", "Coverage guaranteed"],
      metric: "78% cost cut",
    },
    {
      icon: <PieChart className="w-7 h-7" />,
      title: "Business Analytics",
      description: "Real-time insights with predictive modeling, labor cost analysis, and performance metrics for data-driven decisions.",
      gradient: "from-green-500 to-lime-600",
      highlights: ["Predictive analytics", "Cost forecasting", "Custom reports"],
      metric: "360° visibility",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Enterprise Security",
      description: "Bank-level security with encryption, role-based access, audit trails, and compliance monitoring for peace of mind.",
      gradient: "from-rose-500 to-pink-600",
      highlights: ["End-to-end encryption", "GDPR compliant", "Audit logging"],
      metric: "100% secure",
    },
  ];

  // Benefits data
  const benefits = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Deploy in 60 Seconds",
      description: "Get operational instantly with one-click setup and smart data import.",
      gradient: "from-blue-500 to-indigo-600",
      metric: "60 sec",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Boost Team Morale",
      description: "Increase satisfaction by 47% with fair scheduling and flexibility.",
      gradient: "from-rose-500 to-pink-600",
      metric: "+47%",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Reduce Costs",
      description: "Cut labor costs by 23% through intelligent optimization.",
      gradient: "from-emerald-500 to-green-600",
      metric: "23%",
    },
    {
      icon: <Timer className="w-8 h-8" />,
      title: "Save Time",
      description: "Reduce scheduling time by 89% with automation.",
      gradient: "from-amber-500 to-orange-600",
      metric: "89%",
    },
  ];

  // Stats data
  const stats = [
    { number: "127K+", label: "Active Users", icon: Users2 },
    { number: "99.97%", label: "Uptime", icon: Zap },
    { number: "4.9/5", label: "Rating", icon: Star },
    { number: "89+", label: "Countries", icon: Globe },
  ];

  // Testimonials data
  const testimonials = [
    {
      content: "FirstShift transformed our 500-employee operation. Scheduling that took 8 hours weekly now takes 15 minutes. Labor costs dropped 23% and satisfaction soared.",
      author: "Sarah Chen",
      role: "Operations Director",
      company: "MegaCorp Retail",
      rating: 5,
      metrics: ["23% cost cut", "87% time saved"],
    },
    {
      content: "Managing 24/7 healthcare coverage for 200+ nurses was a nightmare. FirstShift ensures perfect compliance while keeping everyone happy.",
      author: "Dr. Marcus Rodriguez",
      role: "Chief Nursing Officer",
      company: "Regional Medical Center",
      rating: 5,
      metrics: ["100% compliance", "Zero gaps"],
    },
    {
      content: "Our hotel's seasonal staffing challenges vanished. FirstShift adapts to booking patterns automatically. Revenue per employee increased 31%.",
      author: "Emily Watson",
      role: "General Manager",
      company: "Luxury Resort & Spa",
      rating: 5,
      metrics: ["31% revenue up", "Auto optimization"],
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900 overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingParticles />
        {/* Gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image src="/logo.svg" alt="FirstShift Logo" width={132} height={32} />
              </Link>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              {["Features", "Solutions", "Pricing", "About"].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  whileHover={{ y: -2 }}
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </motion.button>
              </Link>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-200"
            >
              <div className="px-4 py-6 space-y-4">
                {["Features", "Solutions", "Pricing", "About"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 pt-4">
                  <Link href="/auth/login">
                    <button className="w-full px-4 py-2 text-center text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-blue-200 rounded-full px-6 py-3 mb-8 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-slate-700">
                🚀 Introducing AI-Powered Workforce Management
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6"
            >
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Workforce Management
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Revolutionized
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12"
            >
              Transform how your team works with{" "}
              <span className="text-slate-900 font-semibold">AI-powered scheduling</span>,{" "}
              <span className="text-blue-600 font-semibold">real-time collaboration</span>, and{" "}
              <span className="text-purple-600 font-semibold">enterprise security</span> in one platform.
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
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl"
                >
                  Start Free Trial
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block ml-2"
                  >
                    <ArrowRight className="w-5 h-5 inline" />
                  </motion.span>
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-all shadow-lg"
              >
                <Play className="w-5 h-5 mr-2 inline" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center group cursor-pointer bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-lg"
                >
                  <div className="mb-2 flex justify-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 text-xl">{stat.number}</div>
                  <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating elements with 3D effect */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-32 right-10 lg:right-20 hidden lg:block"
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotateY: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center"
          >
            <Zap className="w-10 h-10 text-white" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-32 left-10 lg:left-20 hidden lg:block"
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotateX: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl flex items-center justify-center"
          >
            <Users2 className="w-8 h-8 text-white" />
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
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-slate-400"
          >
            <span className="text-xs mb-2 font-medium">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center space-x-2 bg-blue-100 border border-blue-200 rounded-full px-6 py-3 mb-6"
            >
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">AI-Powered Features</span>
            </motion.div>

            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Built for the
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Modern Workforce
              </span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience next-generation workforce management with AI automation, real-time collaboration, and enterprise security.
            </motion.p>
          </motion.div>

          {/* Features Grid with 3D Cards */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <Card3D key={feature.title} className="group">
                <motion.div
                  variants={fadeInUp}
                  className="h-full p-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl hover:border-blue-300 hover:shadow-2xl transition-all duration-500"
                  style={{ transform: "translateZ(20px)" }}
                >
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <span className="text-white">{feature.icon}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">{feature.description}</p>

                  {/* Highlights */}
                  <ul className="space-y-3 mb-6">
                    {feature.highlights.map((highlight, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center text-sm text-slate-600"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {highlight}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Metric */}
                  <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${feature.gradient} rounded-full text-white font-bold text-sm shadow-lg`}>
                    {feature.metric}
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-white/50 via-blue-50/50 to-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Why Teams Choose{" "}
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FirstShift
              </span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="text-center group cursor-pointer"
              >
                <div className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl hover:border-blue-300 hover:shadow-2xl transition-all duration-500">
                  <motion.div
                    className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    whileHover={{
                      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-white">{benefit.icon}</span>
                  </motion.div>

                  <h3 className="text-xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6 text-sm">{benefit.description}</p>

                  <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${benefit.gradient} rounded-full text-white font-bold text-sm shadow-lg`}>
                    {benefit.metric}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Loved by{" "}
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Thousands
              </span>
            </motion.h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-12 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl text-center shadow-2xl">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                      >
                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  <blockquote className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed mb-8">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>

                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {testimonials[activeTestimonial].metrics.map((metric, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-700 text-sm font-semibold"
                      >
                        {metric}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mr-6 shadow-lg">
                      {testimonials[activeTestimonial].author.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 text-lg">
                        {testimonials[activeTestimonial].author}
                      </div>
                      <div className="text-slate-600 text-sm">{testimonials[activeTestimonial].role}</div>
                      <div className="text-blue-600 text-sm font-semibold">
                        {testimonials[activeTestimonial].company}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? "bg-blue-600 scale-125" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 text-white relative z-10">
              Ready to Transform Your Workforce?
            </h2>

            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed relative z-10">
              Join thousands of companies using FirstShift to optimize operations and empower their teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all"
              >
                <MessageSquare className="w-5 h-5 mr-2 inline" />
                Talk to Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-200 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                FirstShift
              </div>
              <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                The world's most intelligent workforce management platform.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { text: "Features", href: "#features" },
                  { text: "Pricing", href: "#pricing" },
                  { text: "Security", href: "#security" },
                  { text: "Integrations", href: "#integrations" },
                ],
              },
              {
                title: "Company",
                links: [
                  { text: "About", href: "#about" },
                  { text: "Blog", href: "#blog" },
                  { text: "Careers", href: "#careers" },
                  { text: "Contact", href: "#contact" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { text: "Documentation", href: "/docs" },
                  { text: "Help Center", href: "/help" },
                  { text: "Community", href: "#community" },
                  { text: "API", href: "/docs/api" },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-slate-900 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link href={link.href} className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 text-sm">© 2025 FirstShift. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#privacy" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -250% 0;
          }
          100% {
            background-position: 250% 0;
          }
        }
      `}</style>
    </div>
  );
}
