import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { obterEstatisticasGerais } from "@/actions";
import { Film, Calendar, Ticket, TrendingUp, Plus, Eye } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const estatisticas = await obterEstatisticasGerais();

  if (!estatisticas.success || !estatisticas.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar estatísticas</p>
      </div>
    );
  }

  const { data } = estatisticas;

  const stats = [
    {
      title: "Total de Filmes",
      value: data.totalFilmes,
      icon: Film,
      description: "Filmes cadastrados no sistema",
    },
    {
      title: "Total de Sessões",
      value: data.totalSessoes,
      icon: Calendar,
      description: "Sessões programadas",
    },
    {
      title: "Sessões Hoje",
      value: data.sessoesHoje,
      icon: TrendingUp,
      description: "Sessões programadas para hoje",
    },
    {
      title: "Reservas Hoje",
      value: data.reservasHoje,
      icon: Ticket,
      description: "Reservas feitas hoje",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h2>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="cursor-pointer hover:bg-card/80 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-3">
                <Link
                  href="/admin/filmes/novo"
                  className="cursor-pointer group block"
                >
                  <Button className="w-full justify-start transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md relative overflow-hidden">
                    <Plus className="mr-3 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span className="transition-all duration-200">
                      Cadastrar Filme
                    </span>
                    <Film className="ml-auto h-4 w-4 opacity-60 transition-all duration-200 group-hover:opacity-100 group-hover:scale-110" />

                    {/* Efeito de brilho no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Button>
                </Link>

                <Link
                  href="/admin/sessoes/nova"
                  className="cursor-pointer group block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md group-hover:border-primary/50 relative overflow-hidden"
                  >
                    <Calendar className="mr-3 h-4 w-4 transition-all duration-200 group-hover:scale-110 group-hover:text-primary" />
                    <span className="transition-all duration-200 group-hover:text-primary">
                      Criar Sessão
                    </span>
                    <TrendingUp className="ml-auto h-4 w-4 opacity-60 transition-all duration-200 group-hover:opacity-100 group-hover:scale-110 group-hover:text-primary" />

                    {/* Efeito de borda animada */}
                    <div className="absolute inset-0 border border-primary/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Button>
                </Link>

                <Link
                  href="/admin/reservas"
                  className="cursor-pointer group block"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md group-hover:bg-secondary/80 relative overflow-hidden"
                  >
                    <Eye className="mr-3 h-4 w-4 transition-all duration-200 group-hover:scale-110" />
                    <span className="transition-all duration-200">
                      Ver Reservas
                    </span>
                    <Ticket className="ml-auto h-4 w-4 opacity-60 transition-all duration-200 group-hover:opacity-100 group-hover:scale-110" />

                    {/* Efeito de slide sutil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Status do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors duration-200 cursor-pointer group">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                    <span className="text-sm font-medium">Banco de Dados</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-600 text-white hover:bg-green-700 hover:scale-105 transition-all duration-200"
                  >
                    Online
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors duration-200 cursor-pointer group">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                    <span className="text-sm font-medium">
                      Sistema de Reservas
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-600 text-white hover:bg-green-700 hover:scale-105 transition-all duration-200"
                  >
                    Ativo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors duration-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      Última Atualização
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date().toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
