/**
 * Validation and formatting utility functions for registration form
 */

/**
 * Format Aadhaar input with dashes (XXXX-XXXX-XXXX)
 * @param input - Raw input
 * @returns Formatted Aadhaar with dashes
 */
export const formatAadhaarInput = (input: string): string => {
  const cleaned = input.replace(/\D/g, '').slice(0, 12);
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
};

/**
 * Calculate password strength (0-100)
 * @param password - Password string
 * @returns Strength score and level
 */
export const calculatePasswordStrength = (password: string): { score: number; level: 'weak' | 'medium' | 'strong' } => {
  if (!password) return { score: 0, level: 'weak' };

  let score = 0;

  // Length check
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[^a-zA-Z\d]/.test(password)) score += 15;

  // Prevent common patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters

  return {
    score: Math.min(100, Math.max(0, score)),
    level: score < 40 ? 'weak' : score < 70 ? 'medium' : 'strong',
  };
};

/**
 * Get password strength color
 * @param level - Strength level
 * @returns Tailwind color class
 */
export const getPasswordStrengthColor = (level: 'weak' | 'medium' | 'strong'): string => {
  switch (level) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-slate-500';
  }
};

/**
 * Check if user is eligible to vote (18+ years)
 * @param dateOfBirth - ISO date string
 * @returns Eligibility object with status and message
 */
export const checkAgeEligibility = (dateOfBirth: string): { eligible: boolean; age: number; message: string } => {
  if (!dateOfBirth) return { eligible: false, age: 0, message: 'Please enter your date of birth' };

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return {
      eligible: false,
      age,
      message: `You must be 18 years or older. You are currently ${age} years old.`,
    };
  }

  return {
    eligible: true,
    age,
    message: `✓ You are ${age} years old and eligible to vote`,
  };
};

/**
 * Format phone number
 * @param input - Raw phone input
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (input: string): string => {
  const cleaned = input.replace(/\D/g, '').slice(0, 10);
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};

/**
 * Validate phone number
 * @param phone - Phone number string
 * @returns Validation result
 */
export const validatePhoneNumber = (phone: string): { valid: boolean; message: string } => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return { valid: false, message: 'Phone number must be 10 digits' };
  }
  return { valid: true, message: 'Phone number is valid' };
};

/**
 * Validate email format
 * @param email - Email string
 * @returns Validation result
 */
export const validateEmail = (email: string): { valid: boolean; message: string } => {
  if (!email) return { valid: false, message: 'Email is required' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  return { valid: true, message: 'Email is valid' };
};

/**
 * Validate password requirements
 * @param password - Password string
 * @returns Validation result
 */
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain lowercase letter' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password must contain a number' };
  return { valid: true, message: 'Password meets all requirements' };
};

/**
 * Check if passwords match
 * @param password - Password string
 * @param confirmPassword - Confirm password string
 * @returns Match result
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): { match: boolean; message: string } => {
  if (!confirmPassword) return { match: false, message: 'Please confirm your password' };
  if (password !== confirmPassword) {
    return { match: false, message: 'Passwords do not match' };
  }
  return { match: true, message: 'Passwords match' };
};
