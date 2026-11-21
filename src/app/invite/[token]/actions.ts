"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  token: z.string().min(20).max(200),
});

export async function acceptInvite(formData: FormData) {
  const parsed = schema.safeParse({
    token: String(formData.get("token") ?? ""),
  });

  if (!parsed.success) redirect("/");

  const token = parsed.data.token;
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.rpc("accept_client_invitation", {
    invite_token: token,
  });

  if (error) {
    // Our function's messages start with "This invitation" and are safe to show.
    // Anything else could be an internal detail, so we hide it.
    const message = error.message.startsWith("This invitation")
      ? error.message
      : "Something went wrong. Please ask for a new invitation.";
    redirect(
      `/invite/${encodeURIComponent(token)}?error=${encodeURIComponent(message)}`
    );
  }

  revalidatePath("/", "layout");
  redirect("/invite/accepted");
}