import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SessionStatus = "finished" | "upcoming" | "scheduled";
type ActiveStatus = "active" | "inactive";
type ClassificationStatus = "LIVRE" | "10" | "12" | "14" | "16" | "18";

interface StatusBadgeProps {
  status: SessionStatus | ActiveStatus | ClassificationStatus;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const configs = {
    active: {
      color: "bg-green-600 hover:bg-green-500 text-white",
      text: "Ativo",
    },
    inactive: {
      color: "bg-red-600 hover:bg-red-500 text-white",
      text: "Inativo",
    },
    finished: {
      color: "bg-gray-600 hover:bg-gray-500 text-white",
      text: "Finalizada",
    },
    upcoming: {
      color: "bg-yellow-600 hover:bg-yellow-500 text-white",
      text: "Em breve",
    },
    scheduled: {
      color: "bg-green-600 hover:bg-green-500 text-white",
      text: "Agendada",
    },
    LIVRE: {
      color: "bg-green-600 hover:bg-green-500 text-white",
      text: "LIVRE",
    },
    "10": {
      color: "bg-blue-600 hover:bg-blue-500 text-white",
      text: "10",
    },
    "12": {
      color: "bg-yellow-600 hover:bg-yellow-500 text-white",
      text: "12",
    },
    "14": {
      color: "bg-orange-600 hover:bg-orange-500 text-white",
      text: "14",
    },
    "16": {
      color: "bg-red-600 hover:bg-red-500 text-white",
      text: "16",
    },
    "18": {
      color: "bg-purple-600 hover:bg-purple-500 text-white",
      text: "18",
    },
  };

  const config = configs[status] || {
    color: "bg-gray-600 hover:bg-gray-500 text-white",
    text: status,
  };

  return (
    <Badge
      className={cn(
        config.color,
        "cursor-pointer transition-colors duration-200",
        className
      )}
    >
      {label || config.text}
    </Badge>
  );
}

interface SessionStatusBadgeProps {
  date: Date | string;
  className?: string;
}

export function SessionStatusBadge({
  date,
  className,
}: SessionStatusBadgeProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  let status: SessionStatus;
  if (diffMinutes < 0) {
    status = "finished";
  } else if (diffMinutes < 30) {
    status = "upcoming";
  } else {
    status = "scheduled";
  }

  return <StatusBadge status={status} className={className} />;
}
