import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { addProject } from "./actions";
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

type Params = Promise<{ orgSlug: string }>;
type SearchParams = Promise<{ error?: string }>;

async function NewProjectForm({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orgSlug } = await params;
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org) notFound();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("org_id", org.id)
    .order("name");

  if (!clients || clients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You need a client before you can create a project.{" "}
        <Link className="underline" href={`/${orgSlug}/clients/new`}>
          Add a client
        </Link>
      </p>
    );
  }

  return (
    <form action={addProject} className="flex flex-col gap-4">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="clientId">Client</Label>
        <select
          id="clientId"
          name="clientId"
          required
          defaultValue=""
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="" disabled>
            Choose a client
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Project name</Label>
        <Input id="name" name="name" placeholder="Website redesign" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit">Create project</Button>
    </form>
  );
}

export default function NewProjectPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <main className="flex justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">New project</CardTitle>
          <CardDescription>
            Create a project for one of your clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-48" />}>
            <NewProjectForm params={params} searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}