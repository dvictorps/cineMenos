import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MESSAGES } from '@/lib/constants';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseDataFetchingOptions {
  enableToast?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useDataFetching<T>(
  fetchFn: () => Promise<ActionResult<T>>,
  options: UseDataFetchingOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    enableToast = false,
    errorMessage = MESSAGES.ERRORS.LOAD_DATA,
    onSuccess,
    onError,
  } = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      if (result.success && result.data) {
        setData(result.data);
        onSuccess?.(result.data);
      } else {
        const errorMsg = result.error || errorMessage;
        setError(errorMsg);
        
        if (enableToast) {
          toast.error(errorMsg);
        }
        
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = MESSAGES.ERRORS.GENERIC;
      setError(errorMsg);
      
      if (enableToast) {
        toast.error(errorMsg);
      }
      
      onError?.(errorMsg);
      console.error('Error in useDataFetching:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, errorMessage, enableToast, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

interface UseActionOptions extends UseDataFetchingOptions {
  successMessage?: string;
}

export function useAction<T, P = void>(
  actionFn: (params: P) => Promise<ActionResult<T>>,
  options: UseActionOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    enableToast = true,
    successMessage = MESSAGES.SUCCESS.SAVED,
    errorMessage = MESSAGES.ERRORS.SAVE_DATA,
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(async (params: P): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await actionFn(params);
      
      if (result.success && result.data) {
        if (enableToast && successMessage) {
          toast.success(successMessage);
        }
        
        onSuccess?.(result.data);
        return result.data;
      } else {
        const errorMsg = result.error || errorMessage;
        setError(errorMsg);
        
        if (enableToast) {
          toast.error(errorMsg);
        }
        
        onError?.(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = MESSAGES.ERRORS.GENERIC;
      setError(errorMsg);
      
      if (enableToast) {
        toast.error(errorMsg);
      }
      
      onError?.(errorMsg);
      console.error('Error in useAction:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [actionFn, successMessage, errorMessage, enableToast, onSuccess, onError]);

  return {
    execute,
    loading,
    error,
  };
}

export function useMutationWithRefetch<T, P = void>(
  actionFn: (params: P) => Promise<ActionResult<T>>,
  refetchFn: () => void,
  options: UseActionOptions = {}
) {
  const { execute, loading, error } = useAction(actionFn, {
    ...options,
    onSuccess: (data) => {
      options.onSuccess?.(data);
      refetchFn();
    },
  });

  return { execute, loading, error };
} 