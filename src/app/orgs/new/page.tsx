import { Suspense } from "react";
import { createOrganization } from "./actions";
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

async function NewOrgForm({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;

  return (
    <form action={createOrganization} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Organization name</Label>
        <Input id="name" name="name" placeholder="Acme Studio" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">URL</Label>
        <Input id="slug" name="slug" placeholder="acme-studio" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit">Create organization</Button>
    </form>
  );
}

export default function NewOrgPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create your workspace</CardTitle>
          <CardDescription>
            This is where you'll manage clients and projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-48" />}>
            <NewOrgForm searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}