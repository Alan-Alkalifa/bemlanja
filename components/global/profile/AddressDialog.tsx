"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationSelector } from "@/components/global/checkout/location-selector";


import { upsertAddress } from "@/lib/actions/profile";

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
  mode: "create" | "edit";
  address?: Address;
  onSuccess?: (address: any) => void;
  children: React.ReactNode;
}

export default function AddressDialog({
  mode,
  address,
  onSuccess,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    label: address?.label ?? "",
    recipient_name: address?.recipient_name ?? "",
    phone: address?.phone ?? "",
    street_address: address?.street_address ?? "",
    province_id: address?.province_id ?? "",
    province_name: address?.province_name ?? "",
    city_id: address?.city_id ?? "",
    city_name: address?.city_name ?? "",
    district_id: address?.district_id ?? "",
    district_name: address?.district_name ?? "",
    subdistrict_id: address?.subdistrict_id ?? "",
    subdistrict_name: address?.subdistrict_name ?? "",
    postal_code: address?.postal_code ?? "",
    is_default: address?.is_default ?? false,
  });

  function handleChange(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (
      !form.recipient_name ||
      !form.phone ||
      !form.street_address ||
      !form.city_name ||
      !form.province_name ||
      !form.postal_code
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    startTransition(async () => {
      const result = await upsertAddress({
        addressId: address?.addressId,
        ...form,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Address added" : "Address updated");
        if (onSuccess) onSuccess((result as any).data);
        setOpen(false);
      }
    });
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {mode === "create" ? "Add New Address" : "Edit Address"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details for your delivery address."
              : "Update the details for this address."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-1">
            {/* Label */}
            <Field label="Label (e.g. Home, Office)" required>
              <Input
                placeholder="Home"
                value={form.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("label", e.target.value)}
                className="rounded-xl border-none bg-muted/20 focus-visible:bg-background"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              {/* Recipient */}
              <Field label="Recipient Name" required className="col-span-2 sm:col-span-1">
                <Input
                  placeholder="Full name"
                  value={form.recipient_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("recipient_name", e.target.value)}
                  className="rounded-xl border-none bg-muted/20 focus-visible:bg-background"
                />
              </Field>
              {/* Phone */}
              <Field label="Phone" required className="col-span-2 sm:col-span-1">
                <Input
                  placeholder="+62..."
                  value={form.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("phone", e.target.value)}
                  className="rounded-xl border-none bg-muted/20 focus-visible:bg-background"
                />
              </Field>
            </div>

            {/* Street */}
            <Field label="Street Address" required>
              <Input
                placeholder="Jl. Example No. 123"
                value={form.street_address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("street_address", e.target.value)}
                className="rounded-xl border-none bg-muted/20 focus-visible:bg-background"
              />
            </Field>

            <div className="flex flex-col gap-1.5 -mx-1 px-1">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                Location (RajaOngkir) <span className="text-destructive ml-0.5">*</span>
              </Label>
              <LocationSelector
                value={{
                  province_id: form.province_id,
                  province_name: form.province_name,
                  city_id: form.city_id,
                  city_name: form.city_name,
                  district_id: form.district_id,
                  district_name: form.district_name,
                  subdistrict_id: form.subdistrict_id || null,
                  subdistrict_name: form.subdistrict_name || null,
                }}
                onChange={(loc) => {
                  setForm((f) => ({
                    ...f,
                    province_id: loc.province_id || "",
                    province_name: loc.province_name || "",
                    city_id: loc.city_id || "",
                    city_name: loc.city_name || "",
                    district_id: loc.district_id || "",
                    district_name: loc.district_name || "",
                    subdistrict_id: loc.subdistrict_id || "",
                    subdistrict_name: loc.subdistrict_name || "",
                  }));
                }}
                disabled={isPending}
              />
            </div>

            {/* Postal */}
            <Field label="Postal Code" required>
              <Input
                placeholder="12345"
                value={form.postal_code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("postal_code", e.target.value)}
                className="rounded-xl border-none bg-muted/20 focus-visible:bg-background"
              />
            </Field>


            {/* Default checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="is_default"
                checked={form.is_default}
                onCheckedChange={(v: boolean) => handleChange("is_default", v)}
              />
              <Label htmlFor="is_default" className="text-sm font-normal cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : mode === "create" ? "Add Address" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
