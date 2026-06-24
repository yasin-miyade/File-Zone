import { Link, useLocation } from "wouter";
import { Layers, Image as ImageIcon, FileText, ArrowRightLeft, Info, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/pdf", label: "PDF Tools", icon: FileText },
  { href: "/image", label: "Image Tools", icon: ImageIcon },
  { href: "/convert", label: "Convert", icon: ArrowRightLeft },
  { href: "/calculator", label: "Calculators", icon: Calculator },
  { href: "/about", label: "About", icon: Info },
];

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-primary p-1.5 rounded-lg">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">FileZone</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors",
                location === href || location.startsWith(href + "/")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu placeholder */}
        <div className="md:hidden" />
      </div>
    </header>
  );
}
