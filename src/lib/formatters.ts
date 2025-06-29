// Cache formatters para melhor performance
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit'
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export const formatters = {
  date: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateFormatter.format(dateObj);
  },
  
  time: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return timeFormatter.format(dateObj);
  },
  
  dateTime: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return `${formatters.date(dateObj)} às ${formatters.time(dateObj)}`;
  },
  
  currency: (value: number) => currencyFormatter.format(value),
  
  duration: (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  },
  
  seats: (seatsJson: string) => {
    try {
      const seats = JSON.parse(seatsJson);
      return Array.isArray(seats) ? seats.join(', ') : seatsJson;
    } catch {
      return seatsJson;
    }
  },

  percentage: (value: number, decimals: number = 0) => `${value.toFixed(decimals)}%`,

  compactNumber: (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  },

  truncate: (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  relativeDays: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (dateHelpers.isToday(dateObj)) return 'Hoje';
    if (dateHelpers.isTomorrow(dateObj)) return 'Amanhã';
    return formatters.date(dateObj);
  }
};

export const dateHelpers = {
  isToday: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  },

  isTomorrow: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateObj.toDateString() === tomorrow.toDateString();
  },

  isThisWeek: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    return dateObj >= now && dateObj <= weekFromNow;
  },

  isPast: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj < new Date();
  },

  getRelativeTime: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 0) {
      return 'Finalizada';
    } else if (diffMinutes < 30) {
      return 'Em breve';
    } else {
      return 'Agendada';
    }
  }
}; 