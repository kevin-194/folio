"use server";

import { createHash,randomBytes } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  orgSlug: z.string().min(1),
  clientId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export async function createInvite(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const pageUrl = `/${encodeURIComponent(orgSlug)}/clients/${encodeURIComponent(clientId)}`;

  const parsed = schema.safeParse({
    orgSlug,
    clientId,
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect(
      `${pageUrl}?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", parsed.data.orgSlug)
    .maybeSingle();

  if (!org) redirect("/");

  // A long random secret. Only its hash goes into the database.
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { error } = await supabase.from("invitations").insert({
    org_id: org.id,
    client_id: parsed.data.clientId,
    email: parsed.data.email,
    token_hash: tokenHash,
    invited_by: user.id,
  });

  if (error) {
    const message =
      error.code === "23503"
        ? "That client doesn't belong to this organization"
        : error.message;
    redirect(`${pageUrl}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(pageUrl);
  redirect(`${pageUrl}?invite=${token}`);
}