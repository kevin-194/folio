import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createInvite } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Params = Promise<{ orgSlug: string; clientId: string }>;
type SearchParams = Promise<{ error?: string; invite?: string }>;

async function ClientDetails({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orgSlug, clientId } = await params;
  const { error, invite } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org) notFound();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("id", clientId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!client) notFound();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, email, accepted_at, expires_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  return (
    <>
      <Link
        href={`/${orgSlug}/clients`}
        className="text-sm text-muted-foreground underline"
      >
        ← Clients
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">{client.name}</h1>
      {client.email && (
        <p className="text-sm text-muted-foreground">{client.email}</p>
      )}

      <h2 className="mt-8 text-lg font-semibold">Invite to the portal</h2>
      <p className="text-sm text-muted-foreground">
        Give this client their own login so they can see their projects.
      </p>

      {invite && (
        <div className="mt-4 rounded-md border bg-muted p-3">
          <p className="text-sm font-medium">Invite link created</p>
          <p className="text-xs text-muted-foreground">
            Copy it now. It won't be shown again.
          </p>
          <Input
            readOnly
            className="mt-2"
            value={`${siteUrl}/invite/${invite}`}
          />
        </div>
      )}

      <form action={createInvite} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <input type="hidden" name="clientId" value={client.id} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Client's email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="owner@bluebakery.com"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="self-start">
          Create invite link
        </Button>
      </form>

      <h2 className="mt-8 text-lg font-semibold">Invitations</h2>
      {!invitations || invitations.length === 0 ? (
        <p className="mt-2 text-muted-foreground">No invitations yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {invitations.map((inv) => {
            const status = inv.accepted_at
              ? "Accepted"
              : new Date(inv.expires_at) < now
                ? "Expired"
                : "Pending";
            return (
              <li key={inv.id}>
                <Card>
                  <CardContent className="flex items-center justify-between py-3">
                    <span>{inv.email}</span>
                    <span className="text-sm text-muted-foreground">
                      {status}
                    </span>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function ClientPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Suspense fallback={<div className="h-24" />}>
        <ClientDetails params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}