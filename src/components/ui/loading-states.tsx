import { Loader2, Film, Calendar, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

interface LoadingStateProps {
  text?: string;
  fullScreen?: boolean;
  icon?: "default" | "film" | "calendar" | "ticket";
  className?: string;
}

export function LoadingState({
  text = "Carregando...",
  fullScreen = false,
  icon = "default",
  className,
}: LoadingStateProps) {
  const IconComponent = {
    default: Loader2,
    film: Film,
    calendar: Calendar,
    ticket: Ticket,
  }[icon];

  const containerClasses = fullScreen
    ? "min-h-screen bg-background flex items-center justify-center"
    : "flex-1 flex items-center justify-center p-6";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="text-center">
        <IconComponent className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorState({
  title = "Ops! Algo deu errado",
  message,
  onRetry,
  retryText = "Tentar novamente",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn("flex-1 flex items-center justify-center p-6", className)}
    >
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        {icon || <Film className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
