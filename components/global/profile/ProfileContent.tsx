"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  ShieldCheck,
  Calendar,
  Camera,
  Loader2,
  X,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  updateProfile,
  deleteAddress,
  setDefaultAddress,
  uploadAvatar,
  deleteAvatar,
} from "@/lib/actions/profile";
import AddressDialog from "./AddressDialog";

interface Profile {
  userId: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
}

interface Address {
  addressId: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  street_address: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string | null;
  province_name: string;
  postal_code: string;
  is_default: boolean;
  province_id: string;
  city_id: string;
  district_id: string;
  subdistrict_id: string | null;
}

interface Props {
  profile: Profile | null;
  addresses: Address[];
  userEmail: string;
}

export default function ProfileContent({
  profile,
  addresses,
  userEmail,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [avatarPending, setAvatarPending] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (profile?.full_name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || userEmail.charAt(0).toUpperCase();


  function handleProfileSave() {
    startTransition(async () => {
      const result = await updateProfile({ full_name: fullName, phone });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully");
      }
    });
  }

  function handleSetDefault(addressId: string) {
    startTransition(async () => {
      const result = await setDefaultAddress(addressId);
      if (result.error) toast.error(result.error);
      else toast.success("Default address updated");
    });
  }

  function handleDeleteAddress(addressId: string) {
    startTransition(async () => {
      const result = await deleteAddress(addressId);
      if (result.error) toast.error(result.error);
      else toast.success("Address deleted");
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPending(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar(formData);
    setAvatarPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Avatar updated");
    }
  }

  async function handleAvatarDelete() {
    setAvatarPending(true);
    const result = await deleteAvatar();
    setAvatarPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Avatar removed");
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 laptop:px-8 py-8 min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0">
          <User className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and addresses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Left: Avatar card ──────────────────────────── */}
        <div className="md:col-span-1 space-y-4">
          <Card className="rounded-[2.5rem] border-none bg-muted/20 shadow-none overflow-hidden">
            <CardContent className="pt-12 pb-10 flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-tr from-primary to-sky-400 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <Avatar className="size-32 text-3xl border-4 border-background relative shadow-md overflow-hidden bg-muted">
                  {avatarPending ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                      <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <AvatarImage
                        src={profile?.avatar_url ?? undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                        {initials || <User className="size-12 opacity-40" />}
                      </AvatarFallback>
                    </>

                  )}

                  {/* Overlay for Change Avatar */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarPending}
                      className="size-full flex flex-col items-center justify-center text-white"
                    >
                      <Camera className="size-7 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Change
                      </span>
                    </button>
                  </div>
                </Avatar>

                {/* Internal hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Delete button (fixed at corner) */}
                {profile?.avatar_url && !avatarPending && (
                  <button
                    onClick={handleAvatarDelete}
                    className="absolute -top-1 -right-1 size-8 rounded-full bg-background border shadow-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:scale-110 active:scale-95 transition-all z-20"
                    title="Remove avatar"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="text-center space-y-2">
                <h2 className="font-bold text-2xl tracking-tight text-foreground">
                  {profile?.full_name || "Guest User"}
                </h2>
                <p className="text-sm font-medium text-muted-foreground/80">
                  {userEmail}
                </p>
                <div className="pt-1">
                  <Badge className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-4 py-1 text-xs font-bold gap-1.5 shadow-sm border-none">
                    <ShieldCheck className="size-3.5 text-sky-400" />
                    Seller
                  </Badge>
                </div>
              </div>

              <div className="w-full h-px bg-border/40 mt-2" />

              <div className="w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <Calendar className="size-4 opacity-50" />
                <span>
                  Member since{" "}
                  {format(
                    new Date(profile?.created_at ?? Date.now()),
                    "MMMM yyyy",
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Edit + Addresses ───────────────────── */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal info */}
          <Card className="rounded-4xl border-none bg-muted/10 shadow-none">
            <CardHeader className="pb-4 pt-8 px-8">
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="size-4" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription className="ml-11">
                Update your display name and contact number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2 pb-8 px-8">
              {/* Email — readonly */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest pl-0.5">
                  <Mail className="size-3.5" /> Email
                </Label>
                <Input
                  value={userEmail}
                  disabled
                  className="bg-muted/30 border-none text-muted-foreground/70 h-11 px-4 rounded-xl cursor-default"
                />
              </div>

              {/* Full name */}
              <div className="space-y-2">
                <Label
                  htmlFor="full_name"
                  className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest pl-0.5"
                >
                  <User className="size-3.5" /> Full Name
                </Label>
                <Input
                  id="full_name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 px-4 rounded-xl border-none bg-muted/20 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest pl-0.5"
                >
                  <Phone className="size-3.5" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+62 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 px-4 rounded-xl border-none bg-muted/20 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleProfileSave}
                  disabled={isPending}
                  className="rounded-full px-10 h-12 font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/95"
                >
                  {isPending ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="size-4" />
                    </div>
                    Saved Addresses
                  </CardTitle>
                  <CardDescription className="ml-11 mt-0.5">
                    {addresses.length} address
                    {addresses.length !== 1 ? "es" : ""} saved
                  </CardDescription>
                </div>
                <AddressDialog mode="create">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-full gap-2 px-6 border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-medium"
                  >
                    <Plus className="size-4" /> Add Address
                  </Button>
                </AddressDialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl">
                  <MapPin className="size-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No addresses yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a delivery address to speed up checkout
                  </p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.addressId}
                    className="group relative flex flex-col sm:flex-row items-start gap-4 p-5 rounded-3xl bg-background/50 hover:bg-background border border-transparent hover:border-primary/10 transition-all duration-300"
                  >
                    <div className="size-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <MapPin className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1 sm:pr-20">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-base text-foreground/90">
                          {addr.label || "Address"}
                        </span>
                        {addr.is_default && (
                          <Badge className="bg-amber-400/10 text-amber-600 border-none text-[10px] font-black px-2.5 py-0.5 uppercase tracking-tighter gap-1 rounded-full pointer-events-none">
                            <Star className="size-2.5 fill-current" /> Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-bold text-foreground/70">
                        {addr.recipient_name}{" "}
                        <span className="text-muted-foreground/40 font-medium">
                          ·
                        </span>{" "}
                        {addr.phone}
                      </p>
                      <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-lg">
                        {addr.street_address}, {addr.district_name},{" "}
                        {addr.city_name}, {addr.province_name}{" "}
                        {addr.postal_code}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2 bg-muted/30 sm:bg-background/80 backdrop-blur-sm rounded-full p-1 border shadow-sm mt-3 sm:mt-0">
                      <AddressDialog mode="edit" address={addr}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </AddressDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl max-w-[400px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold">
                              Delete address?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              This will remove <strong>{addr.label}</strong>{" "}
                              from your profile.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel className="rounded-full border-none bg-muted hover:bg-muted/80">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6 font-bold"
                              onClick={() =>
                                handleDeleteAddress(addr.addressId)
                              }
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
