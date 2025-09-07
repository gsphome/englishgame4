/**
 * Ejemplo práctico del Performance Meter
 * Demuestra cómo usar el medidor de rendimiento en un escenario real
 */

import PerformanceMeter from './performance-meter.js';
import { promises as fs } from 'fs';
import path from 'path';

// Simulación de funciones de Kiro para demostración
class MockKiroFunctions {
  /**
   * Simula el procesamiento de chat de Kiro
   */
  static async processChatMessage(message) {
    // Simular tiempo de procesamiento variable basado en complejidad del mensaje
    const complexity = message.length + (message.includes('?') ? 50 : 0);
    const processingTime = Math.min(complexity * 2, 300); // Max 300ms
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simular diferentes tipos de respuesta
    if (message.toLowerCase().includes('error')) {
      throw new Error('Simulated chat processing error');
    }
    
    return {
      response: `Processed: "${message}"`,
      tokens: Math.floor(message.length / 4),
      confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
    };
  }

  /**
   * Simula la indexación de archivos de Kiro
   */
  static async indexDirectory(directoryPath) {
    // Simular conteo de archivos y tiempo de indexación
    const fileCount = await MockKiroFunctions.countFilesInDirectory(directoryPath);
    const indexingTime = fileCount * 0.5; // 0.5ms por archivo
    
    await new Promise(resolve => setTimeout(resolve, indexingTime));
    
    return {
      path: directoryPath,
      filesIndexed: fileCount,
      tokensGenerated: fileCount * 100,
      success: true
    };
  }

  /**
   * Cuenta archivos en un directorio (versión simplificada)
   */
  static async countFilesInDirectory(dirPath) {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      let count = 0;
      
      for (const item of items) {
        if (item.isFile()) {
          count++;
        } else if (item.isDirectory() && !item.name.startsWith('.')) {
          // Recursión limitada para evitar directorios problemáticos
          if (!['node_modules', 'coverage', 'dist'].includes(item.name)) {
            count += await MockKiroFunctions.countFilesInDirectory(
              path.join(dirPath, item.name)
            );
          }
        }
      }
      
      return count;
    } catch (error) {
      return 0; // Directorio inaccesible
    }
  }
}

/**
 * Demostración completa del Performance Meter
 */
async function performanceDemo() {
  console.log('🚀 Iniciando demostración del Performance Meter\n');
  
  const meter = new PerformanceMeter();
  
  // Iniciar monitoreo
  meter.startMonitoring();
  console.log('📊 Monitoreo iniciado\n');
  
  // === FASE 1: Medición de Chat ===
  console.log('💬 FASE 1: Medición de rendimiento del chat');
  console.log('=' .repeat(50));
  
  const chatMessages = [
    'Hello, how are you?',
    'Can you help me with this code?',
    'What is the weather like today?',
    'This is a much longer message that should take more time to process because it contains more text and complexity',
    'error test' // Este debería generar un error
  ];
  
  for (const message of chatMessages) {
    try {
      console.log(`📝 Procesando: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`);
      
      const result = await meter.measureChatResponseTime(
        MockKiroFunctions.processChatMessage,
        message
      );
      
      console.log(`   ⏱️  Tiempo: ${result.responseTime.toFixed(2)}ms`);
      console.log(`   ✅ Respuesta: ${result.response.response.substring(0, 50)}...`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // === FASE 2: Medición de Indexación ===
  console.log('📁 FASE 2: Medición de rendimiento de indexación');
  console.log('=' .repeat(50));
  
  const directoriesToIndex = ['./src', './scripts', './tests'];
  
  for (const dir of directoriesToIndex) {
    try {
      console.log(`📂 Indexando directorio: ${dir}`);
      
      const result = await meter.measureIndexationTime(
        MockKiroFunctions.indexDirectory,
        dir
      );
      
      console.log(`   ⏱️  Tiempo: ${result.indexationTime.toFixed(2)}ms`);
      console.log(`   📄 Archivos: ${result.fileCount}`);
      console.log(`   ✅ Indexados: ${result.result.filesIndexed}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // === FASE 3: Monitoreo de Memoria ===
  console.log('💾 FASE 3: Monitoreo de uso de memoria');
  console.log('=' .repeat(50));
  
  // Tomar varias mediciones de memoria
  for (let i = 0; i < 3; i++) {
    const memoryInfo = meter.measureMemoryUsage();
    console.log(`📊 Medición ${i + 1}:`);
    console.log(`   🧠 Heap usado: ${memoryInfo.heapUsed}`);
    console.log(`   📈 RSS: ${memoryInfo.rss}`);
    console.log(`   🔄 Heap total: ${memoryInfo.heapTotal}`);
    
    // Simular algo de trabajo para cambiar el uso de memoria
    const tempArray = new Array(10000).fill('test data');
    await new Promise(resolve => setTimeout(resolve, 100));
    tempArray.length = 0; // Limpiar
    
    console.log('');
  }
  
  // === FASE 4: Análisis de Estadísticas ===
  console.log('📈 FASE 4: Análisis de estadísticas de rendimiento');
  console.log('=' .repeat(50));
  
  const stats = meter.getPerformanceStats();
  
  console.log('💬 Estadísticas del Chat:');
  console.log(`   📊 Total mediciones: ${stats.chatResponse.count}`);
  console.log(`   ⏱️  Tiempo promedio: ${stats.chatResponse.average.toFixed(2)}ms`);
  console.log(`   🚀 Tiempo mínimo: ${stats.chatResponse.min.toFixed(2)}ms`);
  console.log(`   🐌 Tiempo máximo: ${stats.chatResponse.max.toFixed(2)}ms`);
  console.log(`   ✅ Bajo objetivo (<100ms): ${stats.chatResponse.underTarget}`);
  console.log(`   ⚠️  Sobre objetivo (≥100ms): ${stats.chatResponse.overTarget}`);
  console.log('');
  
  console.log('📁 Estadísticas de Indexación:');
  console.log(`   📊 Total mediciones: ${stats.indexation.count}`);
  console.log(`   ⏱️  Tiempo promedio: ${stats.indexation.averageTime.toFixed(2)}ms`);
  console.log(`   📄 Archivos promedio: ${stats.indexation.averageFiles.toFixed(0)}`);
  console.log(`   📈 Total archivos: ${stats.indexation.totalFiles}`);
  console.log('');
  
  console.log('💾 Estadísticas de Memoria:');
  console.log(`   📊 Total mediciones: ${stats.memory.count}`);
  console.log(`   🧠 Heap promedio: ${stats.memory.averageHeapUsed}`);
  console.log(`   📈 Pico de heap: ${stats.memory.peakHeapUsed}`);
  console.log(`   📉 Mínimo heap: ${stats.memory.minHeapUsed}`);
  console.log('');
  
  console.log('🎯 Evaluación de Rendimiento:');
  console.log(`   💬 Chat: ${stats.summary.chatPerformance}`);
  console.log(`   📁 Indexación: ${stats.summary.indexationPerformance}`);
  console.log('');
  
  console.log('💡 Recomendaciones:');
  stats.summary.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
  console.log('');
  
  // === FASE 5: Exportación de Métricas ===
  console.log('💾 FASE 5: Exportación de métricas');
  console.log('=' .repeat(50));
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportPath = `./performance-demo-${timestamp}.json`;
  
  await meter.exportMetrics(exportPath);
  console.log(`✅ Métricas exportadas a: ${exportPath}`);
  
  // Mostrar un resumen del archivo exportado
  try {
    const exportedData = JSON.parse(await fs.readFile(exportPath, 'utf8'));
    console.log(`📄 Archivo contiene:`);
    console.log(`   - ${exportedData.metrics.chatResponseTimes.length} mediciones de chat`);
    console.log(`   - ${exportedData.metrics.indexationTimes.length} mediciones de indexación`);
    console.log(`   - ${exportedData.metrics.memoryUsage.length} mediciones de memoria`);
    console.log(`   - Estadísticas completas y recomendaciones`);
  } catch (error) {
    console.log(`⚠️  No se pudo leer el archivo exportado: ${error.message}`);
  }
  
  console.log('');
  
  // === FINALIZACIÓN ===
  meter.stopMonitoring();
  console.log('📊 Monitoreo detenido');
  console.log('');
  console.log('🎉 Demostración completada exitosamente!');
  console.log('');
  console.log('📋 Resumen de la demostración:');
  console.log(`   ✅ ${stats.chatResponse.count} mensajes de chat procesados`);
  console.log(`   ✅ ${stats.indexation.count} directorios indexados`);
  console.log(`   ✅ ${stats.memory.count} mediciones de memoria tomadas`);
  console.log(`   ✅ Métricas exportadas a ${exportPath}`);
  console.log('');
  console.log('💡 Próximos pasos:');
  console.log('   1. Revisar el archivo de métricas exportado');
  console.log('   2. Implementar las recomendaciones sugeridas');
  console.log('   3. Integrar el medidor en tu flujo de trabajo de Kiro');
  console.log('   4. Configurar monitoreo continuo para proyectos grandes');
}

// Función para limpiar archivos de demostración
async function cleanup() {
  try {
    const files = await fs.readdir('.');
    const demoFiles = files.filter(file => file.startsWith('performance-demo-'));
    
    if (demoFiles.length > 0) {
      console.log('\n🧹 Limpiando archivos de demostración...');
      for (const file of demoFiles) {
        await fs.unlink(file);
        console.log(`   🗑️  Eliminado: ${file}`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Error durante limpieza: ${error.message}`);
  }
}

// Ejecutar demostración
if (import.meta.url === `file://${process.argv[1]}`) {
  performanceDemo()
    .then(() => {
      console.log('\n❓ ¿Deseas limpiar los archivos de demostración? (Ctrl+C para mantener)');
      setTimeout(cleanup, 5000);
    })
    .catch(error => {
      console.error('❌ Error en la demostración:', error);
      process.exit(1);
    });
}

export default performanceDemo;