// app/check-email/page.tsx
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to your inbox.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Click the link in the email to verify your account and continue.
            If you don’t see it, check your spam folder.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline">
              <a href="https://mail.google.com" target="_blank" rel="noreferrer">
                Open Gmail
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://outlook.office.com/mail/" target="_blank" rel="noreferrer">
                Open Outlook
              </a>
            </Button>
          </div>

          <div className="text-sm text-slate-600">
            Didn’t get it? You can{" "}
            <Link href="/auth/signup" className="underline underline-offset-4">
              try signing up again
            </Link>
            .
          </div>

          <Button asChild className="w-full">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
