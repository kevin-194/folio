import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { acceptInvite } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Params = Promise<{ token: string }>;
type SearchParams = Promise<{ error?: string }>;

async function InviteBody({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already does this, but we check again close to the data.
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        You're signed in as <strong>{user.email}</strong>. The invitation must
        have been sent to this address.
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <form action={acceptInvite} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="token" value={token} />
        <Button type="submit">Accept invitation</Button>
      </form>
      <form className="mt-2">
        <Button type="submit" formAction={logout} variant="outline" size="sm">
          Use a different account
        </Button>
      </form>
    </>
  );
}

export default function InvitePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">You're invited</CardTitle>
          <CardDescription>
            Accept to see the projects shared with you on Folio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-32" />}>
            <InviteBody params={params} searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}