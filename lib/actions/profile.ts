"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Profile ─────────────────────────────────────────────────────────────────

export async function updateProfile(formData: {
  full_name: string;
  phone: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.full_name,
      phone: formData.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("userId", user.id);

  if (error) return { error: error.message };
  revalidatePath("/protected/profile");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  // 1. Upload to storage
  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("Avatar")
    .upload(filePath, file);

  if (uploadError) return { error: "Upload failed: " + uploadError.message };

  // 2. Get Public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("Avatar").getPublicUrl(filePath);

  // 3. Update Profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("userId", user.id);

  if (updateError)
    return { error: "Update profile failed: " + updateError.message };

  revalidatePath("/protected/profile");
  return { success: true, url: publicUrl };
}

export async function deleteAvatar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Get current avatar to delete from storage if needed
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("userId", user.id)
    .single();

  if (profile?.avatar_url) {
    // Extract path from URL (a bit brittle but works for standard Supabase URLs)
    // URL: https://.../storage/v1/object/public/Avatar/userId/avatar-123.png
    // We need: userId/avatar-123.png
    const pathParts = profile.avatar_url.split("/Avatar/");
    if (pathParts.length > 1) {
      const filePath = pathParts[1];
      await supabase.storage.from("Avatar").remove([filePath]);
    }
  }

  // 2. Clear from profile
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("userId", user.id);

  if (error) return { error: error.message };

  revalidatePath("/protected/profile");
  return { success: true };
}

// ── Addresses ───────────────────────────────────────────────────────────────

export async function upsertAddress(formData: {
  addressId?: string;
  label: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  province_id: string;
  province_name: string;
  city_id: string;
  city_name: string;
  district_id: string;
  district_name: string;
  subdistrict_id?: string;
  subdistrict_name?: string;
  postal_code: string;
  is_default: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // If setting as default, clear all other defaults first
  if (formData.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("userId", user.id);
  }

  const payload = {
    userId: user.id,
    label: formData.label,
    recipient_name: formData.recipient_name,
    phone: formData.phone,
    street_address: formData.street_address,
    province_id: formData.province_id,
    province_name: formData.province_name,
    city_id: formData.city_id,
    city_name: formData.city_name,
    district_id: formData.district_id,
    district_name: formData.district_name,
    subdistrict_id: formData.subdistrict_id || null,
    subdistrict_name: formData.subdistrict_name || null,
    postal_code: formData.postal_code,
    is_default: formData.is_default,
    updated_at: new Date().toISOString(),
  };

  if (formData.addressId) {
    const { data: updatedData, error } = await supabase
      .from("user_addresses")
      .update(payload)
      .eq("addressId", formData.addressId)
      .eq("userId", user.id)
      .select()
      .single();
    if (error) return { error: error.message };
    revalidatePath("/protected/profile");
    return { success: true, data: updatedData };
  } else {
    const { data: insertedData, error } = await supabase
      .from("user_addresses")
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) return { error: error.message };
    revalidatePath("/protected/profile");
    return { success: true, data: insertedData };
  }
}

export async function setDefaultAddress(addressId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase
    .from("user_addresses")
    .update({ is_default: false })
    .eq("userId", user.id);

  const { error } = await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("addressId", addressId)
    .eq("userId", user.id);

  if (error) return { error: error.message };
  revalidatePath("/protected/profile");
  return { success: true };
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("addressId", addressId)
    .eq("userId", user.id);

  if (error) return { error: error.message };
  revalidatePath("/protected/profile");
  return { success: true };
}
