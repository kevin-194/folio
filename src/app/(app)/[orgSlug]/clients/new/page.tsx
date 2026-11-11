import { Suspense } from "react";
import { addClient } from "./actions";
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

async function NewClientForm({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orgSlug } = await params;
  const { error } = await searchParams;

  return (
    <form action={addClient} className="flex flex-col gap-4">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Client name</Label>
        <Input id="name" name="name" placeholder="Blue Bakery" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="owner@bluebakery.com"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit">Add client</Button>
    </form>
  );
}

export default function NewClientPage({
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
          <CardTitle className="text-2xl">New client</CardTitle>
          <CardDescription>
            Add a customer you'll be sharing work with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-48" />}>
            <NewClientForm params={params} searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}