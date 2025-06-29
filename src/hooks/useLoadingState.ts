import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useLoadingState(initialState = false) {
  const [loading, setLoading] = useState(initialState);
  
  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
    }
  ): Promise<T | null> => {
    setLoading(true);
    try {
      const result = await asyncFn();
      
      if (options?.showSuccessToast && options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      console.error('Error in withLoading:', error);
      
      if (options?.showErrorToast !== false) {
        const message = options?.errorMessage || 'Ocorreu um erro inesperado';
        toast.error(message);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
} 