#!/usr/bin/env node

import ProjectAnalyzer from './project-analyzer.js';
import assert from 'assert';

/**
 * Tests unitarios para ProjectAnalyzer
 */
class ProjectAnalyzerTests {
  constructor() {
    this.testsPassed = 0;
    this.testsFailed = 0;
  }

  /**
   * Ejecuta todos los tests
   */
  runAllTests() {
    console.log('🧪 Ejecutando tests del ProjectAnalyzer...\n');

    this.testAnalyzeStructure();
    this.testIdentifyPerformanceIssues();
    this.testCalculateOptimizationPotential();
    this.testShouldSkipDirectory();
    this.testParseSize();

    console.log(`\n✅ Tests completados: ${this.testsPassed} pasaron, ${this.testsFailed} fallaron`);
    
    if (this.testsFailed > 0) {
      process.exit(1);
    }
  }

  /**
   * Test del análisis de estructura
   */
  testAnalyzeStructure() {
    this.test('analyzeStructure devuelve objeto con propiedades requeridas', () => {
      const analyzer = new ProjectAnalyzer();
      const result = analyzer.analyzeStructure();

      assert(typeof result === 'object', 'Debe devolver un objeto');
      assert(typeof result.totalFiles === 'number', 'totalFiles debe ser número');
      assert(typeof result.filesByType === 'object', 'filesByType debe ser objeto');
      assert(typeof result.directorySize === 'object', 'directorySize debe ser objeto');
      assert(Array.isArray(result.performanceIssues), 'performanceIssues debe ser array');
      assert(Array.isArray(result.recommendations), 'recommendations debe ser array');
    });
  }

  /**
   * Test de identificación de problemas
   */
  testIdentifyPerformanceIssues() {
    this.test('identifyPerformanceIssues detecta archivos excesivos', () => {
      const analyzer = new ProjectAnalyzer();
      analyzer.analysis.totalFiles = 15000; // Simular muchos archivos
      analyzer.identifyPerformanceIssues();

      const fileCountIssue = analyzer.analysis.performanceIssues
        .find(issue => issue.type === 'file_count');
      
      assert(fileCountIssue, 'Debe detectar problema de cantidad de archivos');
      assert(fileCountIssue.severity === 'high', 'Debe ser severidad alta');
    });

    this.test('identifyPerformanceIssues detecta múltiples directorios build', () => {
      const analyzer = new ProjectAnalyzer();
      analyzer.analysis.directorySize = {
        'dist': '10M',
        'dev-dist': '8M',
        'html': '5M'
      };
      analyzer.identifyPerformanceIssues();

      const structureIssue = analyzer.analysis.performanceIssues
        .find(issue => issue.type === 'structure' && issue.description.includes('build'));
      
      assert(structureIssue, 'Debe detectar múltiples directorios de build');
    });
  }

  /**
   * Test del cálculo de potencial de optimización
   */
  testCalculateOptimizationPotential() {
    this.test('calculateOptimizationPotential calcula correctamente', () => {
      const analyzer = new ProjectAnalyzer();
      analyzer.analysis.performanceIssues = [
        { severity: 'high', estimatedImpact: 40 },
        { severity: 'medium', estimatedImpact: 25 },
        { severity: 'low', estimatedImpact: 10 }
      ];

      const result = analyzer.calculateOptimizationPotential();

      assert(result.estimatedImprovement === 75, 'Debe sumar impactos correctamente');
      assert(result.criticalIssues === 1, 'Debe contar problemas críticos');
      assert(result.mediumIssues === 1, 'Debe contar problemas medios');
      assert(result.lowIssues === 1, 'Debe contar problemas bajos');
    });

    this.test('calculateOptimizationPotential limita mejora máxima', () => {
      const analyzer = new ProjectAnalyzer();
      analyzer.analysis.performanceIssues = [
        { severity: 'high', estimatedImpact: 90 },
        { severity: 'high', estimatedImpact: 50 }
      ];

      const result = analyzer.calculateOptimizationPotential();

      assert(result.estimatedImprovement === 80, 'Debe limitar mejora a 80%');
    });
  }

  /**
   * Test de shouldSkipDirectory
   */
  testShouldSkipDirectory() {
    this.test('shouldSkipDirectory omite directorios correctos', () => {
      const analyzer = new ProjectAnalyzer();

      assert(analyzer.shouldSkipDirectory('node_modules'), 'Debe omitir node_modules');
      assert(analyzer.shouldSkipDirectory('.git'), 'Debe omitir .git');
      assert(analyzer.shouldSkipDirectory('coverage'), 'Debe omitir coverage');
      assert(!analyzer.shouldSkipDirectory('src'), 'No debe omitir src');
      assert(!analyzer.shouldSkipDirectory('tests'), 'No debe omitir tests');
    });
  }

  /**
   * Test de parseSize
   */
  testParseSize() {
    this.test('parseSize convierte tamaños correctamente', () => {
      const analyzer = new ProjectAnalyzer();

      assert(analyzer.parseSize('1M') === 1, 'Debe convertir 1M a 1');
      assert(Math.abs(analyzer.parseSize('500K') - 0.48828125) < 0.01, 'Debe convertir 500K aproximadamente a 0.49');
      assert(analyzer.parseSize('2G') === 2048, 'Debe convertir 2G a 2048');
      assert(analyzer.parseSize('unknown') === 0, 'Debe manejar unknown');
      assert(analyzer.parseSize('') === 0, 'Debe manejar string vacío');
    });
  }

  /**
   * Ejecuta un test individual
   */
  test(description, testFn) {
    try {
      testFn();
      console.log(`✅ ${description}`);
      this.testsPassed++;
    } catch (error) {
      console.log(`❌ ${description}`);
      console.log(`   Error: ${error.message}`);
      this.testsFailed++;
    }
  }
}

// Ejecutar tests si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new ProjectAnalyzerTests();
  tests.runAllTests();
}

export default ProjectAnalyzerTests;