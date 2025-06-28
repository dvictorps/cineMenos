"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MovieForm, type MovieFormData } from "@/components/forms/movie-form";
import { criarFilme } from "@/actions";

export default function NovoFilmePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MovieFormData>({
    titulo: "",
    descricao: "",
    duracao: "",
    genero: "",
    classificacao: "LIVRE",
    banner: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await criarFilme({
        titulo: formData.titulo,
        descricao: formData.descricao,
        duracao: parseInt(formData.duracao),
        genero: formData.genero,
        classificacao: formData.classificacao,
        banner: formData.banner || undefined,
      });

      if (result.success) {
        router.push("/admin/filmes");
      } else {
        alert("Erro ao cadastrar filme: " + result.error);
      }
    } catch {
      alert("Erro ao cadastrar filme");
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

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Novo Filme
          </h2>
          <p className="text-muted-foreground">
            Adicione um novo filme ao catálogo
          </p>
        </div>
      </div>

      <MovieForm
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Cadastrar Filme"
        onCancel={handleCancel}
        cancelText="Cancelar"
      />
    </div>
  );
}
