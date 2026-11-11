import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
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

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="text-xl font-semibold">
        Folio
      </Link>
      <Suspense fallback={<div className="h-8 w-40" />}>
        <UserInfo />
      </Suspense>
    </header>
  );
}