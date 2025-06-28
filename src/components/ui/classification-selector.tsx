import React from "react";
import { Badge } from "./badge";
import { Star } from "lucide-react";

interface ClassificationOption {
  value: string;
  label: string;
  color: string;
}

interface ClassificationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

const classificacoes: ClassificationOption[] = [
  {
    value: "LIVRE",
    label: "Livre",
    color:
      "bg-green-600 text-white hover:bg-green-500 transition-colors duration-200 cursor-pointer",
  },
  {
    value: "10",
    label: "10 anos",
    color:
      "bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200 cursor-pointer",
  },
  {
    value: "12",
    label: "12 anos",
    color:
      "bg-yellow-600 text-white hover:bg-yellow-500 transition-colors duration-200 cursor-pointer",
  },
  {
    value: "14",
    label: "14 anos",
    color:
      "bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-200 cursor-pointer",
  },
  {
    value: "16",
    label: "16 anos",
    color:
      "bg-red-600 text-white hover:bg-red-500 transition-colors duration-200 cursor-pointer",
  },
  {
    value: "18",
    label: "18 anos",
    color:
      "bg-purple-600 text-white hover:bg-purple-500 transition-colors duration-200 cursor-pointer",
  },
];

export function ClassificationSelector({
  value,
  onChange,
  label = "Classificação Indicativa",
  required = false,
}: ClassificationSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white flex items-center space-x-1">
        <Star className="h-3 w-3" />
        <span>
          {label} {required && "*"}
        </span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {classificacoes.map((classif) => (
          <button
            key={classif.value}
            type="button"
            onClick={() => onChange(classif.value)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
              value === classif.value
                ? "border-blue-300 ring-2 ring-blue-100"
                : "border-border hover:border-blue-200"
            }`}
          >
            <Badge variant="secondary" className={`${classif.color} mx-auto`}>
              {classif.label}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}

export { classificacoes };
export type { ClassificationOption };
