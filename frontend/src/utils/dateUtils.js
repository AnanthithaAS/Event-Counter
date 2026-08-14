/**
 * Formats an ISO date string into a user-friendly readable date.
 * Example: "Friday, Aug 14, 2026 at 3:30 PM"
 */
export function formatDisplayDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formats a Date object or ISO string into local `YYYY-MM-DDTHH:mm` format
 * suitable for `<input type="datetime-local">`.
 */
export function toDatetimeLocalString(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Returns an ISO string from local datetime input value.
 */
export function fromDatetimeLocalToISO(localDatetimeString) {
  if (!localDatetimeString) return null;
  const date = new Date(localDatetimeString);
  return isNaN(date.getTime()) ? null : date.toISOString();
}
