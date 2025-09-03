import { useCallback } from 'react';
import { toast } from '../stores/toastStore';

/**
 * Custom hook for toast notifications with predefined messages for learning app
 */
export const useToast = () => {
  // Learning-specific toast messages
  const showCorrectAnswer = useCallback(() => {
    const messages = [
      '¡Excelente! 🎉',
      '¡Correcto! 👏',
      '¡Bien hecho! ✨',
      '¡Perfecto! 🌟',
      '¡Genial! 🚀'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    // Use single toast to ensure only one feedback toast is visible
    toast.single.success(randomMessage, 'Sigue así, vas muy bien');
  }, []);

  const showIncorrectAnswer = useCallback((correctAnswer: string) => {
    // Use single toast to ensure only one feedback toast is visible
    toast.single.error('Incorrecto', `La respuesta correcta era: ${correctAnswer}`);
  }, []);

  const showModuleCompleted = useCallback((moduleName: string, score: number, accuracy: number) => {
    // Use single toast to ensure clean completion message
    if (accuracy >= 90) {
      toast.single.success('🎉 ¡Excelente trabajo!', `${moduleName} completado con ${accuracy.toFixed(0)}% de precisión (+${score} puntos)`);
    } else if (accuracy >= 70) {
      toast.single.success('✨ ¡Bien hecho!', `${moduleName} completado con ${accuracy.toFixed(0)}% de precisión (+${score} puntos)`);
    } else if (accuracy >= 50) {
      toast.single.info('Módulo completado', `${moduleName} - ${accuracy.toFixed(0)}% de precisión. ¡Sigue practicando!`);
    } else {
      toast.single.warning('Módulo completado', `${moduleName} - ${accuracy.toFixed(0)}% de precisión. Te recomendamos repasar el contenido.`);
    }
  }, []);

  const showLevelUp = useCallback((newLevel: number, totalPoints: number) => {
    toast.achievement('¡Nivel alcanzado!', `Has llegado al nivel ${newLevel}`, totalPoints);
  }, []);

  const showStreak = useCallback((days: number) => {
    toast.success('¡Racha activa!', `${days} días consecutivos aprendiendo 🔥`);
  }, []);

  const showConnectionError = useCallback(() => {
    toast.error('Error de conexión', 'Verifica tu conexión a internet', {
      action: {
        label: 'Reintentar',
        onClick: () => window.location.reload()
      }
    });
  }, []);

  const showSaveSuccess = useCallback((item: string = 'Configuración') => {
    toast.success('Guardado', `${item} guardada correctamente`);
  }, []);

  const showLoadingError = useCallback((item: string = 'contenido') => {
    toast.error('Error de carga', `No se pudo cargar ${item}. Intenta de nuevo.`);
  }, []);

  const showFeatureComingSoon = useCallback((feature: string) => {
    toast.info('Próximamente', `${feature} estará disponible pronto`);
  }, []);

  const showTip = useCallback((tip: string) => {
    toast.info('💡 Consejo', tip, { duration: 6000 });
  }, []);

  const showWelcome = useCallback((userName?: string) => {
    const message = userName ? `¡Bienvenido de vuelta, ${userName}!` : '¡Bienvenido!';
    toast.success(message, 'Listo para seguir aprendiendo');
  }, []);

  // Generic toast functions (re-exported for convenience)
  const showSuccess = useCallback((title: string, message?: string) => {
    toast.success(title, message);
  }, []);

  const showError = useCallback((title: string, message?: string) => {
    toast.error(title, message);
  }, []);

  const showInfo = useCallback((title: string, message?: string) => {
    toast.info(title, message);
  }, []);

  const showWarning = useCallback((title: string, message?: string) => {
    toast.warning(title, message);
  }, []);

  return {
    // Learning-specific
    showCorrectAnswer,
    showIncorrectAnswer,
    showModuleCompleted,
    showLevelUp,
    showStreak,
    showTip,
    showWelcome,
    
    // System-specific
    showConnectionError,
    showSaveSuccess,
    showLoadingError,
    showFeatureComingSoon,
    
    // Generic
    showSuccess,
    showError,
    showInfo,
    showWarning,
    
    // Direct access to toast store
    toast,
  };
};