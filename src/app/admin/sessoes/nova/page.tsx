"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MovieSelect } from "@/components/ui/movie-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listarFilmes, criarSessao } from "@/actions";
import {
  Save,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Film,
  Grid3X3,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NovaSessaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carregandoFilmes, setCarregandoFilmes] = useState(true);
  const [filmes, setFilmes] = useState<
    Array<{
      id: string;
      titulo: string;
      duracao: number;
      genero: string;
      classificacao: string;
      descricao: string;
    }>
  >([]);
  const [formData, setFormData] = useState({
    filmeId: "",
    data: "",
    hora: "",
    sala: "",
    linhas: "5",
    colunas: "10",
    preco: "",
  });

  const salas = ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala 5"];

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
        setCarregandoFilmes(false);
      }
    };

    carregarFilmes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataHora = new Date(`${formData.data}T${formData.hora}`);

      const result = await criarSessao({
        filmeId: formData.filmeId,
        dataHora,
        sala: formData.sala,
        linhas: parseInt(formData.linhas),
        colunas: parseInt(formData.colunas),
        preco: parseFloat(formData.preco),
      });

      if (result.success) {
        toast.success("Sessão criada com sucesso!");
        router.push("/admin/sessoes");
      } else {
        toast.error("Erro ao criar sessão: " + result.error);
      }
    } catch {
      toast.error("Erro ao criar sessão");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filmeSelecionado = filmes.find((f) => f.id === formData.filmeId);
  const totalAssentos =
    parseInt(formData.linhas || "0") * parseInt(formData.colunas || "0");

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Nova Sessão
          </h2>
          <p className="text-muted-foreground">
            Agende uma nova sessão de cinema
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Detalhes da Sessão</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {carregandoFilmes ? (
                  <div className="flex items-center space-x-2 p-3 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Carregando filmes...
                    </span>
                  </div>
                ) : (
                  <MovieSelect
                    movies={filmes}
                    value={formData.filmeId}
                    onChange={(value: string) =>
                      handleInputChange("filmeId", value)
                    }
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Data *</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.data}
                      onChange={(e) =>
                        handleInputChange("data", e.target.value)
                      }
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Horário *</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.hora}
                      onChange={(e) =>
                        handleInputChange("hora", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Sala
                    </label>
                    <Select
                      value={formData.sala}
                      onValueChange={(value: string) =>
                        handleInputChange("sala", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma sala" />
                      </SelectTrigger>
                      <SelectContent>
                        {salas.map((sala) => (
                          <SelectItem key={sala} value={sala}>
                            {sala}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-1">
                      <Grid3X3 className="h-3 w-3" />
                      <span>Linhas *</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={formData.linhas}
                      onChange={(e) =>
                        handleInputChange("linhas", e.target.value)
                      }
                      required
                      min="3"
                      max="15"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-1">
                      <Grid3X3 className="h-3 w-3" />
                      <span>Colunas *</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={formData.colunas}
                      onChange={(e) =>
                        handleInputChange("colunas", e.target.value)
                      }
                      required
                      min="5"
                      max="20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Preço do Ingresso (R$) *</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="25.00"
                    value={formData.preco}
                    onChange={(e) => handleInputChange("preco", e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 border border-primary cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Criar Sessão
                      </>
                    )}
                  </Button>

                  <Link href="/admin/sessoes">
                    <Button
                      variant="outline"
                      type="button"
                      className="cursor-pointer"
                    >
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview da Sessão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filmeSelecionado ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-white">
                      {filmeSelecionado.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {filmeSelecionado.descricao}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted transition-colors duration-200"
                    >
                      {filmeSelecionado.genero}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200"
                    >
                      {filmeSelecionado.classificacao}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {filmeSelecionado.duracao}min
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Film className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Selecione um filme para ver o preview
                  </p>
                </div>
              )}

              {(formData.data || formData.hora || formData.sala) && (
                <div className="border-t pt-4 space-y-2">
                  {formData.data && formData.hora && (
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-3 w-3" />
                      {new Date(
                        `${formData.data}T${formData.hora}`
                      ).toLocaleDateString("pt-BR")}{" "}
                      às {formData.hora}
                    </div>
                  )}

                  {formData.sala && (
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-3 w-3" />
                      {formData.sala}
                    </div>
                  )}

                  {totalAssentos > 0 && (
                    <div className="flex items-center text-sm">
                      <Grid3X3 className="mr-2 h-3 w-3" />
                      {totalAssentos} assentos ({formData.linhas}x
                      {formData.colunas})
                    </div>
                  )}

                  {formData.preco && (
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="mr-2 h-3 w-3" />
                      R$ {parseFloat(formData.preco || "0").toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Programe sessões com antecedência mínima de 24h</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>
                    Layout padrão: 5 linhas x 10 colunas (50 assentos)
                  </span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Verifique conflitos de horário na mesma sala</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
