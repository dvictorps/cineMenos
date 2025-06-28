"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Film, Calendar, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    name: "Filmes",
    href: "/admin/filmes",
    icon: Film,
  },
  {
    name: "Sessões",
    href: "/admin/sessoes",
    icon: Calendar,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col h-screen shadow-lg lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          boxShadow: isOpen ? "inset -2px 0 4px rgba(0, 0, 0, 0.1)" : undefined,
        }}
      >
        <div className="p-6 flex-shrink-0 border-b border-border/30">
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-110">
              <span className="text-primary-foreground font-bold text-xs">
                C
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                CineMenos
              </h1>
              <p className="text-xs text-muted-foreground transition-colors group-hover:text-muted-foreground/80">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6">
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Navegação
            </h2>
          </div>
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname?.startsWith(item.href));

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer group relative overflow-hidden border-l-2",
                      isActive
                        ? "bg-secondary text-secondary-foreground shadow-sm border-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:scale-[1.02] hover:translate-x-1 border-transparent hover:border-accent-foreground/20"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200",
                        isActive
                          ? "text-white"
                          : "text-muted-foreground group-hover:text-accent-foreground group-hover:scale-110"
                      )}
                    />
                    {item.name}

                    {/* Efeito de slide no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
