"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MapPin, Plus, Check, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationSelector, LocationData } from "./location-selector";

export interface UserAddress {
  addressId: string;
  label: string;
  recipient_name: string;
  phone: string | null;
  street_address: string;
  city_name: string | null;
  district_name: string | null;
  province_name: string | null;
  postal_code: string | null;
  city_id: string | null;
  district_id: string | null;
  subdistrict_id: string | null;
  subdistrict_name: string | null;
  is_default: boolean;
}

interface AddressSelectorProps {
  addresses: UserAddress[];
  selectedAddressId: string | null;
  onSelect: (address: UserAddress) => void;
  onAddressAdded: (address: UserAddress) => void;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelect,
  onAddressAdded,
}: AddressSelectorProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    label: string;
    recipient_name: string;
    phone: string;
    street_address: string;
    postal_code: string;
    is_default: boolean;
  } & LocationData>({
    label: "",
    recipient_name: "",
    phone: "",
    street_address: "",
    postal_code: "",
    is_default: false,
    province_id: null,
    province_name: null,
    city_id: null,
    city_name: null,
    district_id: null,
    district_name: null,
    subdistrict_id: null,
    subdistrict_name: null,
  });

  const supabase = createClient();

  const handleAddAddress = async () => {
    if (!form.label || !form.recipient_name || !form.street_address || !form.district_id) {
      toast.error("Please fill in all required fields, including District via Location Selector");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_addresses")
      .insert({
        userId: user.id,
        label: form.label,
        recipient_name: form.recipient_name,
        phone: form.phone || null,
        street_address: form.street_address,
        postal_code: form.postal_code || null,
        province_id: form.province_id || null,
        province_name: form.province_name || null,
        city_id: form.city_id || null,
        city_name: form.city_name || null,
        district_id: form.district_id || null,
        district_name: form.district_name || null,
        subdistrict_id: form.subdistrict_id || null,
        subdistrict_name: form.subdistrict_name || null,
        is_default: form.is_default,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add address");
      console.error(error);
    } else if (data) {
      toast.success("Address added");
      onAddressAdded(data as UserAddress);
      setAddOpen(false);
      setForm({
        label: "",
        recipient_name: "",
        phone: "",
        street_address: "",
        postal_code: "",
        is_default: false,
        province_id: null,
        province_name: null,
        city_id: null,
        city_name: null,
        district_id: null,
        district_name: null,
        subdistrict_id: null,
        subdistrict_name: null,
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {addresses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          <MapPin className="size-8 mx-auto mb-2 opacity-40" />
          No saved addresses. Add one to continue.
        </div>
      ) : (
        <div className="grid gap-3">
          {addresses.map((addr) => {
            const isSelected = addr.addressId === selectedAddressId;
            return (
              <button
                key={addr.addressId}
                onClick={() => onSelect(addr)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80 bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {isSelected && (
                        <Check className="size-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Home className="size-3" />
                        <span>{addr.recipient_name}</span>
                      </div>
                      {addr.phone && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          <Phone className="size-3" />
                          <span>{addr.phone}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {addr.street_address}
                        {addr.subdistrict_name && `, ${addr.subdistrict_name}`}
                        {addr.district_name && `, ${addr.district_name}`}
                        {addr.city_name && `, ${addr.city_name}`}
                        {addr.province_name && `, ${addr.province_name}`}
                        {addr.postal_code && ` ${addr.postal_code}`}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full gap-2 border-dashed" size="sm">
            <Plus className="size-4" />
            Add New Address
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="addr-label">Label *</Label>
                <Input
                  id="addr-label"
                  placeholder="Home, Office..."
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="addr-recipient">Recipient Name *</Label>
                <Input
                  id="addr-recipient"
                  placeholder="Full name"
                  value={form.recipient_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, recipient_name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-phone">Phone</Label>
              <Input
                id="addr-phone"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-street">Street Address *</Label>
              <Input
                id="addr-street"
                placeholder="Jl. Contoh No. 1, RT/RW..."
                value={form.street_address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, street_address: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5 -mx-1 px-1">
              <Label>Location (RajaOngkir) *</Label>
              <LocationSelector
                value={{
                  province_id: form.province_id,
                  province_name: form.province_name,
                  city_id: form.city_id,
                  city_name: form.city_name,
                  district_id: form.district_id,
                  district_name: form.district_name,
                  subdistrict_id: form.subdistrict_id,
                  subdistrict_name: form.subdistrict_name,
                }}
                onChange={(loc) => setForm((f) => ({ ...f, ...loc }))}
                disabled={loading}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-postal">Postal Code</Label>
              <Input
                id="addr-postal"
                placeholder="12345"
                value={form.postal_code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postal_code: e.target.value }))
                }
              />
            </div>
            <Button onClick={handleAddAddress} disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
