"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Truck, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

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

  // Reset fetched state if destination changes
  useEffect(() => {
    if (fetched) {
      setFetched(false);
      setServices([]);
    }
  }, [destinationDistrictId, originDistrictId, totalWeightGrams]);


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
    <div className="flex flex-col gap-4">
      {!fetched && (
        <Button
          variant="outline"
          onClick={fetchCosts}
          disabled={loading}
          className="w-full h-14 rounded-2xl border-2 border-dashed bg-transparent hover:bg-muted/10 text-sm font-bold gap-2 group transition-all duration-300"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Truck className="size-4" />
            </div>
          )}
          {loading ? "Calculating rates..." : "Check Shipping Rates"}
        </Button>
      )}

      {fetched && services.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3">
            {services.map((svc, i) => {
              const isSelected =
                selectedService?.code === svc.code &&
                selectedService?.service === svc.service;
              return (
                <button
                  key={i}
                  onClick={() => onSelect(svc)}
                  className={`w-full text-left p-4 rounded-[1.25rem] border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-transparent bg-muted/10 hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <Check className="size-3 text-primary-foreground" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm uppercase tracking-tight">
                            {svc.code}
                          </span>
                          <span className="text-muted-foreground/40 font-light">|</span>
                          <span className="font-semibold text-sm">{svc.service}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          {svc.etd && svc.etd !== "-" && (
                            <>
                              <Clock className="size-3 text-primary/60" />
                              <span className="font-medium text-foreground/70">{svc.etd} days</span>
                              <span className="text-border mx-0.5">·</span>
                            </>
                          )}
                          <span className="line-clamp-1">{svc.description}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-foreground">
                        {formatRupiah(svc.cost)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCosts}
            disabled={loading}
            className="w-full h-10 rounded-xl text-xs text-muted-foreground hover:bg-muted/10 transition-colors mt-1"
          >
            {loading ? <Loader2 className="size-3 animate-spin mr-2" /> : <Loader2 className="size-3 mr-2 opacity-50" />}
            Refresh Available Rates
          </Button>
        </div>
      )}

      {fetched && services.length === 0 && !loading && (
        <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/5">
          <Truck className="size-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No services found</p>
          <p className="text-xs mt-1 px-4">Try checking your delivery location or district IDs</p>
          <Button variant="link" size="sm" onClick={fetchCosts} className="mt-2 text-primary">
            Try again
          </Button>
        </div>
      )}
    </div>

  );
}
