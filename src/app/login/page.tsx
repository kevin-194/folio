import { Suspense } from "react";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SearchParams = Promise<{ error?: string }>;

async function LoginForm({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;

  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" formAction={login} className="flex-1">
          Log in
        </Button>
        <Button
          type="submit"
          formAction={signup}
          variant="outline"
          className="flex-1"
        >
          Sign up
        </Button>
      </div>
    </form>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Folio</CardTitle>
          <CardDescription>
            Sign in, or create an account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-48" />}>
            <LoginForm searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}