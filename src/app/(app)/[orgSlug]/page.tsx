import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

async function OrgDetails({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org) notFound();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">{org.name}</h1>
      <p className="mt-2 text-muted-foreground">/{org.slug}</p>
      <Link className="mt-4 inline-block underline" href={`/${org.slug}/clients`}>
  Clients →
</Link>
    </main>
  );
}

export default function OrgPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <OrgDetails params={params} />
    </Suspense>
  );
}