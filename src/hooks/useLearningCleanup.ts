import { useEffect } from 'react';
import { toast } from '../stores/toastStore';

/**
 * Hook para limpiar toasts cuando se sale de componentes de aprendizaje
 * Asegura transiciones limpias y sincronizadas
 */
export const useLearningCleanup = () => {
  useEffect(() => {
    // Cleanup function que se ejecuta cuando el componente se desmonta
    return () => {
      // Limpiar todos los toasts relacionados con juegos
      toast.clearGameToasts();
    };
  }, []);

  // También proporciona una función para limpiar manualmente
  const clearGameToasts = () => {
    toast.clearGameToasts();
  };

  return { clearGameToasts };
};