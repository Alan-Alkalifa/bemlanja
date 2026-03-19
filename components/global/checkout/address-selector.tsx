"use client";

import { Check, MapPin, Phone, User, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AddressDialog from "@/components/global/profile/AddressDialog";

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
  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/5">
          <MapPin className="size-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No saved addresses</p>
          <p className="text-xs mt-1">Add a shipping address to continue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const isSelected = addr.addressId === selectedAddressId;
            return (
              <button
                key={addr.addressId}
                onClick={() => onSelect(addr)}
                className={`group relative text-left p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent bg-muted/10 hover:bg-muted/20"
                }`}
              >
                <div className="flex flex-col h-full gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground tracking-tight">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold px-1.5 py-0">
                          Default
                        </Badge>
                      )}
                    </div>
                    {isSelected && (
                      <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="size-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm text-foreground/80">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <User className="size-3.5 text-muted-foreground" />
                      {addr.recipient_name}
                    </div>
                    {addr.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-muted-foreground" />
                        {addr.phone}
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 mt-1 leading-relaxed text-xs">
                      <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="line-clamp-2">
                        {addr.street_address}, {addr.subdistrict_name && `${addr.subdistrict_name}, `}
                        {addr.district_name}, {addr.city_name}, {addr.province_name} {addr.postal_code}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <AddressDialog mode="create" onSuccess={onAddressAdded}>
        <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 bg-transparent hover:bg-muted/10 text-sm font-bold gap-2 group transition-all duration-300">
          <div className="size-6 rounded-full bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Plus className="size-4" />
          </div>
          Add New Delivery Address
        </Button>
      </AddressDialog>
    </div>
  );
}

