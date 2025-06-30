"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SeatSelector } from "@/components/ui/seat-selector";
import { buscarSessaoPorId } from "@/actions";
import { criarReserva, obterAssentosOcupados } from "@/actions/reservas";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Film,
  Users,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface SessaoComFilme {
  id: string;
  dataHora: Date;
  sala: string;
  linhas: number;
  colunas: number;
  preco: number;
  filme?: {
    titulo: string;
    descricao: string;
    genero: string;
    classificacao: string;
    duracao: number;
  };
}

interface ReservasPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReservasPage({ params }: ReservasPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [sessao, setSessao] = useState<SessaoComFilme | null>(null);
  const [assentosOcupados, setAssentosOcupados] = useState<string[]>([]);
  const [assentosSelecionados, setAssentosSelecionados] = useState<string[]>(
    []
  );
  const [dadosCliente, setDadosCliente] = useState({
    nome: "",
    email: "",
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar dados da sessão
        const sessaoResult = await buscarSessaoPorId(id);
        if (sessaoResult.success && sessaoResult.data) {
          setSessao(sessaoResult.data);
        } else {
          toast.error("Sessão não encontrada");
          router.push("/admin/sessoes");
          return;
        }

        // Carregar assentos ocupados
        const assentosResult = await obterAssentosOcupados(id);
        if (assentosResult.success) {
          setAssentosOcupados(assentosResult.data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
        router.push("/admin/sessoes");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [id, router]);

  const handleReserva = async () => {
    if (assentosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um assento");
      return;
    }

    if (!dadosCliente.nome.trim() || !dadosCliente.email.trim()) {
      toast.error("Preencha nome e email do cliente");
      return;
    }

    setLoading(true);

    try {
      const result = await criarReserva({
        sessaoId: id,
        assentos: assentosSelecionados,
        nomeCliente: dadosCliente.nome.trim(),
        emailCliente: dadosCliente.email.trim(),
      });

      if (result.success) {
        toast.success("Reserva realizada com sucesso!");
        router.push("/admin/sessoes");
      } else {
        toast.error(result.error || "Erro ao realizar reserva");
      }
    } catch (error) {
      console.error("Erro ao realizar reserva:", error);
      toast.error("Erro ao realizar reserva");
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    if (!sessao) return 0;
    return assentosSelecionados.length * sessao.preco;
  };

  if (carregando) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Sessão não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Reservar Assentos
          </h2>
          <p className="text-muted-foreground">
            Selecione os assentos para a sessão
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações da Sessão */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Film className="h-5 w-5" />
                <span>Detalhes da Sessão</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-white mb-2">
                  {sessao.filme?.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {sessao.filme?.descricao}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(sessao.dataHora).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(sessao.dataHora).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{sessao.sala}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>R$ {sessao.preco.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{sessao.filme?.genero}</Badge>
                <Badge variant="outline">{sessao.filme?.classificacao}</Badge>
                <Badge variant="outline">{sessao.filme?.duracao} min</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Formulário do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Dados do Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-white">
                  Nome Completo *
                </Label>
                <Input
                  id="nome"
                  value={dadosCliente.nome}
                  onChange={(e) =>
                    setDadosCliente((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={dadosCliente.email}
                  onChange={(e) =>
                    setDadosCliente((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Digite o e-mail"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumo da Reserva */}
          {assentosSelecionados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Resumo da Reserva</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quantidade de ingressos:</span>
                    <span className="font-semibold">
                      {assentosSelecionados.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Preço unitário:</span>
                    <span>R$ {sessao.preco.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-green-500">
                        R$ {calcularTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleReserva}
                  disabled={
                    loading ||
                    assentosSelecionados.length === 0 ||
                    !dadosCliente.nome.trim() ||
                    !dadosCliente.email.trim()
                  }
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Reserva"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Seleção de Assentos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Selecione os Assentos</CardTitle>
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
        </div>
      </div>
    </div>
  );
}
