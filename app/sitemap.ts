import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

// Use public anon client — no auth cookies needed, safe for Googlebot
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all active products
  const { data: products } = await supabase
    .from("products")
    .select("productId, createdAt")
    .eq("is_active", true)
    .is("deletedAt", null);

  // Fetch all active stores
  const { data: stores } = await supabase
    .from("organizations")
    .select("slug, createdAt")
    .eq("status", "active")
    .is("deletedAt", null);

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${siteUrl}/products/${p.productId}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const storeUrls: MetadataRoute.Sitemap = (stores ?? []).map((s) => ({
    url: `${siteUrl}/stores/${s.slug}`,
    lastModified: new Date(s.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    ...storeUrls,
    ...productUrls,
  ];
}
