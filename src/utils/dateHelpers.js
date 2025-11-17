// src/utils/dateHelpers.js
import { 
  format, 
  parseISO, 
  addDays, 
  addWeeks, 
  addMonths,
  startOfDay,
  endOfDay,
  isToday,
  isTomorrow,
  isThisWeek,
  formatDistanceToNow
} from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid date';
  }
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    const now = new Date();
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    
    if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    }
    
    if (date < now) {
      return `${formatDistanceToNow(date)} ago`;
    }
    
    if (isThisWeek(date)) {
      return `${format(date, 'EEEE')} at ${format(date, 'h:mm a')}`;
    }
    
    return format(date, 'MMM d');
  } catch {
    return 'Invalid date';
  }
};

export const isOverdue = (dateString) => {
  if (!dateString) return false;
  try {
    return parseISO(dateString) < new Date();
  } catch {
    return false;
  }
};

export const getHoursUntil = (dateString) => {
  if (!dateString) return Infinity;
  try {
    const date = parseISO(dateString);
    const now = new Date();
    return (date - now) / (1000 * 60 * 60);
  } catch {
    return Infinity;
  }
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
};