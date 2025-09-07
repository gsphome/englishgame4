# Performance Meter - Medidor de Rendimiento para Kiro

## Descripción

El Performance Meter es una herramienta diseñada para medir y monitorear el rendimiento de Kiro, especialmente en proyectos grandes con muchos archivos. Proporciona métricas detalladas sobre:

- **Tiempo de respuesta del chat**: Mide la latencia de las interacciones del chat
- **Tiempo de indexación**: Monitorea cuánto tiempo toma indexar archivos
- **Uso de memoria**: Rastrea el consumo de memoria del sistema

## Características

### 🚀 Medición en Tiempo Real
- Monitoreo continuo de métricas de rendimiento
- Capacidad de activar/desactivar el monitoreo
- Almacenamiento automático de métricas históricas

### 📊 Estadísticas Avanzadas
- Cálculo de promedios, mínimos y máximos
- Análisis de tendencias de rendimiento
- Generación de recomendaciones automáticas

### 💾 Exportación de Datos
- Exportación de métricas a formato JSON
- Informes detallados con estadísticas calculadas
- Capacidad de limpiar métricas históricas

### 🎯 Objetivos de Rendimiento
- **Chat**: < 100ms de latencia por respuesta
- **Indexación**: < 5 segundos para proyectos medianos
- **Memoria**: Monitoreo continuo del heap usage

## Uso Básico

### Importación

```javascript
import PerformanceMeter from './performance-meter.js';

const meter = new PerformanceMeter();
```

### Medición de Chat

```javascript
// Iniciar monitoreo
meter.startMonitoring();

// Función de chat a medir
const chatFunction = async (message) => {
  // Tu lógica de chat aquí
  return await processMessage(message);
};

// Medir tiempo de respuesta
const result = await meter.measureChatResponseTime(chatFunction, 'Hello Kiro');
console.log(`Response time: ${result.responseTime}ms`);
console.log(`Response: ${result.response}`);
```

### Medición de Indexación

```javascript
// Función de indexación a medir
const indexFunction = async (path) => {
  // Tu lógica de indexación aquí
  return await indexDirectory(path);
};

// Medir tiempo de indexación
const result = await meter.measureIndexationTime(indexFunction, './src');
console.log(`Indexation time: ${result.indexationTime}ms`);
console.log(`Files processed: ${result.fileCount}`);
```

### Medición de Memoria

```javascript
// Medir uso actual de memoria
const memoryInfo = meter.measureMemoryUsage();
console.log(`Heap used: ${memoryInfo.heapUsed}`);
console.log(`RSS: ${memoryInfo.rss}`);
```

## Ejemplo Completo

```javascript
import PerformanceMeter from './performance-meter.js';

async function performanceExample() {
  const meter = new PerformanceMeter();
  
  // Iniciar monitoreo
  meter.startMonitoring();
  
  // Simular algunas operaciones
  const mockChat = async (msg) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return `Response to: ${msg}`;
  };
  
  const mockIndex = async (path) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { indexed: 150, path };
  };
  
  // Realizar mediciones
  await meter.measureChatResponseTime(mockChat, 'Test message 1');
  await meter.measureChatResponseTime(mockChat, 'Test message 2');
  await meter.measureIndexationTime(mockIndex, './src');
  meter.measureMemoryUsage();
  
  // Obtener estadísticas
  const stats = meter.getPerformanceStats();
  console.log('📊 Performance Statistics:');
  console.log(`Chat average: ${stats.chatResponse.average.toFixed(2)}ms`);
  console.log(`Indexation average: ${stats.indexation.averageTime.toFixed(2)}ms`);
  console.log(`Memory peak: ${stats.memory.peakHeapUsed}`);
  
  // Mostrar recomendaciones
  console.log('\n💡 Recommendations:');
  stats.summary.recommendations.forEach(rec => {
    console.log(`- ${rec}`);
  });
  
  // Exportar métricas
  await meter.exportMetrics('./performance-report.json');
  
  // Detener monitoreo
  meter.stopMonitoring();
}

performanceExample().catch(console.error);
```

## API Reference

### Constructor

```javascript
const meter = new PerformanceMeter();
```

### Métodos de Control

#### `startMonitoring()`
Inicia el monitoreo de métricas.

#### `stopMonitoring()`
Detiene el monitoreo de métricas.

#### `clearMetrics()`
Limpia todas las métricas almacenadas.

### Métodos de Medición

#### `measureChatResponseTime(chatFunction, message)`
- **chatFunction**: Función async que procesa el mensaje
- **message**: Mensaje de entrada
- **Returns**: `{response, responseTime}`

#### `measureIndexationTime(indexFunction, directoryPath)`
- **indexFunction**: Función async que indexa el directorio
- **directoryPath**: Ruta del directorio a indexar
- **Returns**: `{result, indexationTime, fileCount}`

#### `measureMemoryUsage()`
- **Returns**: Objeto con información detallada de memoria

#### `countFiles(directoryPath)`
- **directoryPath**: Ruta del directorio
- **Returns**: Número total de archivos (excluyendo directorios problemáticos)

### Métodos de Análisis

#### `getPerformanceStats()`
Retorna estadísticas completas de rendimiento:

```javascript
{
  chatResponse: {
    count: number,
    average: number,
    min: number,
    max: number,
    underTarget: number,
    overTarget: number
  },
  indexation: {
    count: number,
    averageTime: number,
    minTime: number,
    maxTime: number,
    averageFiles: number,
    totalFiles: number
  },
  memory: {
    count: number,
    averageHeapUsed: string,
    peakHeapUsed: string,
    minHeapUsed: string,
    latest: object
  },
  summary: {
    chatPerformance: 'Good' | 'Fair' | 'Poor',
    indexationPerformance: 'Good' | 'Fair' | 'Poor',
    recommendations: string[]
  }
}
```

#### `exportMetrics(filePath)`
- **filePath**: Ruta del archivo de salida
- Exporta todas las métricas y estadísticas a JSON

## Configuración de Exclusiones

El Performance Meter automáticamente excluye directorios problemáticos:

- `node_modules`
- `coverage`
- `dist`, `dev-dist`, `html`
- `.git`, `.vite`, `.cache`
- `.temp`, `.tmp`
- Cualquier directorio que comience con `.`

## Interpretación de Resultados

### Rendimiento del Chat
- **Good**: < 100ms promedio
- **Fair**: 100-500ms promedio  
- **Poor**: > 500ms promedio

### Rendimiento de Indexación
- **Good**: < 5 segundos promedio
- **Fair**: 5-15 segundos promedio
- **Poor**: > 15 segundos promedio

### Recomendaciones Automáticas

El sistema genera recomendaciones basadas en las métricas:

- Optimización de exclusiones de archivos
- Filtrado más agresivo para proyectos grandes
- Sugerencias de limpieza de directorios

## Testing

Ejecutar los tests:

```bash
node scripts/test-performance-meter.js
```

Los tests cubren:
- ✅ Medición de tiempo de respuesta del chat
- ✅ Medición de tiempo de indexación
- ✅ Medición de uso de memoria
- ✅ Precisión del conteo de archivos
- ✅ Cálculo de estadísticas
- ✅ Manejo de errores
- ✅ Exportación de métricas
- ✅ Toggle de monitoreo
- ✅ Generación de recomendaciones

## Integración con Kiro

Para integrar con Kiro, puedes:

1. **Monitoreo Continuo**: Iniciar el medidor al arrancar Kiro
2. **Medición de Chat**: Envolver las funciones de chat existentes
3. **Medición de Indexación**: Instrumentar el proceso de indexación
4. **Reportes Periódicos**: Exportar métricas regularmente

```javascript
// Ejemplo de integración
const meter = new PerformanceMeter();
meter.startMonitoring();

// En tu función de chat existente
const originalChatFunction = kiro.chat;
kiro.chat = async (message) => {
  const result = await meter.measureChatResponseTime(originalChatFunction, message);
  return result.response;
};

// Exportar métricas cada hora
setInterval(async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await meter.exportMetrics(`./performance-${timestamp}.json`);
}, 3600000);
```

## Troubleshooting

### Problemas Comunes

1. **Permisos de archivo**: El medidor maneja automáticamente errores de permisos
2. **Directorios grandes**: Se implementa filtrado automático para evitar sobrecarga
3. **Memoria insuficiente**: Las métricas se almacenan de forma eficiente

### Debugging

Habilitar logging detallado:

```javascript
// Las advertencias se muestran automáticamente en la consola
// Para debugging adicional, revisar las métricas exportadas
```

## Contribución

Para contribuir al Performance Meter:

1. Ejecutar tests existentes
2. Agregar tests para nuevas funcionalidades
3. Mantener compatibilidad con ES modules
4. Documentar cambios en este README