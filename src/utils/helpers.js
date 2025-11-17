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

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a date with time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Get relative time description
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time (e.g., "in 2 hours", "3 days ago")
 */
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

/**
 * Check if a date is overdue
 * @param {string} dateString - ISO date string
 * @returns {boolean} Is overdue
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  try {
    return parseISO(dateString) < new Date();
  } catch {
    return false;
  }
};

/**
 * Get hours until a date
 * @param {string} dateString - ISO date string
 * @returns {number} Hours until date
 */
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

/**
 * Get day of week from date string
 * @param {string} dateString - ISO date string
 * @returns {number} Day of week (0-6, 0=Sunday)
 */
export const getDayOfWeek = (dateString) => {
  if (!dateString) return null;
  try {
    return parseISO(dateString).getDay();
  } catch {
    return null;
  }
};

/**
 * Add days to current date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDaysToNow = (days) => {
  return addDays(new Date(), days);
};

/**
 * Add weeks to current date
 * @param {number} weeks - Number of weeks to add
 * @returns {Date} New date
 */
export const addWeeksToNow = (weeks) => {
  return addWeeks(new Date(), weeks);
};

/**
 * Add months to current date
 * @param {number} months - Number of months to add
 * @returns {Date} New date
 */
export const addMonthsToNow = (months) => {
  return addMonths(new Date(), months);
};

/**
 * Get start of day
 * @param {Date|string} date - Date object or ISO string
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(dateObj);
};

/**
 * Get end of day
 * @param {Date|string} date - Date object or ISO string
 * @returns {Date} End of day
 */
export const getEndOfDay = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(dateObj);
};

/**
 * Format duration in minutes to human readable
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
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

/**
 * Get time slots for a day
 * @param {number} startHour - Start hour (0-23)
 * @param {number} endHour - End hour (0-23)
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {Array} Array of time slot strings
 */
export const getTimeSlots = (startHour = 9, endHour = 18, intervalMinutes = 30) => {
  const slots = [];
  const date = new Date();
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      date.setHours(hour, minute, 0, 0);
      slots.push(format(date, 'h:mm a'));
    }
  }
  
  return slots;
};