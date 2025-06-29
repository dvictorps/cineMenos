import { MESSAGES } from './constants';

export const validators = {
  required: (value: string | number | null | undefined, fieldName?: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return fieldName ? `${fieldName} é obrigatório` : MESSAGES.VALIDATION.REQUIRED_FIELD;
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return MESSAGES.VALIDATION.INVALID_EMAIL;
    }
    return null;
  },

  minLength: (value: string, minLength: number) => {
    if (value && value.length < minLength) {
      return MESSAGES.VALIDATION.MIN_LENGTH.replace('{length}', minLength.toString());
    }
    return null;
  },

  positiveNumber: (value: number | string, fieldName?: string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
      return `${fieldName || 'Valor'} deve ser um número positivo`;
    }
    return null;
  },

  dateNotPast: (value: Date | string, fieldName?: string) => {
    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day
    
    if (date < now) {
      return `${fieldName || 'Data'} não pode ser no passado`;
    }
    return null;
  },

  maxFileSize: (file: File, maxSizeInMB: number) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `Arquivo deve ter no máximo ${maxSizeInMB}MB`;
    }
    return null;
  },

  imageFile: (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Arquivo deve ser uma imagem (JPEG, PNG ou WebP)';
    }
    return null;
  },
};

export class FormValidator {
  private errors: Record<string, string> = {};

  validate(field: string, value: unknown, rules: Array<() => string | null>) {
    for (const rule of rules) {
      const error = rule();
      if (error) {
        this.errors[field] = error;
        return false;
      }
    }
    delete this.errors[field];
    return true;
  }

  validateAll(validations: Record<string, Array<() => string | null>>) {
    this.errors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(validations)) {
      for (const rule of rules) {
        const error = rule();
        if (error) {
          this.errors[field] = error;
          isValid = false;
          break;
        }
      }
    }

    return isValid;
  }

  getError(field: string) {
    return this.errors[field];
  }

  getErrors() {
    return this.errors;
  }

  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  clear() {
    this.errors = {};
  }
}

// Utility function for common form validation patterns
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, Array<(value: unknown) => string | null>>>
) {
  const validator = new FormValidator();
  const validations: Record<string, Array<() => string | null>> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    if (fieldRules) {
      validations[field] = fieldRules.map(rule => () => rule(data[field]));
    }
  }

  const isValid = validator.validateAll(validations);
  return {
    isValid,
    errors: validator.getErrors(),
  };
} 