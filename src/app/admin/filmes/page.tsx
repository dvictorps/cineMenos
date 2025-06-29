"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listarFilmes, desativarFilme, ativarFilme } from "@/actions";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useTextFilter } from "@/hooks/useFilters";
import { useLoadingState } from "@/hooks/useLoadingState";
import { Loading } from "@/components/ui/loading";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatters } from "@/lib/formatters";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

export default function FilmesPage() {
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("todos");

  const listarFilmesCallback = useCallback(() => {
    return listarFilmes();
  }, []);

  const {
    data: filmes,
    loading,
    error,
    refetch,
  } = useAsyncData(listarFilmesCallback, []);

  const { withLoading } = useLoadingState();

  // Lógica de filtros com hook personalizado
  const filmesComTextoFiltrado = useTextFilter(filmes || [], filtroTexto, [
    "titulo",
  ]);

  const filmesFiltrados = filmesComTextoFiltrado.filter((filme) => {
    if (filtroGenero !== "todos") {
      return filme.genero.toLowerCase() === filtroGenero.toLowerCase();
    }
    return true;
  });

  // Obter gêneros únicos
  const generosUnicos = Array.from(
    new Set((filmes || []).map((filme) => filme.genero))
  );

  const handleToggleAtivo = async (filmeId: string, ativo: boolean) => {
    const action = ativo ? desativarFilme : ativarFilme;

    await withLoading(
      async () => {
        const result = await action(filmeId);
        if (result.success) {
          refetch();
        }
        return result;
      },
      {
        successMessage: ativo
          ? "Filme desativado com sucesso!"
          : "Filme ativado com sucesso!",
        errorMessage: "Erro ao alterar status do filme",
      }
    );
  };

  if (loading) {
    return <Loading fullScreen text="Carregando filmes..." />;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={refetch}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Filmes
          </h2>
          <p className="text-muted-foreground">
            Gerencie o catálogo de filmes do cinema
          </p>
        </div>
        <Link href="/admin/filmes/novo">
          <Button className="transition-all duration-200 hover:scale-105">
            <Plus className="mr-2 h-4 w-4" />
            Novo Filme
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título..."
                  className="pl-10"
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                />
              </div>
            </div>
            <Select value={filtroGenero} onValueChange={setFiltroGenero}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os gêneros</SelectItem>
                {generosUnicos.map((genero) => (
                  <SelectItem key={genero} value={genero}>
                    {genero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Filmes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Catálogo ({filmesFiltrados.length} filmes)</span>
            <Badge variant="secondary">{filmesFiltrados.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filmesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {filtroTexto || filtroGenero !== "todos"
                  ? "Nenhum filme encontrado"
                  : "Nenhum filme cadastrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filtroTexto || filtroGenero !== "todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando o primeiro filme ao catálogo"}
              </p>
              <Link href="/admin/filmes/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Primeiro Filme
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header da tabela - apenas em desktop */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div className="col-span-4">Filme</div>
                <div className="col-span-2">Gênero</div>
                <div className="col-span-1">Duração</div>
                <div className="col-span-2">Classificação</div>
                <div className="col-span-2">Criado em</div>
                <div className="col-span-1">Ações</div>
              </div>

              {/* Lista de filmes */}
              {filmesFiltrados.map((filme) => (
                <div
                  key={filme.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors duration-200 group cursor-pointer"
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-white">
                          {filme.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {filme.descricao}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{filme.genero}</Badge>
                      <StatusBadge
                        status={
                          filme.classificacao as
                            | "LIVRE"
                            | "10"
                            | "12"
                            | "14"
                            | "16"
                            | "18"
                        }
                      />
                      <StatusBadge
                        status={filme.ativo ? "active" : "inactive"}
                      />
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatters.duration(filme.duracao)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {formatters.date(filme.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/admin/filmes/${filme.id}/editar`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground hover:text-blue-400"
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleAtivo(filme.id, filme.ativo)
                          }
                          className={
                            filme.ativo
                              ? "text-red-600 hover:text-red-700"
                              : "text-green-600 hover:text-green-700"
                          }
                        >
                          {filme.ativo ? (
                            <>
                              <Trash2 className="mr-1 h-3 w-3" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-1 h-3 w-3" />
                              Ativar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:contents">
                    <div className="col-span-4">
                      <div>
                        <h3 className="font-semibold text-white">
                          {filme.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {filme.descricao}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Badge variant="outline">{filme.genero}</Badge>
                    </div>

                    <div className="col-span-1">
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatters.duration(filme.duracao)}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex gap-2">
                        <StatusBadge
                          status={
                            filme.classificacao as
                              | "LIVRE"
                              | "10"
                              | "12"
                              | "14"
                              | "16"
                              | "18"
                          }
                        />
                        <StatusBadge
                          status={filme.ativo ? "active" : "inactive"}
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">
                        {formatters.date(filme.createdAt)}
                      </span>
                    </div>

                    <div className="col-span-1">
                      <div className="flex gap-1">
                        <Link href={`/admin/filmes/${filme.id}/editar`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-blue-400 hover:scale-110 transition-all duration-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleToggleAtivo(filme.id, filme.ativo)
                          }
                          className={`h-8 w-8 hover:scale-110 transition-all duration-200 ${
                            filme.ativo
                              ? "text-red-600 hover:text-red-700"
                              : "text-green-600 hover:text-green-700"
                          }`}
                          title={
                            filme.ativo ? "Desativar Filme" : "Ativar Filme"
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
