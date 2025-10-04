"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Users2,
  Clock,
  Brain,
  Check,
  Star,
  Sparkles,
  Play,
  Zap,
  Shield,
  TrendingUp,
  Menu,
  X,
  CheckCircle2,
  BarChart3,
  MessageCircle,
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Scheduling",
      description:
        "Smart algorithms that learn your patterns and create optimal schedules automatically, preventing conflicts and ensuring fair distribution.",
      color: "from-blue-500 to-indigo-600",
      stats: "95% accuracy",
    },
    {
      icon: Users2,
      title: "Team Management",
      description:
        "Centralized hub for managing your workforce with instant communication, shift swapping, and live attendance tracking.",
      color: "from-emerald-500 to-teal-600",
      stats: "500+ teams",
    },
    {
      icon: Clock,
      title: "Time & Attendance",
      description:
        "GPS-verified clock-ins, automatic break calculations, overtime alerts, and comprehensive timesheet management.",
      color: "from-orange-500 to-red-600",
      stats: "99.8% accuracy",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description:
        "Real-time insights with predictive modeling, labor cost analysis, and performance metrics for data-driven decisions.",
      color: "from-purple-500 to-pink-600",
      stats: "360° visibility",
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9/5", label: "User Rating" },
    { number: "24/7", label: "Support" },
  ];

  const benefits = [
    { icon: Zap, text: "Deploy in 60 seconds", color: "text-blue-600" },
    { icon: Shield, text: "Enterprise security", color: "text-green-600" },
    { icon: TrendingUp, text: "Cut costs by 23%", color: "text-purple-600" },
    { icon: CheckCircle2, text: "99.9% uptime SLA", color: "text-orange-600" },
  ];

  const testimonials = [
    {
      content:
        "FirstShift transformed our 500-employee operation. Labor costs dropped 23% and satisfaction soared.",
      author: "Sarah Chen",
      role: "Operations Director",
      company: "MegaCorp Retail",
      rating: 5,
    },
    {
      content:
        "Managing 24/7 healthcare coverage was a nightmare. FirstShift ensures perfect compliance while keeping everyone happy.",
      author: "Dr. Marcus Rodriguez",
      role: "Chief Nursing Officer",
      company: "Regional Medical",
      rating: 5,
    },
    {
      content:
        "Our seasonal staffing challenges vanished. Revenue per employee increased 31% with FirstShift.",
      author: "Emily Watson",
      role: "General Manager",
      company: "Luxury Resort",
      rating: 5,
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="FirstShift" width={132} height={32} priority />
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {["Features", "Pricing", "About", "Contact"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <button className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>
              </Link>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-200"
            >
              <div className="px-4 py-6 space-y-4">
                {["Features", "Pricing", "About", "Contact"].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="block py-2 text-slate-600">
                    {item}
                  </a>
                ))}
                <Link href="/auth/login">
                  <button className="w-full px-4 py-2 text-center border border-slate-300 rounded-xl">Sign In</button>
                </Link>
                <Link href="/auth/signup">
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold">Get Started</button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-7xl mx-auto text-center z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-blue-200 rounded-full px-6 py-3 mb-8 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-slate-700">AI-Powered Workforce Management</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Workforce Management
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-12"
          >
            Transform team scheduling with <span className="text-blue-600 font-semibold">AI automation</span>,{" "}
            <span className="text-purple-600 font-semibold">real-time collaboration</span>, and{" "}
            <span className="text-green-600 font-semibold">enterprise security</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          >
            <Link href="/auth/signup">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </Link>
            <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-all shadow-lg">
              <Play className="w-5 h-5 mr-2 inline" />
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg hover:scale-105 transition-transform"
              >
                <div className="font-bold text-slate-900 text-2xl mb-1">{stat.number}</div>
                <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-6 py-3 mb-6">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built for modern teams with AI automation and real-time collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl hover:border-blue-300 hover:shadow-2xl transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>
                <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${feature.color} rounded-full text-white font-bold text-sm`}>
                  {feature.stats}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Why Choose{" "}
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FirstShift
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all text-center"
              >
                <benefit.icon className={`w-12 h-12 mx-auto mb-4 ${benefit.color}`} />
                <p className="font-semibold text-slate-900">{benefit.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 p-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-center text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl mb-8 opacity-90">Join thousands of teams using FirstShift</p>
            <Link href="/auth/signup">
              <button className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Loved by{" "}
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Teams
              </span>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-12 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl text-center"
            >
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl font-medium text-slate-800 mb-8">
                "{testimonials[activeTestimonial].content}"
              </blockquote>
              <div className="font-bold text-slate-900">{testimonials[activeTestimonial].author}</div>
              <div className="text-slate-600 text-sm">{testimonials[activeTestimonial].role}</div>
              <div className="text-blue-600 font-semibold text-sm">{testimonials[activeTestimonial].company}</div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === activeTestimonial ? "bg-blue-600 scale-125" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-200 bg-white/50 backdrop-blur-xl px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                FirstShift
              </div>
              <p className="text-slate-600 text-sm">
                The world's most intelligent workforce management platform
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Integrations"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Resources",
                links: ["Documentation", "Help Center", "Community", "API"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-slate-900 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 text-sm">© 2025 FirstShift. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-600 hover:text-slate-900 text-sm">Privacy</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 text-sm">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
