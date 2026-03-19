import { cache } from "react";
import { createClient } from "../supabase/server";

/**
 * Fetches the current user's profile data.
 * Wrapped in React.cache to deduplicate requests within a single Page render.
 */
export const getProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: null };

  return supabase
    .from("profiles")
    .select("userId, full_name, email, phone, avatar_url, role, created_at")
    .eq("userId", user.id)
    .single();
});

/**
 * Fetches the current user's addresses.
 * Wrapped in React.cache to deduplicate requests within a single Page render.
 */
export const getAddresses = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: null };

  return supabase
    .from("user_addresses")
    .select("*")
    .eq("userId", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
});
