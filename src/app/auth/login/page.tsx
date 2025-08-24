// app/login/page.tsx
import Link from "next/link";
import { login } from "../actions";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to manage your schedules</CardDescription>
        </CardHeader>

        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-slate-600 underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-slate-900 underline-offset-4 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
