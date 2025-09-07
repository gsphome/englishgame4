# Implementation Plan

- [-] 0. Crear commit de seguridad antes de cambios
  - Ejecutar `git add .` para stagear todos los cambios actuales
  - Crear commit con mensaje descriptivo: "feat: backup before toast system rewrite"
  - Verificar que el commit incluye todos los archivos del sistema de toast actual
  - Confirmar que el estado actual está guardado como punto de restauración
  - _Requirements: Preparación para implementación segura_

- [ ] 1. Eliminar código legacy del sistema de toast
  - Remover completamente el archivo `src/stores/toastStore.ts` existente
  - Eliminar los componentes `src/components/ui/Toast.tsx` y `src/components/ui/ToastContainer.tsx`
  - Borrar el hook `src/hooks/useToast.ts` actual
  - Limpiar todas las importaciones y referencias obsoletas en componentes
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 2. Crear nuevo sistema de toast store sin delays
- [ ] 2.1 Implementar nuevo toastStore con arquitectura simplificada
  - Escribir nuevo `src/stores/toastStore.ts` desde cero sin setTimeout delays
  - Implementar sistema de toast único (máximo uno activo)
  - Crear funciones de limpieza inmediata sin animaciones complejas
  - Agregar persistencia para tracking de welcome toast en localStorage
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 7.2_

- [ ] 2.2 Implementar funciones de toast sin delays
  - Crear funciones `success`, `error`, `warning`, `info` sin setTimeout
  - Implementar `showSingleToast` que reemplaza cualquier toast existente
  - Agregar `clearOnNavigation` para limpieza automática en cambios de vista
  - Crear `showWelcomeOnce` con verificación de localStorage
  - _Requirements: 2.1, 2.2, 1.1, 7.1, 7.3_

- [ ] 3. Crear componentes de toast con diseño compacto y BEM
- [ ] 3.1 Implementar nuevo componente Toast con arquitectura BEM
  - Escribir `src/components/ui/Toast.tsx` desde cero con clases BEM semánticas
  - Implementar diseño compacto (max 320px width, padding 12px, iconos 16px)
  - Crear animaciones de entrada y salida optimizadas
  - Agregar soporte para accessibility (aria-live, role="alert")
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 3.2 Implementar nuevo ToastContainer con gestión de toast único
  - Escribir `src/components/ui/ToastContainer.tsx` desde cero
  - Implementar lógica para mostrar máximo un toast a la vez
  - Posicionar container en esquina superior derecha con z-index apropiado
  - Optimizar rendering para evitar re-renders innecesarios
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4. Crear hook de toast con funciones específicas de aprendizaje
- [ ] 4.1 Implementar nuevo useToast hook
  - Escribir `src/hooks/useToast.ts` desde cero con funciones específicas
  - Crear `showCorrectAnswer` y `showIncorrectAnswer` para feedback inmediato
  - Implementar `showModuleCompleted` con diferentes mensajes según accuracy
  - Agregar funciones de sistema como `showConnectionError`, `showSaveSuccess`
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4.2 Integrar limpieza automática en navegación
  - Modificar `src/App.tsx` para usar nueva función `clearOnNavigation`
  - Remover lógica de limpieza con delays del useEffect actual
  - Implementar limpieza inmediata en cambios de vista
  - Actualizar `useLearningCleanup.ts` para usar nuevo sistema
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Implementar mensaje de bienvenida con persistencia
- [ ] 5.1 Agregar welcome toast en MainMenu component
  - Modificar `src/components/ui/MainMenu.tsx` para mostrar welcome toast
  - Implementar verificación de localStorage para mostrar solo una vez
  - Crear mensaje con cantidad de módulos cargados
  - Manejar casos edge como fallo de localStorage
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 5.2 Implementar sistema de persistencia seguro
  - Crear utilidades para manejo seguro de localStorage
  - Implementar fallbacks para cuando localStorage no esté disponible
  - Agregar validación de datos leídos de localStorage
  - Crear función para limpiar datos obsoletos
  - _Requirements: 7.2, 7.3_

- [ ] 6. Actualizar componentes de aprendizaje para usar nuevo sistema
- [ ] 6.1 Actualizar QuizComponent para feedback inmediato
  - Modificar `src/components/learning/QuizComponent.tsx` para usar nuevo useToast
  - Implementar feedback inmediato sin delays en selección de respuestas
  - Asegurar que toasts previos se limpien antes de mostrar nuevos
  - Verificar que no aparezcan múltiples toasts simultáneamente
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [ ] 6.2 Actualizar CompletionComponent para feedback inmediato
  - Modificar `src/components/learning/CompletionComponent.tsx` para usar nuevo sistema
  - Implementar feedback inmediato en verificación de respuestas
  - Asegurar limpieza de toasts al cambiar de ejercicio
  - Mantener consistencia con otros componentes de aprendizaje
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [ ] 6.3 Actualizar otros componentes de aprendizaje
  - Actualizar `FlashcardComponent.tsx`, `MatchingComponent.tsx`, `SortingComponent.tsx`
  - Reemplazar todas las llamadas al sistema de toast anterior
  - Implementar feedback consistente en todos los modos de aprendizaje
  - Verificar que la limpieza funcione correctamente en todos los componentes
  - _Requirements: 4.1, 4.2, 1.1, 1.2_

- [ ] 7. Crear estilos CSS con arquitectura BEM compacta
- [ ] 7.1 Implementar estilos BEM para toast cards
  - Crear archivo `src/styles/components/toast-card.css` con arquitectura BEM
  - Implementar modificadores para diferentes tipos (success, error, warning, info)
  - Crear modificadores de estado (entering, visible, exiting)
  - Agregar modificadores de tamaño (compact, minimal)
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 7.2 Implementar diseño compacto y responsive
  - Definir constraints de tamaño (max 320px width desktop, full width móvil)
  - Implementar typography compacta (14px título, 12px mensaje)
  - Crear layout optimizado con iconos de 16px
  - Agregar soporte para tema oscuro y claro
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 7.3 Implementar adaptaciones móviles y breakpoints
  - Crear breakpoints para móvil (< 640px), tablet (640px+) y desktop (1024px+)
  - Implementar posicionamiento adaptativo (centrado en móvil, esquina en desktop)
  - Agregar áreas de toque mínimas de 44px para botones en móvil
  - Crear adaptaciones para orientación landscape en móvil
  - Implementar width responsivo (calc(100vw - 32px) en móvil, fijo en desktop)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8. Reescribir tests para nueva lógica
- [ ] 8.1 Crear tests unitarios para nuevo toastStore
  - Escribir tests para verificar comportamiento sin delays
  - Crear tests para limpieza automática en navegación
  - Implementar tests para sistema de toast único
  - Agregar tests para persistencia de welcome toast
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.2 Crear tests de integración para componentes
  - Escribir tests para componentes Toast y ToastContainer nuevos
  - Crear tests para hook useToast con funciones específicas
  - Implementar tests para integración con componentes de aprendizaje
  - Agregar tests para limpieza en navegación
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.3 Crear tests E2E para flujos de usuario
  - Escribir tests para flujo completo de aprendizaje con toasts
  - Crear tests para navegación entre módulos con limpieza correcta
  - Implementar tests para welcome toast en primera visita
  - Agregar tests para prevención de múltiples toasts simultáneos
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8.4 Crear tests específicos para móvil y responsive
  - Escribir tests para diferentes breakpoints (móvil, tablet, desktop)
  - Crear tests para posicionamiento adaptativo en diferentes pantallas
  - Implementar tests para áreas de toque en dispositivos móviles
  - Agregar tests para orientación landscape y portrait
  - Verificar comportamiento en diferentes tamaños de viewport
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9. Verificación final y cleanup
- [ ] 9.1 Auditoría de código legacy eliminado
  - Verificar que no queden referencias al sistema anterior
  - Confirmar que todas las importaciones obsoletas fueron removidas
  - Revisar que no exista código comentado o no utilizado
  - Validar que el nuevo sistema funciona independientemente
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 9.2 Testing de integración completa
  - Ejecutar todos los tests para verificar funcionamiento correcto
  - Probar flujos de usuario completos en diferentes navegadores
  - Verificar comportamiento en modo oscuro y claro
  - Confirmar que accessibility funciona correctamente
  - Probar en dispositivos móviles reales (iOS/Android)
  - Verificar comportamiento en diferentes orientaciones y tamaños de pantalla
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 7.1, 9.1, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9.3 Optimización de performance
  - Verificar que no hay memory leaks en timers o listeners
  - Optimizar re-renders del ToastContainer
  - Confirmar que las animaciones son fluidas
  - Validar que localStorage se usa eficientemente
  - _Requirements: 2.1, 2.2, 9.1, 9.2_