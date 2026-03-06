import { ThemeSwitcher } from "@/components/theme-switcher";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";

const layananLinks = [
  { label: "Bantuan", href: "/" },
  { label: "Daftar sebagai Mitra", href: "/" },
  { label: "Pengembalian Dana", href: "/" },
];

const jelajahiLinks = [
  { label: "Semua Produk", href: "/" },
  { label: "Kategori Populer", href: "/" },
  { label: "Daftar Mitra Toko", href: "/" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/20">
      <div className="w-full max-w-7xl mx-auto px-4 mobile:px-6 laptop:px-8 py-10 laptop:py-14">
        <div className="grid grid-cols-1 mobile:grid-cols-2 laptop:grid-cols-4 gap-8 laptop:gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              <span className="text-lg font-bold text-foreground">
                Bemlanja
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform jual beli resmi Universitas Pembangunan Jaya. Mendukung
              wirausaha dari civitas akademika UPJ.
            </p>
          </div>

          {/* Layanan */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">Layanan</h4>
            <ul className="flex flex-col gap-2">
              {layananLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jelajahi */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">Jelajahi</h4>
            <ul className="flex flex-col gap-2">
              {jelajahiLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hubungi Kami */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">
              Hubungi Kami
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2">
                <Mail className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  support@bemlanja.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Jl. Cendrawasih Raya Blok B7/P, Sawah Baru, Kec. Ciputat,
                  Tangerang Selatan.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-border/40" />

      <div className="w-full max-w-7xl mx-auto px-4 mobile:px-6 laptop:px-8 py-4 flex flex-col mobile:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          &copy; 2026 Bemlanja. All rights reserved.
        </p>
        <ThemeSwitcher />
      </div>
    </footer>
  );
}
