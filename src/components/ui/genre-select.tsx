"use client";

import { Film } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const genres = [
  "Ação",
  "Aventura",
  "Comédia",
  "Drama",
  "Ficção Científica",
  "Terror",
  "Romance",
  "Suspense",
  "Documentário",
  "Animação",
  "Musical",
  "Guerra",
  "Western",
  "Biografia",
  "Crime",
];

interface GenreSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function GenreSelect({
  value,
  onChange,
  placeholder = "Selecione um gênero",
  required = false,
}: GenreSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Film className="w-4 h-4" />
        Gênero {required && <span className="text-red-500">*</span>}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {genres
            .filter((genre) => genre && genre.trim() !== "")
            .map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
