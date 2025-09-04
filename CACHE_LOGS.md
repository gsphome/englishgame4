# 🔧 Control de Logs de Cache PWA

Esta aplicación incluye un sistema para controlar los logs verbosos del Service Worker (PWA) que pueden interferir con el debugging de otros errores.

## 🎯 Problema

Los logs de Workbox pueden ser muy verbosos:
```
workbox Router is responding to: /englishgame4/src/assets/data/matching-sample.json
workbox Using StaleWhileRevalidate to respond to '/englishgame4/src/assets/data/matching-sample.json'
Found a cached response in...
```

## ✅ Solución

### 🚀 Métodos Rápidos

#### Opción 1: Scripts NPM (Recomendado)
```bash
# Deshabilitar logs de cache (por defecto)
npm run cache-logs:disable

# Habilitar logs de cache
npm run cache-logs:enable

# Toggle automático (cambiar estado actual)
npm run cache-logs:toggle
```

#### Opción 2: Variable de Entorno Manual
Edita `.env.local`:
```bash
# Deshabilitar logs (consola limpia)
VITE_ENABLE_CACHE_LOGS=false

# Habilitar logs (debugging PWA)
VITE_ENABLE_CACHE_LOGS=true
```

### 🔄 Aplicar Cambios
**Importante**: Después de cambiar la configuración, reinicia el servidor de desarrollo:
```bash
# Detener servidor (Ctrl+C)
# Luego reiniciar
npm run dev
```

## 📊 Estados

### 🔇 Logs DESHABILITADOS (Recomendado para desarrollo)
- ✅ **Consola limpia**: Solo errores reales
- ✅ **Debugging fácil**: Sin ruido de cache
- ✅ **PWA funcional**: Cache sigue funcionando
- ✅ **Performance**: Sin impacto en rendimiento

### 📝 Logs HABILITADOS (Para debugging PWA)
- 🔍 **Información detallada**: Estrategias de cache
- 🔍 **Debugging PWA**: Verificar funcionamiento
- 🔍 **Monitoreo**: Ver qué se cachea
- ⚠️ **Verboso**: Muchos logs en consola

## 🎛️ Configuración Técnica

### Variables de Entorno
```bash
# .env.local
VITE_ENABLE_CACHE_LOGS=false  # true/false
```

### Configuración Automática
La configuración se aplica automáticamente en `vite.config.ts`:
```typescript
const ENABLE_CACHE_LOGS = process.env.VITE_ENABLE_CACHE_LOGS === 'true'

// Workbox mode basado en la bandera
workbox: {
  mode: ENABLE_CACHE_LOGS ? 'development' : 'production',
  // ...
}
```

## 💡 Recomendaciones

### 🎯 Para Desarrollo Normal
```bash
npm run cache-logs:disable
```
- Consola limpia para ver errores reales
- PWA sigue funcionando correctamente

### 🔍 Para Debugging PWA
```bash
npm run cache-logs:enable
```
- Ver información detallada de cache
- Verificar estrategias de caching
- Debuggear problemas offline

### 🔄 Para Cambiar Rápidamente
```bash
npm run cache-logs:toggle
```
- Cambia automáticamente entre estados
- Muestra el estado actual

## 📁 Archivos Relacionados

- `.env.local` - Configuración local
- `.env.example` - Ejemplo de variables
- `vite.config.ts` - Configuración PWA
- `scripts/toggle-cache-logs.js` - Script de toggle
- `package.json` - Scripts NPM

¡Ahora puedes desarrollar con una consola limpia! 🎉