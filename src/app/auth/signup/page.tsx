// app/signup/page.tsx
import Link from "next/link";
import { signup } from "../actions";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Sign up to start managing schedules</CardDescription>
        </CardHeader>

        <CardContent>
          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Taylor Jenkins"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" minLength={8} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" name="confirm" type="password" minLength={8} required />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-slate-900 underline-offset-4 hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
