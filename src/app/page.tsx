"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Users2,
  Clock3,
  Menu,
  X,
  Check,
  Star,
  Sparkles,
  Globe,
  BarChart3,
  TrendingUp,
  Rocket,
  HeartHandshake,
  Zap,
} from "lucide-react";





export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Core workforce management features
  const mainFeatures = [
    {
      icon: <CalendarCheck className="w-6 h-6" />,
      title: "Smart Scheduling",
      description: "Create optimal schedules in minutes with automatic conflict detection and staff availability.",
      highlights: ["Drag-and-drop scheduling", "Conflict detection", "Availability matching"],
      gradient: "from-blue-500 to-blue-600",
      roi: "Save 5+ hours weekly"
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: "Employee Management",
      description: "Manage your entire workforce from hiring to scheduling with comprehensive employee profiles.",
      highlights: ["Employee profiles", "Role management", "Performance tracking"],
      gradient: "from-green-500 to-green-600",
      roi: "Reduce turnover 25%"
    },
    {
      icon: <Clock3 className="w-6 h-6" />,
      title: "Time & Attendance",
      description: "Track work hours accurately with mobile clock-in, break management, and overtime alerts.",
      highlights: ["Mobile clock-in/out", "Break tracking", "Overtime management"],
      gradient: "from-purple-500 to-purple-600",
      roi: "Cut payroll errors 90%"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Labor Cost Analytics",
      description: "Monitor labor costs in real-time with detailed reports and budget forecasting.",
      highlights: ["Real-time costs", "Budget tracking", "Detailed reports"],
      gradient: "from-orange-500 to-orange-600",
      roi: "Reduce labor costs 15%"
    }
  ];

  // Key business benefits
  const benefits = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Quick Setup",
      description: "Get started in 5 minutes. Import your team, set availability, and start scheduling immediately.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Proven ROI",
      description: "Save 15-20% on labor costs while reducing scheduling time by 80%. Typical payback in 2 months.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: "Happy Employees",
      description: "Reduce no-shows by 60% with transparent scheduling, easy shift swaps, and mobile notifications.",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 employees",
        "Basic scheduling",
        "Time tracking",
        "Mobile app",
        "Email support"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Professional",
      price: "$8",
      period: "/employee/month",
      description: "Everything you need to manage your workforce",
      features: [
        "Unlimited employees",
        "Advanced scheduling",
        "Labor cost analytics",
        "Integrations",
        "Priority support",
        "Custom reports"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with complex needs",
      features: [
        "All Professional features",
        "Multi-location support",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
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


  if (!mounted) {
    // Return minimal loading state to prevent hydration issues
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white overflow-x-hidden relative">
      {/* Simple background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

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
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-6 py-2 mb-8"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-300">
                Trusted by 50,000+ businesses worldwide
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
            >
              <span className="text-white">
                Employee Scheduling
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Made Simple
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8"
            >
              Create schedules in minutes, not hours. Reduce labor costs by 15-20% while keeping employees happy.
              <span className="text-white font-semibold"> Free for up to 5 employees.</span>
            </motion.p>

            {/* Value Props */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center items-center gap-6 mb-12 text-sm text-gray-300"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>No contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
            >
              <Link href="/auth/signup">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Start Free - No Credit Card
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </Link>

              <Link href="/auth/login">
                <button className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300">
                  Sign In
                </button>
              </Link>
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

      </section>

      {/* Features Section - Modern Grid */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                Everything You Need
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="text-white">
                Powerful Features for
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Modern Businesses
              </span>
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage your workforce efficiently.
              No complex setup, no hidden costs, just results.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mainFeatures.map((feature, index) => (
              <div key={feature.title} className="group">
                <div className="relative h-full p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <span className="text-white">{feature.icon}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-300 leading-relaxed mb-4 text-sm">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-1 mb-4">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-400">
                        <Check className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  {/* ROI */}
                  <div className="text-green-400 font-semibold text-sm">
                    {feature.roi}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="text-white">
                Why Choose
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                FirstShift
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="text-center group">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center`}>
                  <span className="text-white">{benefit.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 leading-relaxed max-w-sm mx-auto">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-6">
              <Star className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                Simple Pricing
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="text-white">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Start free, scale as you grow. No setup fees, no contracts, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white/10 border-green-500/50 scale-105'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-300">{plan.period}</span>}
                  </div>
                  <p className="text-gray-300">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/auth/signup">
                  <button
                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:scale-105 shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-300 mb-4">
              All plans include 14-day free trial • No credit card required
            </p>
            <Link href="#" className="text-blue-400 hover:text-blue-300 font-medium">
              View detailed feature comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="solutions" className="py-32 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="text-white">
                Trusted by Businesses
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Everywhere
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of companies already saving time and money with FirstShift
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {industries.map((industry, index) => (
              <div key={industry.name} className="text-center">
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {industry.name}
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  {industry.description}
                </p>
                <p className="text-blue-400 font-semibold text-sm">
                  {industry.users}
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={stat.label} className="group">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="text-white">
                What Our Customers
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Are Saying
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <blockquote className="text-gray-300 leading-relaxed mb-6 text-sm">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            <span className="text-white">
              Ready to Get Started?
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join 50,000+ businesses saving time and money with FirstShift.
            <strong className="text-white"> Start your free trial today.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <Link href="/auth/signup">
              <button className="px-10 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </Link>

            <Link href="/auth/login">
              <button className="px-10 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300">
                Sign In
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
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
                <h3 className="font-bold text-white mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                        {link}
                      </a>
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
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}