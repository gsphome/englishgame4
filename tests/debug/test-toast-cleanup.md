# Test Manual: Limpieza de Toasts

## Casos de prueba:

### ✅ Caso 1: Cambio de vista (Menu → Módulo)
1. Ir al menú principal
2. Entrar a cualquier módulo de aprendizaje
3. **Resultado esperado**: No deben aparecer toasts del menú anterior

### ✅ Caso 2: Cambio entre módulos
1. Entrar a un módulo (ej: Quiz)
2. Responder algunas preguntas (aparecerán toasts)
3. Volver al menú y entrar a otro módulo (ej: Matching)
4. **Resultado esperado**: Los toasts del módulo anterior deben desaparecer

### ✅ Caso 3: Navegación dentro del mismo módulo
1. Entrar a un módulo
2. Responder preguntas (aparecerán toasts)
3. Usar navegación interna (siguiente pregunta, etc.)
4. **Resultado esperado**: Los toasts de respuestas anteriores deben desaparecer automáticamente

### ✅ Caso 4: Regreso al menú
1. Estar en cualquier módulo con toasts visibles
2. Presionar "← Menu" o usar navegación para volver
3. **Resultado esperado**: Todos los toasts deben desaparecer

## Implementación:

- ✅ `appStore.setCurrentView()` limpia todos los toasts con animación
- ✅ `appStore.setCurrentModule()` limpia toasts al cambiar módulo con animación
- ✅ `toast.single.*` limpia toasts anteriores automáticamente
- ✅ `useLearningCleanup` limpia toasts al desmontar componente
- ✅ `clearAllToasts()` usa eventos personalizados para animaciones suaves

### 🔧 Mejoras de sincronización:
- Los toasts se cierran con animación (150ms) en lugar de desaparecer abruptamente
- Se evita la limpieza en renders iniciales
- Timing optimizado para evitar conflictos de animación