import { useState, useEffect, useCallback, DependencyList } from 'react';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useAsyncData<T>(
  asyncFn: () => Promise<ActionResult<T>>,
  deps: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Erro ao carregar dados');
        setData(null);
      }
    } catch (err) {
      setError('Erro inesperado');
      setData(null);
      console.error('Error in useAsyncData:', err);
    } finally {
      setLoading(false);
    }
  }, [asyncFn, ...deps]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch };
}

export function useAsyncAction<T, P = void>(
  asyncFn: (params: P) => Promise<ActionResult<T>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (params: P): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn(params);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Erro na operação');
        return null;
      }
    } catch (err) {
      setError('Erro inesperado');
      console.error('Error in useAsyncAction:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { execute, loading, error };
} 