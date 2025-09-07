/**
 * Tests para el Performance Meter
 */

import PerformanceMeter from './performance-meter.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Mock functions para testing
const mockChatFunction = async (message) => {
  // Simular tiempo de procesamiento variable
  const delay = message.length > 50 ? 150 : 50;
  await new Promise(resolve => setTimeout(resolve, delay));
  return `Response to: ${message}`;
};

const mockIndexFunction = async (directoryPath) => {
  // Simular indexación con tiempo proporcional al número de archivos
  const fileCount = Math.floor(Math.random() * 1000) + 100;
  const delay = fileCount * 0.1; // 0.1ms por archivo
  await new Promise(resolve => setTimeout(resolve, delay));
  return { indexed: fileCount, path: directoryPath };
};

const mockErrorChatFunction = async (message) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  throw new Error('Mock chat error');
};

class PerformanceMeterTests {
  constructor() {
    this.testResults = [];
    this.meter = new PerformanceMeter();
  }

  /**
   * Ejecuta todos los tests
   */
  async runAllTests() {
    console.log('🧪 Starting Performance Meter Tests...\n');

    await this.testChatResponseMeasurement();
    await this.testIndexationMeasurement();
    await this.testMemoryUsageMeasurement();
    await this.testFileCountingAccuracy();
    await this.testStatisticsCalculation();
    await this.testErrorHandling();
    await this.testMetricsExport();
    await this.testMonitoringToggle();
    await this.testPerformanceRecommendations();

    this.printTestSummary();
    return this.testResults.every(result => result.passed);
  }

  /**
   * Test para medición de tiempo de respuesta del chat
   */
  async testChatResponseMeasurement() {
    console.log('📝 Testing chat response time measurement...');
    
    try {
      this.meter.startMonitoring();
      
      // Test con mensaje corto
      const shortResult = await this.meter.measureChatResponseTime(mockChatFunction, 'Hello');
      this.assert(
        shortResult.responseTime > 0 && shortResult.responseTime < 200,
        'Short message response time should be reasonable',
        `Got ${shortResult.responseTime}ms`
      );
      
      // Test con mensaje largo
      const longMessage = 'This is a much longer message that should take more time to process';
      const longResult = await this.meter.measureChatResponseTime(mockChatFunction, longMessage);
      this.assert(
        longResult.responseTime > shortResult.responseTime,
        'Long message should take more time than short message',
        `Short: ${shortResult.responseTime}ms, Long: ${longResult.responseTime}ms`
      );
      
      // Verificar que las métricas se guardaron
      this.assert(
        this.meter.metrics.chatResponseTimes.length === 2,
        'Should have recorded 2 chat response measurements',
        `Recorded ${this.meter.metrics.chatResponseTimes.length} measurements`
      );
      
      console.log('✅ Chat response measurement test passed\n');
    } catch (error) {
      this.recordFailure('testChatResponseMeasurement', error);
    }
  }

  /**
   * Test para medición de tiempo de indexación
   */
  async testIndexationMeasurement() {
    console.log('📝 Testing indexation time measurement...');
    
    try {
      const testPath = './src';
      const result = await this.meter.measureIndexationTime(mockIndexFunction, testPath);
      
      this.assert(
        result.indexationTime > 0,
        'Indexation time should be positive',
        `Got ${result.indexationTime}ms`
      );
      
      this.assert(
        result.fileCount > 0,
        'File count should be positive',
        `Got ${result.fileCount} files`
      );
      
      this.assert(
        this.meter.metrics.indexationTimes.length === 1,
        'Should have recorded 1 indexation measurement',
        `Recorded ${this.meter.metrics.indexationTimes.length} measurements`
      );
      
      console.log('✅ Indexation measurement test passed\n');
    } catch (error) {
      this.recordFailure('testIndexationMeasurement', error);
    }
  }

  /**
   * Test para medición de uso de memoria
   */
  async testMemoryUsageMeasurement() {
    console.log('📝 Testing memory usage measurement...');
    
    try {
      const memoryInfo = this.meter.measureMemoryUsage();
      
      this.assert(
        memoryInfo.raw.heapUsed > 0,
        'Heap used should be positive',
        `Got ${memoryInfo.heapUsed}`
      );
      
      this.assert(
        memoryInfo.timestamp,
        'Should include timestamp',
        `Timestamp: ${memoryInfo.timestamp}`
      );
      
      this.assert(
        memoryInfo.rss.includes('MB') || memoryInfo.rss.includes('KB'),
        'RSS should be formatted with units',
        `RSS: ${memoryInfo.rss}`
      );
      
      // Test múltiples mediciones
      const memoryInfo2 = this.meter.measureMemoryUsage();
      this.assert(
        this.meter.metrics.memoryUsage.length === 2,
        'Should have recorded 2 memory measurements',
        `Recorded ${this.meter.metrics.memoryUsage.length} measurements`
      );
      
      console.log('✅ Memory usage measurement test passed\n');
    } catch (error) {
      this.recordFailure('testMemoryUsageMeasurement', error);
    }
  }

  /**
   * Test para precisión del conteo de archivos
   */
  async testFileCountingAccuracy() {
    console.log('📝 Testing file counting accuracy...');
    
    try {
      // Crear directorio temporal para testing
      const tempDir = path.join(os.tmpdir(), 'performance-meter-test');
      await fs.mkdir(tempDir, { recursive: true });
      
      // Crear algunos archivos de prueba
      await fs.writeFile(path.join(tempDir, 'test1.txt'), 'test');
      await fs.writeFile(path.join(tempDir, 'test2.js'), 'console.log("test");');
      
      // Crear subdirectorio
      const subDir = path.join(tempDir, 'subdir');
      await fs.mkdir(subDir, { recursive: true });
      await fs.writeFile(path.join(subDir, 'test3.md'), '# Test');
      
      const fileCount = await this.meter.countFiles(tempDir);
      
      this.assert(
        fileCount === 3,
        'Should count all files including subdirectories',
        `Expected 3, got ${fileCount}`
      );
      
      // Limpiar
      await fs.rm(tempDir, { recursive: true, force: true });
      
      console.log('✅ File counting accuracy test passed\n');
    } catch (error) {
      this.recordFailure('testFileCountingAccuracy', error);
    }
  }

  /**
   * Test para cálculo de estadísticas
   */
  async testStatisticsCalculation() {
    console.log('📝 Testing statistics calculation...');
    
    try {
      // Limpiar métricas previas
      this.meter.clearMetrics();
      this.meter.startMonitoring();
      
      // Generar algunas métricas
      await this.meter.measureChatResponseTime(mockChatFunction, 'Test 1');
      await this.meter.measureChatResponseTime(mockChatFunction, 'Test 2');
      await this.meter.measureIndexationTime(mockIndexFunction, './test');
      this.meter.measureMemoryUsage();
      
      const stats = this.meter.getPerformanceStats();
      
      this.assert(
        stats.chatResponse.count === 2,
        'Should have 2 chat response measurements',
        `Got ${stats.chatResponse.count}`
      );
      
      this.assert(
        stats.chatResponse.average > 0,
        'Average response time should be positive',
        `Got ${stats.chatResponse.average}ms`
      );
      
      this.assert(
        stats.indexation.count === 1,
        'Should have 1 indexation measurement',
        `Got ${stats.indexation.count}`
      );
      
      this.assert(
        stats.memory.count === 1,
        'Should have 1 memory measurement',
        `Got ${stats.memory.count}`
      );
      
      this.assert(
        stats.summary.recommendations.length > 0,
        'Should provide recommendations',
        `Got ${stats.summary.recommendations.length} recommendations`
      );
      
      console.log('✅ Statistics calculation test passed\n');
    } catch (error) {
      this.recordFailure('testStatisticsCalculation', error);
    }
  }

  /**
   * Test para manejo de errores
   */
  async testErrorHandling() {
    console.log('📝 Testing error handling...');
    
    try {
      this.meter.clearMetrics();
      this.meter.startMonitoring();
      
      // Test error en chat function
      try {
        await this.meter.measureChatResponseTime(mockErrorChatFunction, 'Error test');
        this.recordFailure('testErrorHandling', new Error('Should have thrown error'));
        return;
      } catch (error) {
        // Error esperado
      }
      
      // Verificar que la métrica se registró con error
      this.assert(
        this.meter.metrics.chatResponseTimes.length === 1,
        'Should record measurement even with error',
        `Recorded ${this.meter.metrics.chatResponseTimes.length} measurements`
      );
      
      this.assert(
        this.meter.metrics.chatResponseTimes[0].error,
        'Should record error information',
        `Error: ${this.meter.metrics.chatResponseTimes[0].error}`
      );
      
      // Test directorio inexistente
      const fileCount = await this.meter.countFiles('/nonexistent/directory');
      this.assert(
        fileCount === 0,
        'Should return 0 for nonexistent directory',
        `Got ${fileCount}`
      );
      
      console.log('✅ Error handling test passed\n');
    } catch (error) {
      this.recordFailure('testErrorHandling', error);
    }
  }

  /**
   * Test para exportación de métricas
   */
  async testMetricsExport() {
    console.log('📝 Testing metrics export...');
    
    try {
      // Generar algunas métricas
      await this.meter.measureChatResponseTime(mockChatFunction, 'Export test');
      this.meter.measureMemoryUsage();
      
      const exportPath = path.join(os.tmpdir(), 'test-metrics.json');
      await this.meter.exportMetrics(exportPath);
      
      // Verificar que el archivo se creó
      const exportedData = JSON.parse(await fs.readFile(exportPath, 'utf8'));
      
      this.assert(
        exportedData.metrics,
        'Exported data should contain metrics',
        'Metrics found in export'
      );
      
      this.assert(
        exportedData.stats,
        'Exported data should contain stats',
        'Stats found in export'
      );
      
      this.assert(
        exportedData.exportedAt,
        'Exported data should contain timestamp',
        `Exported at: ${exportedData.exportedAt}`
      );
      
      // Limpiar
      await fs.unlink(exportPath);
      
      console.log('✅ Metrics export test passed\n');
    } catch (error) {
      this.recordFailure('testMetricsExport', error);
    }
  }

  /**
   * Test para toggle de monitoreo
   */
  async testMonitoringToggle() {
    console.log('📝 Testing monitoring toggle...');
    
    try {
      this.meter.clearMetrics();
      
      // Test con monitoreo desactivado
      this.meter.stopMonitoring();
      await this.meter.measureChatResponseTime(mockChatFunction, 'No monitoring');
      
      this.assert(
        this.meter.metrics.chatResponseTimes.length === 0,
        'Should not record metrics when monitoring is off',
        `Recorded ${this.meter.metrics.chatResponseTimes.length} measurements`
      );
      
      // Test con monitoreo activado
      this.meter.startMonitoring();
      await this.meter.measureChatResponseTime(mockChatFunction, 'With monitoring');
      
      this.assert(
        this.meter.metrics.chatResponseTimes.length === 1,
        'Should record metrics when monitoring is on',
        `Recorded ${this.meter.metrics.chatResponseTimes.length} measurements`
      );
      
      console.log('✅ Monitoring toggle test passed\n');
    } catch (error) {
      this.recordFailure('testMonitoringToggle', error);
    }
  }

  /**
   * Test para recomendaciones de rendimiento
   */
  async testPerformanceRecommendations() {
    console.log('📝 Testing performance recommendations...');
    
    try {
      this.meter.clearMetrics();
      this.meter.startMonitoring();
      
      // Simular rendimiento pobre
      const slowChatFunction = async (message) => {
        await new Promise(resolve => setTimeout(resolve, 200)); // > 100ms
        return `Slow response to: ${message}`;
      };
      
      await this.meter.measureChatResponseTime(slowChatFunction, 'Slow test');
      
      const stats = this.meter.getPerformanceStats();
      
      this.assert(
        stats.summary.chatPerformance !== 'Good',
        'Should detect poor chat performance',
        `Performance: ${stats.summary.chatPerformance}`
      );
      
      this.assert(
        stats.summary.recommendations.some(r => r.includes('Chat response time')),
        'Should recommend chat optimization',
        `Recommendations: ${stats.summary.recommendations.join(', ')}`
      );
      
      console.log('✅ Performance recommendations test passed\n');
    } catch (error) {
      this.recordFailure('testPerformanceRecommendations', error);
    }
  }

  /**
   * Registra una aserción
   */
  assert(condition, message, details = '') {
    const result = {
      passed: condition,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    if (!condition) {
      console.log(`❌ FAIL: ${message}`);
      if (details) console.log(`   Details: ${details}`);
    }
  }

  /**
   * Registra un fallo de test
   */
  recordFailure(testName, error) {
    console.log(`❌ FAIL: ${testName} - ${error.message}`);
    this.testResults.push({
      passed: false,
      message: `${testName} failed`,
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Imprime resumen de tests
   */
  printTestSummary() {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const failed = total - passed;
    
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.message}: ${r.details}`);
        });
    }
  }
}

// Ejecutar tests si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new PerformanceMeterTests();
  tests.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export default PerformanceMeterTests;