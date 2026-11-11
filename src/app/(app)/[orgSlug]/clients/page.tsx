import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Params = Promise<{ orgSlug: string }>;

async function ClientsList({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org) notFound();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">{org.name}</p>
        </div>
        <Link href={`/${orgSlug}/clients/new`} className={buttonVariants()}>
  New client
</Link>
      </div>

      {!clients || clients.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No clients yet. Add your first one to get started.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {clients.map((client) => (
            <li key={client.id}>
              <Card>
                <CardContent className="flex flex-col py-4">
                  <span className="font-medium">{client.name}</span>
                  {client.email && (
                    <span className="text-sm text-muted-foreground">
                      {client.email}
                    </span>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function ClientsPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Suspense fallback={<div className="h-24" />}>
        <ClientsList params={params} />
      </Suspense>
    </main>
  );
}