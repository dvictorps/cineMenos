"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GenreSelect } from "@/components/ui/genre-select";
import {
  ClassificationSelector,
  classificacoes,
} from "@/components/ui/classification-selector";
import { ImageUpload } from "@/components/ui/image-upload";
import { Save, Film, Clock, Loader2, Image as ImageIcon } from "lucide-react";

interface MovieFormData {
  titulo: string;
  descricao: string;
  duracao: string;
  genero: string;
  classificacao: string;
  banner: string;
}

interface MovieFormProps {
  formData: MovieFormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitText?: string;
  onCancel?: () => void;
  cancelText?: string;
}

export function MovieForm({
  formData,
  onInputChange,
  onSubmit,
  loading,
  submitText = "Cadastrar Filme",
  onCancel,
  cancelText = "Cancelar",
}: MovieFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Film className="h-5 w-5" />
              <span>Informações do Filme</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Título *
                </label>
                <Input
                  placeholder="Digite o título do filme"
                  value={formData.titulo}
                  onChange={(e) => onInputChange("titulo", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Descrição *
                </label>
                <textarea
                  placeholder="Descreva a sinopse do filme..."
                  value={formData.descricao}
                  onChange={(e) => onInputChange("descricao", e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-input bg-card text-foreground rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Duração (minutos) *</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={formData.duracao}
                    onChange={(e) => onInputChange("duracao", e.target.value)}
                    required
                    min="1"
                    max="500"
                  />
                </div>

                <GenreSelect
                  value={formData.genero}
                  onChange={(value) => onInputChange("genero", value)}
                />
              </div>

              <ClassificationSelector
                value={formData.classificacao}
                onChange={(value) => onInputChange("classificacao", value)}
                required
              />

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
                      {submitText}
                    </>
                  )}
                </Button>

                {onCancel && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer"
                  >
                    {cancelText}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Banner do Filme</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              value={formData.banner}
              onChange={(value) => onInputChange("banner", value || "")}
              disabled={loading}
              maxSizeMB={5}
            />

            {formData.titulo && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{formData.titulo}</h3>
                {formData.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {formData.descricao}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.genero && (
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted transition-colors duration-200"
                    >
                      {formData.genero}
                    </Badge>
                  )}
                  {formData.classificacao && (
                    <Badge
                      variant="secondary"
                      className={`cursor-pointer transition-colors duration-200 ${
                        classificacoes.find(
                          (c) => c.value === formData.classificacao
                        )?.color || ""
                      }`}
                    >
                      {
                        classificacoes.find(
                          (c) => c.value === formData.classificacao
                        )?.label
                      }
                    </Badge>
                  )}
                  {formData.duracao && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formData.duracao}min
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export type { MovieFormData };
