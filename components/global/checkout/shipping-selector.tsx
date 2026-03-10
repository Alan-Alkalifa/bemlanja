"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ShippingService {
  courier: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface ShippingSelectorProps {
  originDistrictId: string | null | undefined;
  destinationDistrictId: string | null | undefined;
  totalWeightGrams: number;
  selectedService: ShippingService | null;
  onSelect: (service: ShippingService) => void;
}

const COURIERS = ["jne", "tiki", "pos"];

function formatRupiah(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

export function ShippingSelector({
  originDistrictId,
  destinationDistrictId,
  totalWeightGrams,
  selectedService,
  onSelect,
}: ShippingSelectorProps) {
  const [services, setServices] = useState<ShippingService[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchCosts = async () => {
    if (!originDistrictId || !destinationDistrictId) {
      toast.error("Origin or destination district ID is missing. Please fill in the address location properly.");
      return;
    }
    if (totalWeightGrams <= 0) {
      toast.error("No product weight data available.");
      return;
    }

    setLoading(true);
    setFetched(false);

    const allServices: ShippingService[] = [];

    for (const courier of COURIERS) {
      try {
        const res = await fetch("/api/shipping/cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: originDistrictId,
            destination: destinationDistrictId,
            weight: totalWeightGrams,
            courier,
          }),
        });
        const data = await res.json();
        if (data.services) {
          allServices.push(...data.services);
        }
      } catch (e) {
        console.error(`Failed to fetch ${courier} costs`, e);
      }
    }

    setServices(allServices);
    setFetched(true);
    setLoading(false);

    if (allServices.length === 0) {
      toast.error("No shipping services available for this route. Check District IDs.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {!fetched && (
        <Button
          variant="outline"
          onClick={fetchCosts}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Truck className="size-4" />
          )}
          {loading ? "Loading shipping options..." : "Check Shipping Rates"}
        </Button>
      )}

      {fetched && services.length > 0 && (
        <div className="flex flex-col gap-2">
          {services.map((svc, i) => {
            const isSelected =
              selectedService?.code === svc.code &&
              selectedService?.service === svc.service;
            return (
              <button
                key={i}
                onClick={() => onSelect(svc)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80 bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-4 rounded-full border-2 shrink-0 ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-bold uppercase">
                          {svc.code}
                        </Badge>
                        <span className="font-semibold text-sm">{svc.service}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        {svc.etd && svc.etd !== "-" && (
                          <>
                            <Clock className="size-3" />
                            <span>{svc.etd} days</span>
                            <span className="text-border">·</span>
                          </>
                        )}
                        <span>{svc.description}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-foreground shrink-0">
                    {formatRupiah(svc.cost)}
                  </span>
                </div>
              </button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCosts}
            disabled={loading}
            className="text-xs text-muted-foreground"
          >
            {loading ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
            Refresh rates
          </Button>
        </div>
      )}

      {fetched && services.length === 0 && !loading && (
        <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
          <Truck className="size-6 mx-auto mb-2 opacity-40" />
          No shipping services found. Check district location.
        </div>
      )}
    </div>
  );
}
