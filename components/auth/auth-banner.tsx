import React from "react";
import { ShieldCheck, Lock, Users } from "lucide-react";

export function AuthBanner() {
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
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            bemlanja
          </span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Secure, seamless <br className="hidden xl:block" />
          <span className="text-primary">authentication.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mb-12 leading-relaxed">
          Access your account to manage your projects, collaborate with your
          team, and build faster than ever before.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Enterprise-grade Security
              </h3>
              <p className="text-sm text-muted-foreground">
                Your data is protected with the highest industry standards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Collaborative Workspace
              </h3>
              <p className="text-sm text-muted-foreground">
                Invite team members and manage roles effortlessly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="p-6 rounded-2xl bg-background/50 backdrop-blur-md border border-border shadow-sm">
          <p className="text-sm italic text-muted-foreground mb-4">
            "The authentication flow is incredibly smooth. It integrated
            perfectly with our existing infrastructure in minutes."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              JD
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Jane Doe</p>
              <p className="text-xs text-muted-foreground">CTO, TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
