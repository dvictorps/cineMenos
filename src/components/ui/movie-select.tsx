"use client";

import { Film } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Movie {
  id: string;
  titulo: string;
  duracao: number;
  genero: string;
}

interface MovieSelectProps {
  movies: Movie[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MovieSelect({
  movies,
  value,
  onChange,
  placeholder = "Selecione um filme",
}: MovieSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Film className="w-4 h-4" />
        Filme
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {movies
            .filter((movie) => movie.id && movie.id.trim() !== "")
            .map((movie) => (
              <SelectItem key={movie.id} value={movie.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{movie.titulo}</span>
                  <span className="text-xs text-muted-foreground">
                    {movie.genero} • {movie.duracao}min
                  </span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
