"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface LocationData {
  province_id: string | null;
  province_name: string | null;
  city_id: string | null;
  city_name: string | null;
  district_id: string | null;
  district_name: string | null;
  subdistrict_id: string | null;
  subdistrict_name: string | null;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (value: LocationData) => void;
  disabled?: boolean;
}

// Helper types for RajaOngkir Responses
interface Option {
  id: string;
  name: string;
}

function Dropdown({
  label,
  placeholder,
  options,
  value,
  onSelect,
  loading,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: Option[];
  value: string | null;
  onSelect: (id: string, name: string) => void;
  loading: boolean;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedName = value ? options.find((o) => o.id === value)?.name || value : "";

  return (
    <div className="flex flex-col gap-1.5 flex-1 w-full">
      <Label className="text-xs text-muted-foreground font-semibold">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal text-left truncate h-10 px-3 bg-card"
          >
            {loading ? (
              <span className="flex items-center text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </span>
            ) : value ? (
              <span className="truncate">{selectedName}</span>
            ) : (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name} // CommandItem matches on text value
                    onSelect={() => {
                      onSelect(option.id, option.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function LocationSelector({ value, onChange, disabled }: LocationSelectorProps) {
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdistricts, setSubdistricts] = useState<Option[]>([]);

  const [loadingP, setLoadingP] = useState(false);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingS, setLoadingS] = useState(false);

  // 1. Fetch Provinces on Mount
  useEffect(() => {
    let mounted = true;
    setLoadingP(true);
    fetch("/api/shipping/location/province")
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        if (json.data && Array.isArray(json.data)) {
          setProvinces(json.data.map((p: any) => ({ id: String(p.id), name: p.name })));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoadingP(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch Cities when Province changes
  useEffect(() => {
    let mounted = true;
    if (!value.province_id) {
      setCities([]);
      return;
    }
    setLoadingC(true);
    fetch(`/api/shipping/location/city?province_id=${value.province_id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        if (json.data && Array.isArray(json.data)) {
          setCities(json.data.map((c: any) => ({ id: String(c.id), name: c.name })));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoadingC(false);
      });
    return () => {
      mounted = false;
    };
  }, [value.province_id]);

  // 3. Fetch Districts when City changes
  useEffect(() => {
    let mounted = true;
    if (!value.city_id) {
      setDistricts([]);
      return;
    }
    setLoadingD(true);
    fetch(`/api/shipping/location/district?city_id=${value.city_id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        if (json.data && Array.isArray(json.data)) {
          setDistricts(json.data.map((d: any) => ({ id: String(d.id), name: d.name })));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoadingD(false);
      });
    return () => {
      mounted = false;
    };
  }, [value.city_id]);

  // 4. Fetch Subdistricts when District changes
  useEffect(() => {
    let mounted = true;
    if (!value.district_id) {
      setSubdistricts([]);
      return;
    }
    setLoadingS(true);
    fetch(`/api/shipping/location/subdistrict?district_id=${value.district_id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        if (json.data && Array.isArray(json.data)) {
          setSubdistricts(json.data.map((s: any) => ({ id: String(s.id), name: s.name })));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoadingS(false);
      });
    return () => {
      mounted = false;
    };
  }, [value.district_id]);

  const handleProvinceSelect = (id: string, name: string) => {
    if (id === value.province_id) return;
    onChange({
      ...value,
      province_id: id,
      province_name: name,
      city_id: null,
      city_name: null,
      district_id: null,
      district_name: null,
      subdistrict_id: null,
      subdistrict_name: null,
    });
  };

  const handleCitySelect = (id: string, name: string) => {
    if (id === value.city_id) return;
    onChange({
      ...value,
      city_id: id,
      city_name: name,
      district_id: null,
      district_name: null,
      subdistrict_id: null,
      subdistrict_name: null,
    });
  };

  const handleDistrictSelect = (id: string, name: string) => {
    if (id === value.district_id) return;
    onChange({
      ...value,
      district_id: id,
      district_name: name,
      subdistrict_id: null,
      subdistrict_name: null,
    });
  };

  const handleSubdistrictSelect = (id: string, name: string) => {
    if (id === value.subdistrict_id) return;
    onChange({
      ...value,
      subdistrict_id: id,
      subdistrict_name: name,
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full border border-border/50 rounded-xl p-3 bg-muted/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Dropdown
          label="Province"
          placeholder="Select province..."
          options={provinces}
          value={value.province_id}
          onSelect={handleProvinceSelect}
          loading={loadingP}
          disabled={disabled || loadingP}
        />
        <Dropdown
          label="City / Regency"
          placeholder="Select city..."
          options={cities}
          value={value.city_id}
          onSelect={handleCitySelect}
          loading={loadingC}
          disabled={disabled || !value.province_id || loadingC}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Dropdown
          label="District (Kecamatan)"
          placeholder="Select district..."
          options={districts}
          value={value.district_id}
          onSelect={handleDistrictSelect}
          loading={loadingD}
          disabled={disabled || !value.city_id || loadingD}
        />
        <Dropdown
          label="Subdistrict (Desa/Kelurahan)"
          placeholder="Select subdistrict..."
          options={subdistricts}
          value={value.subdistrict_id}
          onSelect={handleSubdistrictSelect}
          loading={loadingS}
          disabled={disabled || !value.district_id || loadingS}
        />
      </div>
    </div>
  );
}
