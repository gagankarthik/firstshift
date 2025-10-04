"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signup } from "../actions";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, Sparkles, Shield, Lock, Check, User, Mail } from "lucide-react";


export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await signup(formData);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const levels = [
      { strength: 0, label: "", color: "" },
      { strength: 1, label: "Weak", color: "bg-red-500" },
      { strength: 2, label: "Fair", color: "bg-orange-500" },
      { strength: 3, label: "Good", color: "bg-yellow-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" },
      { strength: 5, label: "Excellent", color: "bg-emerald-500" },
    ];

    return levels[score];
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative">
      {/* Modern background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#5E58FF08_1px,transparent_1px),linear-gradient(to_bottom,#5E58FF08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
           <Image src="/logo.svg" alt="FirstShift Logo" width={150} height={50} className="h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full px-4 py-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Start Free</span>
              </div>
            </div>

            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-foreground/70">
              Join thousands of teams transforming their workforce management
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form action={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-semibold text-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Taylor Jenkins"
                    className="pl-11 h-12"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    className="pl-11 h-12"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Password Fields Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-12"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.strength
                                ? passwordStrength.color
                                : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      {passwordStrength.label && (
                        <p className={`text-xs ${
                          passwordStrength.strength >= 4 ? 'text-green-400' :
                          passwordStrength.strength >= 3 ? 'text-yellow-400' :
                          passwordStrength.strength >= 2 ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          Password strength: {passwordStrength.label}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-sm font-semibold text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      name="confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 h-12"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password match indicator */}
                  {confirmPassword && (
                    <div className="flex items-center space-x-2">
                      {passwordsMatch ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-400">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-red-400" />
                          <span className="text-xs text-red-400">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !passwordsMatch || passwordStrength.strength < 3}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground font-semibold">Already have an account?</span>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>Sign in to your account</span>
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-4 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2025 FirstShift. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}