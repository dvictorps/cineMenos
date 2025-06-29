"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listarFilmesAtivos } from "@/actions";
import {
  Search,
  Calendar,
  Clock,
  Star,
  Filter,
  Ticket,
  Film,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FloatingChat } from "@/components/ai-agent/floating-chat";

interface FilmeComSessoes {
  id: string;
  titulo: string;
  descricao: string;
  duracao: number;
  genero: string;
  classificacao: string;
  banner: string | null;
  sessoes: Array<{
    id: string;
    dataHora: Date;
    sala: string;
    preco: number;
  }>;
}

export default function HomePage() {
  const [filmes, setFilmes] = useState<FilmeComSessoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("todos");

  useEffect(() => {
    const carregarFilmes = async () => {
      try {
        const result = await listarFilmesAtivos();
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

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatarHora = (data: Date) => {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getClassificacaoColor = (classificacao: string) => {
    switch (classificacao) {
      case "LIVRE":
        return "bg-green-600 text-white hover:bg-green-500 transition-colors duration-200";
      case "10":
        return "bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200";
      case "12":
        return "bg-yellow-600 text-white hover:bg-yellow-500 transition-colors duration-200";
      case "14":
        return "bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-200";
      case "16":
        return "bg-red-600 text-white hover:bg-red-500 transition-colors duration-200";
      case "18":
        return "bg-purple-600 text-white hover:bg-purple-500 transition-colors duration-200";
      default:
        return "bg-gray-600 text-white hover:bg-gray-500 transition-colors duration-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Film className="h-16 w-16 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-xl text-muted-foreground">Carregando filmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-32 h-16 overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="CineMenos Logo"
                  width={128}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Os melhores filmes em cartaz
              </p>
            </div>
            <Link href="/admin">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-black"
              >
                Área Administrativa
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Cinema em Casa
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubra os melhores filmes em cartaz e reserve seus ingressos com
            apenas alguns cliques
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Melhores filmes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Ticket className="h-4 w-4 text-primary" />
              <span>Reserva fácil</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span>Horários flexíveis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Encontre seu filme</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar filme..."
                    className="pl-10"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filtroGenero} onValueChange={setFiltroGenero}>
                <SelectTrigger className="md:w-[200px]">
                  <SelectValue placeholder="Todos os gêneros" />
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
      </section>

      {/* Lista de Filmes */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            Em Cartaz ({filmesFiltrados.length} filmes)
          </h3>
          <p className="text-muted-foreground">
            Confira nossa programação e reserve seu lugar
          </p>
        </div>

        {filmesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2 text-white">
                {filtroTexto || filtroGenero !== "todos"
                  ? "Nenhum filme encontrado"
                  : "Nenhum filme em cartaz"}
              </h3>
              <p className="text-muted-foreground">
                {filtroTexto || filtroGenero !== "todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Volte em breve para conferir nossa programação"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filmesFiltrados.map((filme) => (
              <Card
                key={filme.id}
                className="overflow-hidden hover:shadow-lg transition-shadow max-w-xs"
              >
                <div className="relative h-80 bg-muted overflow-hidden rounded-t-lg">
                  {filme.banner ? (
                    <img
                      src={filme.banner}
                      alt={filme.titulo}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className={`${getClassificacaoColor(
                        filme.classificacao
                      )} text-xs cursor-pointer`}
                    >
                      {filme.classificacao}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2 px-3 pt-3">
                  <CardTitle className="text-sm text-white line-clamp-1 font-semibold">
                    {filme.titulo}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {filme.genero}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {filme.duracao}min
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 px-3 pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {filme.descricao}
                  </p>

                  {filme.sessoes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-white mb-2 text-xs">
                        Próximas sessões:
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {filme.sessoes.slice(0, 2).map((sessao) => (
                          <Link
                            key={sessao.id}
                            href={`/sessao/${sessao.id}`}
                            className="block"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-auto py-2"
                            >
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatarData(sessao.dataHora)}</span>
                                  <Clock className="h-3 w-3 ml-1" />
                                  <span>{formatarHora(sessao.dataHora)}</span>
                                </div>
                                <div className="font-semibold text-green-500">
                                  R$ {sessao.preco.toFixed(2)}
                                </div>
                              </div>
                            </Button>
                          </Link>
                        ))}
                      </div>
                      {filme.sessoes.length > 2 && (
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          +{filme.sessoes.length - 2} sessões
                        </p>
                      )}
                    </div>
                  )}

                  {filme.sessoes.length === 0 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground">
                        Nenhuma sessão disponível
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 rounded overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="CineMenos Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-white">CineMenos</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 CineMenos. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Chat Flutuante */}
      <FloatingChat />
    </div>
  );
}
