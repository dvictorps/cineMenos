"use client";

import { useEffect, useState } from "react";
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
import { listarFilmes } from "@/actions";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Filter,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface FilmeData {
  id: string;
  titulo: string;
  descricao: string;
  duracao: number;
  genero: string;
  classificacao: string;
  banner: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function FilmesPage() {
  const [filmes, setFilmes] = useState<FilmeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("todos");

  useEffect(() => {
    const carregarFilmes = async () => {
      try {
        const result = await listarFilmes();
        if (result.success && result.data) {
          setFilmes(result.data);
        }
      } catch (error) {
        console.error("Erro ao carregar filmes:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarFilmes();
  }, []);

  // Lógica de filtros
  const filmesFiltrados = filmes.filter((filme) => {
    // Filtro por texto (título)
    if (filtroTexto) {
      const filtroLower = filtroTexto.toLowerCase();
      if (!filme.titulo.toLowerCase().includes(filtroLower)) {
        return false;
      }
    }

    // Filtro por gênero
    if (filtroGenero !== "todos") {
      if (filme.genero.toLowerCase() !== filtroGenero.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Obter gêneros únicos
  const generosUnicos = Array.from(
    new Set(filmes.map((filme) => filme.genero))
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando filmes...</p>
        </div>
      </div>
    );
  }

  const getClassificacaoColor = (classificacao: string) => {
    switch (classificacao) {
      case "LIVRE":
        return "bg-green-600 text-white";
      case "10":
        return "bg-blue-600 text-white";
      case "12":
        return "bg-yellow-600 text-white";
      case "14":
        return "bg-orange-600 text-white";
      case "16":
        return "bg-red-600 text-white";
      case "18":
        return "bg-purple-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

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
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors duration-200 group"
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
                      <Badge
                        variant="secondary"
                        className={getClassificacaoColor(filme.classificacao)}
                      >
                        {filme.classificacao}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {filme.duracao}min
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {new Date(filme.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/admin/filmes/${filme.id}/editar`}>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-3 w-3" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Excluir
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
                        {filme.duracao}min
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Badge
                        variant="secondary"
                        className={getClassificacaoColor(filme.classificacao)}
                      >
                        {filme.classificacao}
                      </Badge>
                    </div>

                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(filme.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="col-span-1">
                      <div className="flex gap-1">
                        <Link href={`/admin/filmes/${filme.id}/editar`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:scale-110 transition-transform duration-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200"
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
