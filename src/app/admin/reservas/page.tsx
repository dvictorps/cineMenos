"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listarReservas, cancelarReserva } from "@/actions/reservas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Film,
  User,
  Mail,
  Ticket,
  X,
  CheckCircle,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function ReservasPage() {
  const [filtro, setFiltro] = useState("");
  const queryClient = useQueryClient();

  const {
    data: reservas = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["reservas"],
    queryFn: async () => {
      const result = await listarReservas();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Erro ao carregar reservas");
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

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

  const formatarAssentos = (assentosJson: string) => {
    try {
      const assentos = JSON.parse(assentosJson);
      return assentos.join(", ");
    } catch {
      return assentosJson;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    if (!filtro) return true;
    const filtroLower = filtro.toLowerCase();
    return (
      reserva.nomeCliente?.toLowerCase().includes(filtroLower) ||
      reserva.emailCliente?.toLowerCase().includes(filtroLower) ||
      reserva.sessao.filme.titulo.toLowerCase().includes(filtroLower)
    );
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-muted-foreground">Carregando reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro ao carregar reservas</p>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["reservas"] })
            }
          >
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
            Reservas
          </h2>
          <p className="text-muted-foreground">
            Gerencie todas as reservas de assentos
          </p>
        </div>
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
                  placeholder="Buscar por cliente, filme..."
                  className="pl-10"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Data
              </Button>
              <Button variant="outline" className="sm:w-auto">
                <Ticket className="mr-2 h-4 w-4" />
                Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Todas as Reservas ({reservasFiltradas.length})</span>
            <Badge variant="secondary">{reservasFiltradas.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {filtro
                  ? "Nenhuma reserva encontrada"
                  : "Nenhuma reserva ainda"}
              </h3>
              <p className="text-muted-foreground">
                {filtro
                  ? "Tente ajustar os filtros de busca"
                  : "As reservas aparecerão aqui quando forem feitas"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Versão Desktop */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <Table className="table-fixed w-full min-w-[1000px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Cliente</TableHead>
                        <TableHead className="w-[250px]">
                          Filme & Sessão
                        </TableHead>
                        <TableHead className="w-[120px]">Assentos</TableHead>
                        <TableHead className="w-[100px]">Valor</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[120px]">
                          Data da Reserva
                        </TableHead>
                        <TableHead className="w-[120px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservasFiltradas.map((reserva) => (
                        <TableRow key={reserva.id}>
                          <TableCell className="max-w-[180px]">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span
                                  className="font-medium text-white truncate"
                                  title={reserva.nomeCliente || "N/A"}
                                >
                                  {reserva.nomeCliente || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span
                                  className="truncate"
                                  title={reserva.emailCliente || "N/A"}
                                >
                                  {reserva.emailCliente || "N/A"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[250px]">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Film className="h-4 w-4 text-muted-foreground" />
                                <span
                                  className="font-medium text-white"
                                  title={reserva.sessao.filme.titulo}
                                >
                                  {truncateText(
                                    reserva.sessao.filme.titulo,
                                    35
                                  )}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatarData(reserva.sessao.dataHora)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatarHora(reserva.sessao.dataHora)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{reserva.sessao.sala}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <div className="space-y-1">
                              <span className="font-medium text-white">
                                {formatarAssentos(reserva.assentos)}
                              </span>
                              <div className="text-sm text-muted-foreground">
                                {reserva.quantidade} ingresso
                                {reserva.quantidade !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[100px]">
                            <span className="font-medium text-green-500">
                              R${" "}
                              {(
                                reserva.quantidade * reserva.sessao.preco
                              ).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[100px]">
                            <Badge
                              variant={
                                reserva.tipo === "reserva"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                reserva.tipo === "reserva"
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }
                            >
                              {reserva.tipo === "reserva" ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <X className="mr-1 h-3 w-3" />
                              )}
                              {reserva.tipo === "reserva"
                                ? "Ativa"
                                : "Cancelada"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <span className="text-sm">
                              {formatarData(reserva.dataReserva)}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            {reserva.tipo === "reserva" && (
                              <CancelButton
                                reservaId={reserva.id}
                                onCancel={() => {
                                  queryClient.invalidateQueries({
                                    queryKey: ["reservas"],
                                  });
                                }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Versão Mobile */}
              <div className="lg:hidden space-y-4">
                {reservasFiltradas.map((reserva) => (
                  <Card key={reserva.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white">
                              {reserva.nomeCliente || "N/A"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {reserva.emailCliente || "N/A"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              reserva.tipo === "reserva"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              reserva.tipo === "reserva"
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                            }
                          >
                            {reserva.tipo === "reserva" ? "Ativa" : "Cancelada"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Film className="h-4 w-4 text-muted-foreground" />
                            <span
                              className="font-medium text-white"
                              title={reserva.sessao.filme.titulo}
                            >
                              {truncateText(reserva.sessao.filme.titulo, 30)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatarData(reserva.sessao.dataHora)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatarHora(reserva.sessao.dataHora)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3" />
                              <span>{reserva.sessao.sala}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Ticket className="h-3 w-3" />
                              <span>
                                {reserva.quantidade} ingresso
                                {reserva.quantidade !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Assentos:{" "}
                              </span>
                              <span className="font-medium text-white">
                                {formatarAssentos(reserva.assentos)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-green-500">
                                R${" "}
                                {(
                                  reserva.quantidade * reserva.sessao.preco
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {reserva.tipo === "reserva" && (
                            <div className="mt-3">
                              <CancelButton
                                reservaId={reserva.id}
                                onCancel={() => {
                                  queryClient.invalidateQueries({
                                    queryKey: ["reservas"],
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface CancelButtonProps {
  reservaId: string;
  onCancel: () => void;
}

function CancelButton({ reservaId, onCancel }: CancelButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const result = await cancelarReserva(reservaId);
      if (result.success) {
        toast.success("Reserva cancelada com sucesso!");
        onCancel();
        setShowConfirmation(false);
      } else {
        toast.error(result.error || "Erro ao cancelar reserva");
      }
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      toast.error("Erro ao cancelar reserva");
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center gap-2 min-w-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          <span>Confirmar?</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={loading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
            title="Confirmar cancelamento"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmation(false)}
            disabled={loading}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-7 w-7 p-0"
            title="Cancelar ação"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowConfirmation(true)}
      className="text-red-600 hover:text-red-700"
    >
      <X className="mr-1 h-3 w-3" />
      Cancelar
    </Button>
  );
}
