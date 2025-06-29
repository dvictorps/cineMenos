"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useCallback } from "react";

const pageConfig = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Visão geral do sistema",
  },
  "/admin/filmes": {
    title: "Gerenciar Filmes",
    subtitle: "Cadastre e edite filmes em cartaz",
    action: {
      label: "Novo Filme",
      href: "/admin/filmes/novo",
      icon: Plus,
    },
  },
  "/admin/sessoes": {
    title: "Gerenciar Sessões",
    subtitle: "Cadastre e edite sessões de cinema",
    action: {
      label: "Nova Sessão",
      href: "/admin/sessoes/nova",
      icon: Plus,
    },
  },
  "/admin/relatorios": {
    title: "Relatórios",
    subtitle: "Visualize estatísticas e dados",
  },
};

export function AdminHeader() {
  const pathname = usePathname();

  const currentPage = useMemo(() => {
    return Object.entries(pageConfig).find(([path]) => {
      if (path === "/admin") {
        return pathname === path;
      }
      return pathname?.startsWith(path);
    })?.[1];
  }, [pathname]);

  // Detectar se é uma página de edição, criação, ou subpágina
  const isSubPage = useMemo(() => {
    return pathname && pathname.split("/").length > 3;
  }, [pathname]);

  // Definir URL de voltar baseada na estrutura da rota
  const getBackUrl = useCallback(() => {
    if (!pathname) return "/admin";

    // Para páginas de edição/criação, voltar para a listagem
    if (
      pathname.includes("/admin/filmes/") &&
      (pathname.includes("/editar") || pathname.includes("/novo"))
    ) {
      return "/admin/filmes";
    }
    if (
      pathname.includes("/admin/sessoes/") &&
      (pathname.includes("/editar") || pathname.includes("/nova"))
    ) {
      return "/admin/sessoes";
    }

    // Para outras subpáginas, voltar para a página pai
    const parts = pathname.split("/");
    if (parts.length > 3) {
      return parts.slice(0, 3).join("/");
    }

    return "/admin";
  }, [pathname]);

  if (!currentPage) {
    return (
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mr-4 btn-voltar">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Voltar</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0 flex-1">
          {isSubPage && (
            <Link href={getBackUrl()}>
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 lg:mr-4 flex-shrink-0 btn-voltar"
              >
                <ArrowLeft className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Voltar</span>
              </Button>
            </Link>
          )}

          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-semibold text-foreground truncate">
              {currentPage.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {"action" in currentPage && currentPage.action && !isSubPage && (
            <Link href={currentPage.action.href}>
              <Button size="sm" className="lg:px-4">
                <currentPage.action.icon className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">
                  {currentPage.action.label}
                </span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
