export function required(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`;
}

export function validEmail(value: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? null
    : "Enter a valid email address.";
}

export function strongPassword(value: string): string | null {
  if (value.length < 10) return "Password must contain at least 10 characters.";
  if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must contain a lowercase letter.";
  if (!/[0-9]/.test(value)) return "Password must contain a number.";
  return null;
}
