"use client";

import { useState, useEffect, use } from "react";
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
import { listarFilmes, buscarSessaoPorId, atualizarSessao } from "@/actions";
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
import { toast } from "sonner";

interface EditarSessaoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditarSessaoPage({ params }: EditarSessaoPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
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
    const carregarDados = async () => {
      try {
        // Carregar filmes
        const filmesResult = await listarFilmes();
        if (filmesResult.success && filmesResult.data) {
          setFilmes(filmesResult.data);
        }
        setCarregandoFilmes(false);

        // Carregar dados da sessão
        const sessaoResult = await buscarSessaoPorId(id);
        if (sessaoResult.success && sessaoResult.data) {
          const sessao = sessaoResult.data;
          const dataHora = new Date(sessao.dataHora);

          setFormData({
            filmeId: sessao.filmeId,
            data: dataHora.toISOString().split("T")[0],
            hora: dataHora.toTimeString().slice(0, 5),
            sala: sessao.sala,
            linhas: sessao.linhas.toString(),
            colunas: sessao.colunas.toString(),
            preco: sessao.preco.toString(),
          });
        } else {
          toast.error("Sessão não encontrada");
          router.push("/admin/sessoes");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações client-side
    if (!formData.filmeId.trim()) {
      toast.error("Filme é obrigatório");
      return;
    }
    if (!formData.data.trim()) {
      toast.error("Data é obrigatória");
      return;
    }
    if (!formData.hora.trim()) {
      toast.error("Hora é obrigatória");
      return;
    }
    if (!formData.sala.trim()) {
      toast.error("Sala é obrigatória");
      return;
    }
    if (
      !formData.linhas ||
      parseInt(formData.linhas) < 3 ||
      parseInt(formData.linhas) > 15
    ) {
      toast.error("Número de linhas deve estar entre 3 e 15");
      return;
    }
    if (
      !formData.colunas ||
      parseInt(formData.colunas) < 5 ||
      parseInt(formData.colunas) > 20
    ) {
      toast.error("Número de colunas deve estar entre 5 e 20");
      return;
    }
    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      toast.error("Preço deve ser maior que zero");
      return;
    }

    const dataHora = new Date(`${formData.data}T${formData.hora}`);

    setLoading(true);

    try {
      const result = await atualizarSessao(id, {
        filmeId: formData.filmeId.trim(),
        dataHora,
        sala: formData.sala.trim(),
        linhas: parseInt(formData.linhas),
        colunas: parseInt(formData.colunas),
        preco: parseFloat(formData.preco),
      });

      if (result.success) {
        toast.success("Sessão atualizada com sucesso!");
        router.push("/admin/sessoes");
      } else {
        toast.error("Erro ao atualizar sessão: " + result.error);
      }
    } catch {
      toast.error("Erro ao atualizar sessão");
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

  const handleCancel = () => {
    router.push("/admin/sessoes");
  };

  const filmeSelecionado = filmes.find((f) => f.id === formData.filmeId);
  const totalAssentos =
    parseInt(formData.linhas || "0") * parseInt(formData.colunas || "0");

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

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Editar Sessão
          </h2>
          <p className="text-muted-foreground">
            Atualize as informações da sessão
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Informações da Sessão</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Filme *
                  </label>
                  {carregandoFilmes ? (
                    <div className="flex items-center space-x-2">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center space-x-1">
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
                    <label className="text-sm font-medium text-white flex items-center space-x-1">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center space-x-1">
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
                    <label className="text-sm font-medium text-white flex items-center space-x-1">
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
                  <label className="text-sm font-medium text-white flex items-center space-x-1">
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
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Film className="h-5 w-5" />
                <span>Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filmeSelecionado && (
                <div className="space-y-2">
                  <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Film className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Pôster do filme
                      </p>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg text-white">
                    {filmeSelecionado.titulo}
                  </h3>
                  <div className="flex gap-2">
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
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {filmeSelecionado.duracao} minutos
                  </p>
                </div>
              )}

              {(formData.data || formData.hora || formData.sala) && (
                <div className="border-t pt-4 space-y-2">
                  {formData.data && formData.hora && (
                    <div className="flex items-center text-sm text-white">
                      <Calendar className="mr-2 h-3 w-3" />
                      {new Date(
                        `${formData.data}T${formData.hora}`
                      ).toLocaleDateString("pt-BR")}{" "}
                      às {formData.hora}
                    </div>
                  )}

                  {formData.sala && (
                    <div className="flex items-center text-sm text-white">
                      <MapPin className="mr-2 h-3 w-3" />
                      {formData.sala}
                    </div>
                  )}

                  {totalAssentos > 0 && (
                    <div className="flex items-center text-sm text-white">
                      <Grid3X3 className="mr-2 h-3 w-3" />
                      {totalAssentos} assentos ({formData.linhas}x
                      {formData.colunas})
                    </div>
                  )}

                  {formData.preco && (
                    <div className="flex items-center text-sm font-medium text-white">
                      <DollarSign className="mr-2 h-3 w-3" />
                      R$ {parseFloat(formData.preco || "0").toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
