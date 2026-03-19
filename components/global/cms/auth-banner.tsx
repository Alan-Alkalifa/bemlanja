import React from "react";
import { ShieldCheck, BadgeCheck, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import Link from "next/link";

// Map icon name strings from the DB to actual Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  BadgeCheck,
  Store,
  ShieldCheck,
};

export async function AuthBanner() {
  const supabase = await createClient();

  // Fetch all banner content in parallel
  // Note: .schema() must be called on the client before .from()
  const cmsClient = supabase.schema("cms");
  const [bannerRes, featuresRes, testimonialRes] = await Promise.all([
    cmsClient
      .from("auth_banner")
      .select("headline, headline_accent, description")
      .eq("is_active", true)
      .single(),
    cmsClient
      .from("auth_banner_features")
      .select("id, icon, title, description, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    cmsClient
      .from("auth_banner_testimonials")
      .select("quote, author_name, author_role, initials")
      .eq("is_active", true)
      .single(),
  ]);

  // Fallbacks so the banner never breaks if the DB is empty
  const banner = bannerRes.data ?? {
    headline: "Buy & sell with",
    headline_accent: "confidence.",
    description:
      "Join thousands of buyers and verified sellers on Indonesia's trusted marketplace. Secure payments, real products, real people.",
  };
  const features = featuresRes.data ?? [];
  const testimonial = testimonialRes.data ?? {
    quote:
      "Setting up my store on Bemlanja took less than 5 minutes. Sales started coming in the same day!",
    author_name: "Andi Rahmat",
    author_role: "Seller, ElektronikMurah Store",
    initials: "AR",
  };

  return (
    <div className="hidden lg:flex w-1/2 bg-sidebar relative overflow-hidden flex-col justify-between p-12 border-r border-border">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      {/* Dynamic Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231da1f2' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        <Link href="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity w-fit">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            bemlanja
          </span>
        </Link>


        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          {banner.headline} <br className="hidden xl:block" />
          <span className="text-primary">{banner.headline_accent}</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mb-12 leading-relaxed">
          {banner.description}
        </p>

        {features.length > 0 && (
          <div className="space-y-6">
            {features.map((feature) => {
              const IconComponent = ICON_MAP[feature.icon] ?? ShieldCheck;
              return (
                <div key={feature.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="p-6 rounded-2xl bg-background/50 backdrop-blur-md border border-border shadow-sm">
          <p className="text-sm italic text-muted-foreground mb-4">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {testimonial.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {testimonial.author_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {testimonial.author_role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
