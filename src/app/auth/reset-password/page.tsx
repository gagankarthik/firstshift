// app/reset-password/page.tsx
import { sendReset } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>We’ll email you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={sendReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" required />
            </div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Remembered it?{" "}
            <Link href="/auth/login" className="font-medium underline-offset-4 hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
