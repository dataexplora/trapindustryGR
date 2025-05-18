/**
 * Direct date formatting without any timezone conversion
 */

/**
 * Format a date with a specific format
 */
export const formatGreekDate = (date: Date | string | null | undefined, formatStr: string): string => {
  if (!date) return '';
  
  // If it's a string, parse it but force the exact time without timezone conversion
  if (typeof date === 'string') {
    // Parse the date string manually to prevent timezone conversion
    const parts = date.split('T');
    if (parts.length === 2) {
      const dateParts = parts[0].split('-');
      const timeParts = parts[1].split(':');
      
      if (dateParts.length === 3 && timeParts.length >= 2) {
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
        const day = parseInt(dateParts[2]);
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        
        const dateObj = new Date();
        dateObj.setFullYear(year, month, day);
        dateObj.setHours(hour, minute, 0, 0);
        
        // Format using basic JavaScript to avoid any library conversion
        const formatter = new Intl.DateTimeFormat('en', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        if (formatStr.includes('h:mm a')) {
          // Manually format time
          const hours = dateObj.getHours();
          const mins = dateObj.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12;
          const formattedTime = `${hour12}:${mins < 10 ? '0' + mins : mins} ${ampm}`;
          
          if (formatStr === 'h:mm a') {
            return formattedTime;
          } else {
            return `${formatter.format(dateObj)} at ${formattedTime}`;
          }
        }
        
        return formatter.format(dateObj);
      }
    }
  }
  
  // If it's already a Date object or couldn't parse string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format using basic JavaScript to avoid any library conversion
  const formatter = new Intl.DateTimeFormat('en', {
    weekday: formatStr.includes('EEEE') ? 'long' : 'short',
    year: 'numeric',
    month: formatStr.includes('MMMM') ? 'long' : 'short',
    day: 'numeric'
  });
  
  if (formatStr.includes('h:mm a')) {
    // Manually format time
    const hours = dateObj.getHours();
    const mins = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const formattedTime = `${hour12}:${mins < 10 ? '0' + mins : mins} ${ampm}`;
    
    if (formatStr === 'h:mm a') {
      return formattedTime;
    } else {
      return `${formatter.format(dateObj)} at ${formattedTime}`;
    }
  }
  
  return formatter.format(dateObj);
};

/**
 * Format a date for display with time
 */
export const formatGreekDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // Extract the time directly from the string if it's in ISO format
    const match = date.match(/T(\d{2}):(\d{2}):/);
    if (match) {
      const hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      const datePart = formatGreekDate(date, 'full');
      return `${datePart} at ${hour12}:${minute < 10 ? '0' + minute : minute} ${ampm}`;
    }
  }
  
  return formatGreekDate(date, 'EEEE, MMMM d, yyyy at h:mm a');
};

/**
 * Format a date for display without time
 */
export const formatGreekDateOnly = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  return formatGreekDate(date, 'EEE, MMM d, yyyy');
};

/**
 * Format time only - DIRECTLY extract the hour:minute from the ISO string
 * without any timezone or library processing
 */
export const formatGreekTimeOnly = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  // If it's a string in ISO format, extract the time part directly
  if (typeof date === 'string') {
    const match = date.match(/T(\d{2}):(\d{2}):/);
    if (match) {
      const hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minute < 10 ? '0' + minute : minute} ${ampm}`;
    }
  }
  
  // Otherwise use the safe method
  return formatGreekDate(date, 'h:mm a');
};

/**
 * Format a date for database storage - just convert to ISO without timezone handling
 */
export const formatForStorage = (date: Date | null | undefined): string | null => {
  if (!date) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Get time from now
 */
export const getTimeFromNow = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays < 0) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
  } else {
    // Same day
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffHours < 0) {
      return `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
    } else {
      // Same hour
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins > 0) {
        return `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
      } else if (diffMins < 0) {
        return `${Math.abs(diffMins)} minute${Math.abs(diffMins) > 1 ? 's' : ''} ago`;
      } else {
        return 'just now';
      }
    }
  }
}; 