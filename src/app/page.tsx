import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";
import { Button } from "@/components/ui/button";

async function UserInfo() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{user.email}</span>
      <form>
        <Button type="submit" formAction={logout} variant="outline" size="sm">
          Log out
        </Button>
      </form>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-xl font-semibold">Folio</span>
        <Suspense fallback={<div className="h-8 w-40" />}>
          <UserInfo />
        </Suspense>
      </header>
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Welcome to Folio</h1>
        <p className="mt-2 text-muted-foreground">
          Your workspaces will appear here.
        </p>
      </main>
    </div>
  );
}