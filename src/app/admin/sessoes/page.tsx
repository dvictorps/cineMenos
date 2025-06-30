"use client";

import { useState } from "react";
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
import { desativarSessao, ativarSessao } from "@/actions";
import {
  useSessionCache,
  useInvalidateSessions,
} from "@/hooks/useSessionCache";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  MoreHorizontal,
  Ticket,
  Loader2,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function SessoesPage() {
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroData, setFiltroData] = useState("todas");
  const [filtroStatusSessao, setFiltroStatusSessao] = useState("todos");
  const [filtroAtivo, setFiltroAtivo] = useState("ativos");
  const [loadingSessao, setLoadingSessao] = useState<string | null>(null);

  const { data: sessoes, isLoading: loading, error } = useSessionCache();
  const { invalidateSessions } = useInvalidateSessions();

  // Lógica de filtros
  const sessoesFiltradas = (sessoes || []).filter((sessao) => {
    // Filtro por texto (título do filme)
    if (filtroTexto) {
      const filtroLower = filtroTexto.toLowerCase();
      if (!sessao.filme.titulo.toLowerCase().includes(filtroLower)) {
        return false;
      }
    }

    // Filtro por data
    if (filtroData !== "todas") {
      const hoje = new Date();
      const sessaoData = new Date(sessao.dataHora);

      switch (filtroData) {
        case "hoje":
          if (sessaoData.toDateString() !== hoje.toDateString()) return false;
          break;
        case "amanha":
          const amanha = new Date(hoje);
          amanha.setDate(hoje.getDate() + 1);
          if (sessaoData.toDateString() !== amanha.toDateString()) return false;
          break;
        case "semana":
          const fimSemana = new Date(hoje);
          fimSemana.setDate(hoje.getDate() + 7);
          if (sessaoData < hoje || sessaoData > fimSemana) return false;
          break;
      }
    }

    // Filtro por status de sessão
    if (filtroStatusSessao !== "todos") {
      const status = getStatusSessao(sessao.dataHora);
      if (status.label.toLowerCase() !== filtroStatusSessao) return false;
    }

    // Filtro por ativo/inativo
    if (filtroAtivo === "ativos") {
      return sessao.ativo === true;
    } else if (filtroAtivo === "inativos") {
      return sessao.ativo === false;
    }
    // "todos" mostra ativos e inativos

    return true;
  });

  const handleToggleSessao = async (sessaoId: string, ativo: boolean) => {
    setLoadingSessao(sessaoId);

    try {
      const action = ativo ? desativarSessao : ativarSessao;
      const actionName = ativo ? "desativada" : "ativada";

      const result = await action(sessaoId);

      if (result.success) {
        toast.success(`Sessão ${actionName} com sucesso!`);

        // Invalidar cache manualmente para atualização imediata
        invalidateSessions();
      } else {
        toast.error(
          `Erro ao ${ativo ? "desativar" : "ativar"} sessão: ${result.error}`
        );
      }
    } catch (error) {
      console.error(`Erro ao ${ativo ? "desativar" : "ativar"} sessão:`, error);
      toast.error(
        `Erro inesperado ao ${ativo ? "desativar" : "ativar"} sessão`
      );
    } finally {
      setLoadingSessao(null);
    }
  };

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

  const getStatusSessao = (dataHora: Date) => {
    const agora = new Date();
    const sessaoData = new Date(dataHora);

    if (sessaoData < agora) {
      return {
        label: "Finalizada",
        color:
          "bg-gray-600 text-white hover:bg-gray-500 transition-colors duration-200",
      };
    } else if (sessaoData.getTime() - agora.getTime() < 30 * 60 * 1000) {
      return {
        label: "Em breve",
        color:
          "bg-yellow-600 text-white hover:bg-yellow-500 transition-colors duration-200",
      };
    } else {
      return {
        label: "Agendada",
        color:
          "bg-green-600 text-white hover:bg-green-500 transition-colors duration-200",
      };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-muted-foreground">Carregando sessões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro ao carregar sessões</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Sessões
          </h2>
          <p className="text-muted-foreground">Gerencie as sessões de cinema</p>
        </div>
        <Link href="/admin/sessoes/nova">
          <Button className="transition-all duration-200 hover:scale-105">
            <Plus className="mr-2 h-4 w-4" />
            Nova Sessão
          </Button>
        </Link>
      </div>

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
                  placeholder="Buscar por filme..."
                  className="pl-10"
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filtroData} onValueChange={setFiltroData}>
                <SelectTrigger className="w-[120px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="amanha">Amanhã</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filtroStatusSessao}
                onValueChange={setFiltroStatusSessao}
              >
                <SelectTrigger className="w-[120px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em breve">Em breve</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroAtivo} onValueChange={setFiltroAtivo}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Programação ({sessoesFiltradas.length} sessões)</span>
            <Badge variant="secondary">{sessoesFiltradas.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessoesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma sessão agendada
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece criando a primeira sessão
              </p>
              <Link href="/admin/sessoes/nova">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Sessão
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div className="col-span-3">Filme</div>
                <div className="col-span-2">Data/Hora</div>
                <div className="col-span-1">Sala</div>
                <div className="col-span-2">Ocupação</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Preço</div>
                <div className="col-span-2">Ações</div>
              </div>

              {sessoesFiltradas.map((sessao) => {
                const status = getStatusSessao(sessao.dataHora);
                const totalAssentos = sessao.linhas * sessao.colunas;
                const assentosOcupados =
                  sessao.reservas?.reduce(
                    (acc, reserva) =>
                      acc + (reserva.assentos ? reserva.assentos.length : 0),
                    0
                  ) || 0;
                const ocupacaoPercent =
                  totalAssentos > 0
                    ? (assentosOcupados / totalAssentos) * 100
                    : 0;

                return (
                  <div
                    key={sessao.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors duration-200 group cursor-pointer"
                  >
                    <div className="md:hidden space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-white">
                            {sessao.filme.titulo}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatarData(sessao.dataHora)} às{" "}
                            {formatarHora(sessao.dataHora)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          Sala {sessao.sala}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-3 w-3" />
                          {assentosOcupados}/{totalAssentos}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${status.color} cursor-pointer`}
                        >
                          {status.label}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`${
                            sessao.ativo
                              ? "bg-green-600 text-white hover:bg-green-500 transition-colors duration-200"
                              : "bg-gray-600 text-white hover:bg-gray-500 transition-colors duration-200"
                          } cursor-pointer`}
                        >
                          {sessao.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                        <span className="text-sm font-medium">
                          R$ {sessao.preco.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${ocupacaoPercent}%` }}
                          />
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link href={`/admin/sessoes/${sessao.id}/reservas`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-400 hover:text-blue-500"
                            >
                              <Ticket className="mr-1 h-3 w-3" />
                              Reservar
                            </Button>
                          </Link>
                          <Link href={`/admin/sessoes/${sessao.id}/editar`}>
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
                              handleToggleSessao(sessao.id, sessao.ativo)
                            }
                            disabled={loadingSessao === sessao.id}
                            className={
                              sessao.ativo
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {loadingSessao === sessao.id ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                {sessao.ativo
                                  ? "Desativando..."
                                  : "Ativando..."}
                              </>
                            ) : sessao.ativo ? (
                              <>
                                <Trash2 className="mr-1 h-3 w-3" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                Ativar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:contents">
                      <div className="col-span-3">
                        <div>
                          <h3 className="font-semibold text-white">
                            {sessao.filme.titulo}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {sessao.filme.genero} • {sessao.filme.duracao}min
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>{formatarData(sessao.dataHora)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatarHora(sessao.dataHora)}</span>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-1 h-3 w-3" />
                          Sala {sessao.sala}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>
                              {assentosOcupados}/{totalAssentos}
                            </span>
                            <span>{ocupacaoPercent.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-white h-2 rounded-full transition-all duration-300"
                              style={{ width: `${ocupacaoPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="secondary"
                            className={`${status.color} cursor-pointer`}
                          >
                            {status.label}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`${
                              sessao.ativo
                                ? "bg-green-600 text-white hover:bg-green-500 transition-colors duration-200"
                                : "bg-gray-600 text-white hover:bg-gray-500 transition-colors duration-200"
                            } cursor-pointer`}
                          >
                            {sessao.ativo ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <span className="text-sm font-medium">
                          R$ {sessao.preco.toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <div className="flex gap-1">
                          <Link href={`/admin/sessoes/${sessao.id}/reservas`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-400 hover:text-blue-500 hover:scale-110 transition-all duration-200"
                              title="Reservar Assentos"
                            >
                              <Ticket className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link href={`/admin/sessoes/${sessao.id}/editar`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-blue-400 hover:scale-110 transition-all duration-200"
                              title="Editar Sessão"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleSessao(sessao.id, sessao.ativo)
                            }
                            disabled={loadingSessao === sessao.id}
                            className={`h-8 w-8 hover:scale-110 transition-all duration-200 ${
                              sessao.ativo
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                            title={
                              loadingSessao === sessao.id
                                ? sessao.ativo
                                  ? "Desativando..."
                                  : "Ativando..."
                                : sessao.ativo
                                ? "Desativar Sessão"
                                : "Ativar Sessão"
                            }
                          >
                            {loadingSessao === sessao.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : sessao.ativo ? (
                              <Trash2 className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
