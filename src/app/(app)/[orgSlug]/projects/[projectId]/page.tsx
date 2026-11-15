import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { addMilestone, toggleMilestone } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type Params = Promise<{ orgSlug: string; projectId: string }>;
type SearchParams = Promise<{ error?: string }>;

async function ProjectDetails({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orgSlug, projectId } = await params;
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, client_id")
    .eq("id", projectId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!project) notFound();

  const { data: client } = await supabase
    .from("clients")
    .select("name")
    .eq("id", project.client_id)
    .maybeSingle();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, title, due_date, is_done")
    .eq("project_id", project.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  const doneCount = (milestones ?? []).filter((m) => m.is_done).length;
  const total = milestones?.length ?? 0;

  return (
    <>
      <Link
        href={`/${orgSlug}/projects`}
        className="text-sm text-muted-foreground underline"
      >
        ← Projects
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            {client?.name ?? "Unknown client"}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <h2 className="mt-8 text-lg font-semibold">
        Milestones{" "}
        <span className="text-sm font-normal text-muted-foreground">
          {doneCount}/{total} done
        </span>
      </h2>

      {total === 0 ? (
        <p className="mt-3 text-muted-foreground">No milestones yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {milestones!.map((m) => (
            <li key={m.id}>
              <Card>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex flex-col">
                    <span
                      className={
                        m.is_done ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {m.title}
                    </span>
                    {m.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Due {m.due_date}
                      </span>
                    )}
                  </div>
                  <form action={toggleMilestone}>
                    <input type="hidden" name="orgSlug" value={orgSlug} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="milestoneId" value={m.id} />
                    <input
                      type="hidden"
                      name="done"
                      value={m.is_done ? "false" : "true"}
                    />
                    <Button type="submit" variant="outline" size="sm">
                      {m.is_done ? "Reopen" : "Mark done"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <form action={addMilestone} className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <input type="hidden" name="projectId" value={project.id} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">New milestone</Label>
          <Input id="title" name="title" placeholder="Wireframes approved" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Due date (optional)</Label>
          <Input id="dueDate" name="dueDate" type="date" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="self-start">
          Add milestone
        </Button>
      </form>
    </>
  );
}

export default function ProjectPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Suspense fallback={<div className="h-24" />}>
        <ProjectDetails params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
