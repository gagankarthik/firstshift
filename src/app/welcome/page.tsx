// app/welcome/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function WelcomePage() {
  const router = useRouter();

  const features = [
    { icon: Zap, text: "AI-Powered Scheduling" },
    { icon: Shield, text: "Enterprise Security" },
    { icon: Users, text: "Team Collaboration" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-blue-200 rounded-full px-6 py-3 mb-6 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-slate-700">Welcome to FirstShift</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"
          >
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              Let's Get
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              You Started
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Join your team with a code or create a new organization to manage your workforce.
          </motion.p>
        </motion.div>

        {/* Options Grid */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 mb-12"
        >
          {/* Join with Code */}
          <motion.div variants={fadeInUp}>
            <Card className="group h-full p-8 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">I have a join code</h2>

                <p className="text-slate-600 leading-relaxed mb-6">
                  Join your company as an employee or manager using an invitation code from your admin.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                    Instant team access
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                    Pre-configured permissions
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                    Ready to work immediately
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/join")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                  size="lg"
                >
                  Join with code
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Create Organization */}
          <motion.div variants={fadeInUp}>
            <Card className="group h-full p-8 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">Create a new organization</h2>

                <p className="text-slate-600 leading-relaxed mb-6">
                  Start fresh as an admin and build your team from the ground up with full control.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />
                    Full admin privileges
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />
                    Invite unlimited members
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />
                    Customize everything
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/onboarding")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                  size="lg"
                >
                  Create organization
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg"
        >
          <h3 className="text-center text-lg font-semibold text-slate-900 mb-6">
            What you'll get with FirstShift
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-700">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-sm text-slate-500 mt-8"
        >
          Need help? Contact{" "}
          <a href="mailto:support@firstshift.com" className="text-blue-600 hover:text-blue-700 font-medium">
            support@firstshift.com
          </a>
        </motion.p>
      </div>
    </div>
  );
}
