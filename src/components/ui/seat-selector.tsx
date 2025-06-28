"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type SeatStatus = "available" | "occupied" | "selected" | "unavailable";

export interface Seat {
  row: number;
  number: number;
  status: SeatStatus;
  id: string;
}

interface SeatSelectorProps {
  rows: number;
  seatsPerRow: number;
  occupiedSeats?: string[];
  onSeatSelect?: (selectedSeats: string[]) => void;
  maxSelection?: number;
  className?: string;
}

export function SeatSelector({
  rows,
  seatsPerRow,
  occupiedSeats = [],
  onSeatSelect,
  maxSelection,
  className,
}: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Gerar layout de assentos
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatId = `${String.fromCharCode(64 + row)}${seat}`;
        seats.push({
          row,
          number: seat,
          status: occupiedSeats.includes(seatId) ? "occupied" : "available",
          id: seatId,
        });
      }
    }
    return seats;
  };

  const seats = generateSeats();

  const handleSeatClick = (seatId: string, currentStatus: SeatStatus) => {
    if (currentStatus === "occupied" || currentStatus === "unavailable") {
      return;
    }

    let newSelectedSeats: string[];

    if (selectedSeats.includes(seatId)) {
      // Desselecionar assento
      newSelectedSeats = selectedSeats.filter((id) => id !== seatId);
    } else {
      // Selecionar assento
      if (maxSelection && selectedSeats.length >= maxSelection) {
        return; // Não permitir mais seleções
      }
      newSelectedSeats = [...selectedSeats, seatId];
    }

    setSelectedSeats(newSelectedSeats);
    onSeatSelect?.(newSelectedSeats);
  };

  const getSeatStatus = (seat: Seat): SeatStatus => {
    if (seat.status === "occupied" || seat.status === "unavailable") {
      return seat.status;
    }
    return selectedSeats.includes(seat.id) ? "selected" : "available";
  };

  const getSeatStyles = (status: SeatStatus) => {
    const baseStyles =
      "w-8 h-8 rounded-t-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-semibold";

    switch (status) {
      case "available":
        return cn(
          baseStyles,
          "bg-green-500 border-green-600 text-white hover:bg-green-400"
        );
      case "selected":
        return cn(
          baseStyles,
          "bg-blue-500 border-blue-600 text-white scale-110"
        );
      case "occupied":
        return cn(
          baseStyles,
          "bg-red-500 border-red-600 text-white cursor-not-allowed"
        );
      case "unavailable":
        return cn(
          baseStyles,
          "bg-gray-400 border-gray-500 text-gray-700 cursor-not-allowed"
        );
      default:
        return baseStyles;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tela do cinema */}
      <div className="flex justify-center mb-8">
        <div className="w-3/4 h-2 bg-gradient-to-r from-gray-600 via-gray-300 to-gray-600 rounded-full shadow-lg">
          <div className="text-center mt-2 text-sm text-muted-foreground">
            TELA
          </div>
        </div>
      </div>

      {/* Layout de assentos */}
      <div className="flex flex-col items-center space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const rowSeats = seats.filter((seat) => seat.row === rowIndex + 1);
          const rowLetter = String.fromCharCode(65 + rowIndex);

          return (
            <div key={rowIndex} className="flex items-center space-x-2">
              {/* Identificador da fileira */}
              <div className="w-6 text-center text-sm font-semibold text-muted-foreground">
                {rowLetter}
              </div>

              {/* Assentos da fileira */}
              <div className="flex space-x-1">
                {rowSeats.map((seat) => {
                  const status = getSeatStatus(seat);
                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id, status)}
                      className={getSeatStyles(status)}
                      disabled={
                        status === "occupied" || status === "unavailable"
                      }
                      title={`Assento ${seat.id} - ${
                        status === "occupied"
                          ? "Ocupado"
                          : status === "selected"
                          ? "Selecionado"
                          : "Disponível"
                      }`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>

              {/* Identificador da fileira (direita) */}
              <div className="w-6 text-center text-sm font-semibold text-muted-foreground">
                {rowLetter}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex justify-center">
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-t border"></div>
            <span className="text-white">Disponível</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-t border"></div>
            <span className="text-white">Selecionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-t border"></div>
            <span className="text-white">Ocupado</span>
          </div>
        </div>
      </div>

      {/* Resumo da seleção */}
      {selectedSeats.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold text-white mb-2">
            Assentos Selecionados:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seatId) => (
              <span
                key={seatId}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium"
              >
                {seatId}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total: {selectedSeats.length} assento
            {selectedSeats.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
