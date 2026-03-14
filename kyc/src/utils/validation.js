/**
 * Input validation utilities for the KYC onboarding flow.
 * All validators return { isValid: boolean, error: string | null }
 */

// ─── Individual Field Validators ──────────────────────────────────────────────

export const validateRequired = (value, fieldName) => {
  if (!value || !String(value).trim()) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true, error: null };
};

/**
 * CIN (Carte d'Identité Nationale) validation.
 * Moroccan CIN format: 1-2 letters followed by 5-6 digits (e.g., AB123456 or A123456)
 */
export const validateCIN = (cin) => {
  if (!cin || !cin.trim()) {
    return { isValid: false, error: 'CIN is required.' };
  }
  const cinRegex = /^[A-Za-z]{1,2}[0-9]{5,7}$/;
  if (!cinRegex.test(cin.trim())) {
    return { isValid: false, error: 'CIN must be 1-2 letters followed by 5-7 digits (e.g. AB123456).' };
  }
  return { isValid: true, error: null };
};

/**
 * Phone validation — accepts Moroccan format (+212xxxxxxxxx or 0xxxxxxxxx)
 * and generic international format.
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }
  const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$|^\+?[0-9]{8,15}$/;
  if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) {
    return { isValid: false, error: 'Enter a valid phone number (e.g. +212612345678 or 0612345678).' };
  }
  return { isValid: true, error: null };
};

/**
 * Date of birth validation.
 * Must be a valid date and the person must be at least 18 years old.
 */
export const validateBirthDate = (dateString) => {
  if (!dateString) {
    return { isValid: false, error: 'Date of birth is required.' };
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Enter a valid date.' };
  }
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
    ? age - 1
    : age;

  if (actualAge < 18) {
    return { isValid: false, error: 'You must be at least 18 years old.' };
  }
  if (actualAge > 120) {
    return { isValid: false, error: 'Please enter a valid date of birth.' };
  }
  return { isValid: true, error: null };
};

/**
 * Name validation (first name or last name).
 * Must be at least 2 characters and only contain letters, spaces, hyphens, apostrophes.
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters.` };
  }
  const nameRegex = /^[A-Za-zÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes.` };
  }
  return { isValid: true, error: null };
};

// ─── Full Form Validator ───────────────────────────────────────────────────────

/**
 * Validates all personal info form fields at once.
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export const validatePersonalInfo = (data) => {
  const errors = {};

  const firstNameResult = validateName(data.firstName, 'First name');
  if (!firstNameResult.isValid) errors.firstName = firstNameResult.error;

  const lastNameResult = validateName(data.lastName, 'Last name');
  if (!lastNameResult.isValid) errors.lastName = lastNameResult.error;

  const cinResult = validateCIN(data.cin);
  if (!cinResult.isValid) errors.cin = cinResult.error;

  const birthDateResult = validateBirthDate(data.birthDate);
  if (!birthDateResult.isValid) errors.birthDate = birthDateResult.error;

  const phoneResult = validatePhone(data.phone);
  if (!phoneResult.isValid) errors.phone = phoneResult.error;

  const addressResult = validateRequired(data.address, 'Address');
  if (!addressResult.isValid) errors.address = addressResult.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
