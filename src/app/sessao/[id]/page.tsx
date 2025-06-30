"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeatSelector } from "@/components/ui/seat-selector";
import {
  buscarSessaoAtivaPublica,
  obterAssentosOcupados,
  criarReserva,
} from "@/actions";
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  User,
  ArrowLeft,
  Ticket,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface SessaoDetalhada {
  id: string;
  dataHora: Date;
  sala: string;
  linhas: number;
  colunas: number;
  preco: number;
  filme: {
    titulo: string;
    descricao: string;
    duracao: number;
    genero: string;
    classificacao: string;
    banner: string | null;
  };
}

interface PageProps {
  params: { id: string };
}

export default function SessaoPage({ params }: PageProps) {
  const [sessao, setSessao] = useState<SessaoDetalhada | null>(null);
  const [assentosOcupados, setAssentosOcupados] = useState<string[]>([]);
  const [assentosSelecionados, setAssentosSelecionados] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState(false);
  const [atualizandoAssentos, setAtualizandoAssentos] = useState(false);

  // Dados do cliente
  const [nomeCliente, setNomeCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");

  const recarregarAssentosOcupados = useCallback(
    async (showLoading = false) => {
      if (showLoading) setAtualizandoAssentos(true);

      try {
        const assentosResult = await obterAssentosOcupados(params.id);
        if (assentosResult.success && assentosResult.data) {
          const novosAssentosOcupados = assentosResult.data;
          setAssentosOcupados(novosAssentosOcupados);

          // Remover assentos selecionados que agora estão ocupados
          setAssentosSelecionados((prevSelecionados) => {
            const assentosValidos = prevSelecionados.filter(
              (assento) => !novosAssentosOcupados.includes(assento)
            );

            // Se algum assento foi removido, mostrar toast informativo
            if (assentosValidos.length < prevSelecionados.length) {
              const assentosRemovidos = prevSelecionados.filter((assento) =>
                novosAssentosOcupados.includes(assento)
              );
              toast.info(
                `Assento${
                  assentosRemovidos.length > 1 ? "s" : ""
                } ${assentosRemovidos.join(", ")} ${
                  assentosRemovidos.length > 1
                    ? "foram ocupados"
                    : "foi ocupado"
                } por outro usuário`
              );
            }

            return assentosValidos;
          });
        }
      } catch (error) {
        console.error("Erro ao recarregar assentos:", error);
      } finally {
        if (showLoading) setAtualizandoAssentos(false);
      }
    },
    [params.id]
  );

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [sessaoResult, assentosResult] = await Promise.all([
          buscarSessaoAtivaPublica(params.id),
          obterAssentosOcupados(params.id),
        ]);

        if (sessaoResult.success && sessaoResult.data) {
          setSessao(sessaoResult.data);
        }

        if (assentosResult.success && assentosResult.data) {
          setAssentosOcupados(assentosResult.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [params.id]);

  // Atualizar assentos quando a página ganha foco (para sincronizar com outras abas/usuários)
  useEffect(() => {
    const handleFocus = () => {
      if (!loading && sessao) {
        recarregarAssentosOcupados();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !loading && sessao) {
        recarregarAssentosOcupados();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, sessao, recarregarAssentosOcupados]);

  // Atualizar assentos periodicamente para manter sincronização
  useEffect(() => {
    if (!sessao || loading) return;

    const interval = setInterval(() => {
      recarregarAssentosOcupados();
    }, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, [sessao, loading, recarregarAssentosOcupados]);

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  const calcularTotal = () => {
    if (!sessao) return 0;
    return assentosSelecionados.length * sessao.preco;
  };

  const handleReservar = async () => {
    if (!sessao || assentosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um assento");
      return;
    }

    if (!nomeCliente.trim()) {
      toast.error("Digite seu nome");
      return;
    }

    setReservando(true);
    try {
      const result = await criarReserva({
        sessaoId: sessao.id,
        assentos: assentosSelecionados,
        nomeCliente: nomeCliente.trim(),
        emailCliente: emailCliente.trim() || "",
      });

      if (result.success) {
        toast.success("Reserva realizada com sucesso!");

        // Limpar dados do formulário imediatamente
        setAssentosSelecionados([]);
        setNomeCliente("");
        setEmailCliente("");

        // Recarregar assentos ocupados do servidor para garantir sincronização
        await recarregarAssentosOcupados(true);
      } else {
        toast.error(result.error || "Erro ao realizar reserva");
      }
    } catch (error) {
      console.error("Erro ao realizar reserva:", error);
      toast.error("Erro ao realizar reserva");
    } finally {
      setReservando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-white" />
          <p className="text-xl text-white">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Sessão não encontrada
          </h1>
          <p className="text-muted-foreground mb-6">
            A sessão que você está procurando não existe ou não está mais
            disponível.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="CineMenos Logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Reserva de Ingressos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Selecione seus assentos
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Filme e Sessão */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Film className="h-5 w-5" />
                  <span>Filme</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessao.filme.banner && (
                  <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden">
                    <img
                      src={sessao.filme.banner}
                      alt={sessao.filme.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {sessao.filme.titulo}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{sessao.filme.genero}</Badge>
                    <Badge
                      variant="secondary"
                      className={`${getClassificacaoColor(
                        sessao.filme.classificacao
                      )} cursor-pointer`}
                    >
                      {sessao.filme.classificacao}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {sessao.filme.duracao}min
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sessao.filme.descricao}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ticket className="h-5 w-5" />
                  <span>Sessão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-white">
                    {formatarData(sessao.dataHora)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-white">
                    {formatarHora(sessao.dataHora)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-white">Sala {sessao.sala}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Preço por ingresso
                  </p>
                  <p className="text-lg font-semibold text-green-500">
                    R$ {sessao.preco.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Seus Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-white">
                    Nome *
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Digite seu nome"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">
                    E-mail (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seletor de Assentos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  Selecione seus assentos
                  {atualizandoAssentos && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  {atualizandoAssentos
                    ? "Atualizando disponibilidade..."
                    : "Clique nos assentos para selecioná-los"}
                </p>
              </CardHeader>
              <CardContent>
                <SeatSelector
                  rows={sessao.linhas}
                  seatsPerRow={sessao.colunas}
                  occupiedSeats={assentosOcupados}
                  onSeatSelect={setAssentosSelecionados}
                />
              </CardContent>
            </Card>

            {/* Resumo da Reserva */}
            {assentosSelecionados.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Resumo da Reserva</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Assentos selecionados:
                    </span>
                    <span className="font-semibold text-white">
                      {assentosSelecionados.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="font-semibold text-white">
                      {assentosSelecionados.length} ingresso
                      {assentosSelecionados.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Preço unitário:
                    </span>
                    <span className="font-semibold text-white">
                      R$ {sessao.preco.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-lg font-semibold text-white">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-green-500">
                      R$ {calcularTotal().toFixed(2)}
                    </span>
                  </div>

                  <Button
                    onClick={handleReservar}
                    disabled={reservando || !nomeCliente.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {reservando ? (
                      "Reservando..."
                    ) : (
                      <>
                        <Ticket className="mr-2 h-4 w-4" />
                        Confirmar Reserva
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
