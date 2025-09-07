/**
 * Performance Meter - Medidor de rendimiento para Kiro
 * 
 * Este módulo proporciona funciones para medir:
 * - Tiempo de respuesta del chat
 * - Tiempo de indexación de archivos
 * - Uso de memoria del sistema
 */

import { promises as fs } from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

class PerformanceMeter {
  constructor() {
    this.metrics = {
      chatResponseTimes: [],
      indexationTimes: [],
      memoryUsage: [],
      timestamps: []
    };
    this.isMonitoring = false;
  }

  /**
   * Inicia el monitoreo de rendimiento
   */
  startMonitoring() {
    this.isMonitoring = true;
    console.log('📊 Performance monitoring started');
  }

  /**
   * Detiene el monitoreo de rendimiento
   */
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('📊 Performance monitoring stopped');
  }

  /**
   * Mide el tiempo de respuesta del chat
   * @param {Function} chatFunction - Función del chat a medir
   * @param {string} message - Mensaje de entrada
   * @returns {Promise<{response: any, responseTime: number}>}
   */
  async measureChatResponseTime(chatFunction, message) {
    const startTime = performance.now();
    
    try {
      const response = await chatFunction(message);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      if (this.isMonitoring) {
        this.metrics.chatResponseTimes.push({
          responseTime,
          messageLength: message.length,
          timestamp: new Date().toISOString()
        });
      }
      
      return { response, responseTime };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      if (this.isMonitoring) {
        this.metrics.chatResponseTimes.push({
          responseTime,
          messageLength: message.length,
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
      
      throw error;
    }
  }

  /**
   * Mide el tiempo de indexación de archivos
   * @param {Function} indexFunction - Función de indexación a medir
   * @param {string} directoryPath - Ruta del directorio a indexar
   * @returns {Promise<{result: any, indexationTime: number, fileCount: number}>}
   */
  async measureIndexationTime(indexFunction, directoryPath) {
    const startTime = performance.now();
    
    try {
      // Contar archivos antes de indexar
      const fileCount = await this.countFiles(directoryPath);
      
      const result = await indexFunction(directoryPath);
      const endTime = performance.now();
      const indexationTime = endTime - startTime;
      
      if (this.isMonitoring) {
        this.metrics.indexationTimes.push({
          indexationTime,
          fileCount,
          directoryPath,
          timestamp: new Date().toISOString()
        });
      }
      
      return { result, indexationTime, fileCount };
    } catch (error) {
      const endTime = performance.now();
      const indexationTime = endTime - startTime;
      
      if (this.isMonitoring) {
        this.metrics.indexationTimes.push({
          indexationTime,
          fileCount: 0,
          directoryPath,
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
      
      throw error;
    }
  }

  /**
   * Mide el uso actual de memoria
   * @returns {Object} Información detallada del uso de memoria
   */
  measureMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const memoryInfo = {
      rss: this.formatBytes(memoryUsage.rss), // Resident Set Size
      heapTotal: this.formatBytes(memoryUsage.heapTotal),
      heapUsed: this.formatBytes(memoryUsage.heapUsed),
      external: this.formatBytes(memoryUsage.external),
      arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers || 0),
      timestamp: new Date().toISOString(),
      raw: memoryUsage
    };
    
    if (this.isMonitoring) {
      this.metrics.memoryUsage.push(memoryInfo);
    }
    
    return memoryInfo;
  }

  /**
   * Cuenta archivos en un directorio recursivamente
   * @param {string} dirPath - Ruta del directorio
   * @returns {Promise<number>} Número total de archivos
   */
  async countFiles(dirPath) {
    let fileCount = 0;
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          // Evitar directorios problemáticos
          if (!this.shouldSkipDirectory(item.name)) {
            fileCount += await this.countFiles(fullPath);
          }
        } else {
          fileCount++;
        }
      }
    } catch (error) {
      // Ignorar errores de permisos
      console.warn(`Warning: Could not access ${dirPath}: ${error.message}`);
    }
    
    return fileCount;
  }

  /**
   * Determina si un directorio debe ser omitido
   * @param {string} dirName - Nombre del directorio
   * @returns {boolean}
   */
  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules',
      'coverage',
      'dist',
      'dev-dist',
      'html',
      '.git',
      '.vite',
      '.cache',
      '.temp',
      '.tmp'
    ];
    
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Formatea bytes en formato legible
   * @param {number} bytes - Número de bytes
   * @returns {string} Formato legible (KB, MB, GB)
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtiene estadísticas de rendimiento
   * @returns {Object} Estadísticas calculadas
   */
  getPerformanceStats() {
    const stats = {
      chatResponse: this.calculateChatStats(),
      indexation: this.calculateIndexationStats(),
      memory: this.calculateMemoryStats(),
      summary: this.generateSummary()
    };
    
    return stats;
  }

  /**
   * Calcula estadísticas de respuesta del chat
   * @returns {Object}
   */
  calculateChatStats() {
    const times = this.metrics.chatResponseTimes.map(m => m.responseTime);
    
    if (times.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }
    
    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      underTarget: times.filter(t => t < 100).length, // < 100ms target
      overTarget: times.filter(t => t >= 100).length
    };
  }

  /**
   * Calcula estadísticas de indexación
   * @returns {Object}
   */
  calculateIndexationStats() {
    const times = this.metrics.indexationTimes.map(m => m.indexationTime);
    const fileCounts = this.metrics.indexationTimes.map(m => m.fileCount);
    
    if (times.length === 0) {
      return { count: 0, averageTime: 0, averageFiles: 0 };
    }
    
    return {
      count: times.length,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      averageFiles: fileCounts.reduce((a, b) => a + b, 0) / fileCounts.length,
      totalFiles: fileCounts.reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Calcula estadísticas de memoria
   * @returns {Object}
   */
  calculateMemoryStats() {
    const memoryReadings = this.metrics.memoryUsage;
    
    if (memoryReadings.length === 0) {
      return { count: 0, averageHeapUsed: 0, peakHeapUsed: 0 };
    }
    
    const heapUsedValues = memoryReadings.map(m => m.raw.heapUsed);
    
    return {
      count: memoryReadings.length,
      averageHeapUsed: this.formatBytes(heapUsedValues.reduce((a, b) => a + b, 0) / heapUsedValues.length),
      peakHeapUsed: this.formatBytes(Math.max(...heapUsedValues)),
      minHeapUsed: this.formatBytes(Math.min(...heapUsedValues)),
      latest: memoryReadings[memoryReadings.length - 1]
    };
  }

  /**
   * Genera resumen de rendimiento
   * @returns {Object}
   */
  generateSummary() {
    const chatStats = this.calculateChatStats();
    const indexStats = this.calculateIndexationStats();
    
    return {
      chatPerformance: chatStats.average < 100 ? 'Good' : chatStats.average < 500 ? 'Fair' : 'Poor',
      indexationPerformance: indexStats.averageTime < 5000 ? 'Good' : indexStats.averageTime < 15000 ? 'Fair' : 'Poor',
      recommendations: this.generateRecommendations(chatStats, indexStats)
    };
  }

  /**
   * Genera recomendaciones basadas en métricas
   * @param {Object} chatStats - Estadísticas del chat
   * @param {Object} indexStats - Estadísticas de indexación
   * @returns {Array<string>}
   */
  generateRecommendations(chatStats, indexStats) {
    const recommendations = [];
    
    if (chatStats.average > 100) {
      recommendations.push('Chat response time exceeds 100ms target - consider optimizing file exclusions');
    }
    
    if (indexStats.averageTime > 5000) {
      recommendations.push('Indexation time is high - consider excluding more directories');
    }
    
    if (indexStats.averageFiles > 10000) {
      recommendations.push('High file count detected - implement aggressive filtering');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable ranges');
    }
    
    return recommendations;
  }

  /**
   * Exporta métricas a archivo JSON
   * @param {string} filePath - Ruta del archivo de salida
   */
  async exportMetrics(filePath) {
    const exportData = {
      metrics: this.metrics,
      stats: this.getPerformanceStats(),
      exportedAt: new Date().toISOString()
    };
    
    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    console.log(`📊 Metrics exported to ${filePath}`);
  }

  /**
   * Limpia todas las métricas almacenadas
   */
  clearMetrics() {
    this.metrics = {
      chatResponseTimes: [],
      indexationTimes: [],
      memoryUsage: [],
      timestamps: []
    };
    console.log('📊 Metrics cleared');
  }
}

export default PerformanceMeter;