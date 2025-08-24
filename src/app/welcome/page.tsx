// app/welcome/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WelcomePage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Welcome 👋</h1>
      <p className="text-sm text-gray-600 mb-6">
        Join your team with a code, or create a new organization.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 flex flex-col">
          <div className="font-semibold text-lg mb-2">I have a join code</div>
          <p className="text-sm text-gray-600 mb-4">
            Join your company as an employee or manager using a code from your admin.
          </p>
          <Button onClick={() => router.push("/join")} className="mt-auto w-full">
            Join with code
          </Button>
        </Card>

        <Card className="p-5 flex flex-col">
          <div className="font-semibold text-lg mb-2">Create a new organization</div>
          <p className="text-sm text-gray-600 mb-4">
            You’ll become the admin and can invite your team later.
          </p>
          <Button onClick={() => router.push("/onboarding")} className="mt-auto w-full">
            Create organization
          </Button>
        </Card>
      </div>
    </div>
  );
}
