"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { MovieForm, type MovieFormData } from "@/components/forms/movie-form";
import { buscarFilmePorId, atualizarFilme } from "@/actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditarFilmePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditarFilmePage({ params }: EditarFilmePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [formData, setFormData] = useState<MovieFormData>({
    titulo: "",
    descricao: "",
    duracao: "",
    genero: "",
    classificacao: "LIVRE",
    banner: "",
  });

  useEffect(() => {
    const carregarFilme = async () => {
      try {
        const result = await buscarFilmePorId(id);
        if (result.success && result.data) {
          const filme = result.data;
          setFormData({
            titulo: filme.titulo,
            descricao: filme.descricao,
            duracao: filme.duracao.toString(),
            genero: filme.genero,
            classificacao: filme.classificacao,
            banner: filme.banner || "",
          });
        } else {
          toast.error("Filme não encontrado");
          router.push("/admin/filmes");
        }
      } catch {
        toast.error("Erro ao carregar filme");
        router.push("/admin/filmes");
      } finally {
        setCarregando(false);
      }
    };

    carregarFilme();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await atualizarFilme(id, {
        titulo: formData.titulo,
        descricao: formData.descricao,
        duracao: parseInt(formData.duracao),
        genero: formData.genero,
        classificacao: formData.classificacao,
        banner: formData.banner || undefined,
      });

      if (result.success) {
        toast.success("Filme atualizado com sucesso!");
        router.push("/admin/filmes");
      } else {
        toast.error("Erro ao atualizar filme: " + result.error);
      }
    } catch {
      toast.error("Erro ao atualizar filme");
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
    router.push("/admin/filmes");
  };

  if (carregando) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando filme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Editar Filme
          </h2>
          <p className="text-muted-foreground">
            Atualize as informações do filme
          </p>
        </div>
      </div>

      <MovieForm
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Salvar Alterações"
        onCancel={handleCancel}
        cancelText="Cancelar"
      />
    </div>
  );
}
