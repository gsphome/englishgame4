#!/usr/bin/env node

import CoverageCleaner from './coverage-cleaner.js';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

/**
 * Tests unitarios para CoverageCleaner
 */
class CoverageCleanerTests {
  constructor() {
    this.testsPassed = 0;
    this.testsFailed = 0;
    this.testDir = './test-coverage-temp';
  }

  /**
   * Ejecuta todos los tests
   */
  async runAllTests() {
    console.log('🧪 Ejecutando tests del CoverageCleaner...\n');

    await this.testShouldRemoveFile();
    await this.testFindEssentialFiles();
    await this.testFormatBytes();
    await this.testUpdateKiroIgnore();

    console.log(`\n✅ Tests completados: ${this.testsPassed} pasaron, ${this.testsFailed} fallaron`);
    
    if (this.testsFailed > 0) {
      process.exit(1);
    }
  }

  /**
   * Test de shouldRemoveFile
   */
  async testShouldRemoveFile() {
    this.test('shouldRemoveFile identifica archivos correctamente', () => {
      const cleaner = new CoverageCleaner();

      // Debe remover archivos HTML
      assert(cleaner.shouldRemoveFile('/path/to/index.html'), 'Debe remover archivos HTML');
      assert(cleaner.shouldRemoveFile('/path/to/style.css'), 'Debe remover archivos CSS');
      assert(cleaner.shouldRemoveFile('/path/to/script.js'), 'Debe remover archivos JS de reportes');

      // No debe remover archivos esenciales
      assert(!cleaner.shouldRemoveFile('/path/to/coverage-final.json'), 'No debe remover coverage-final.json');
      assert(!cleaner.shouldRemoveFile('/path/to/lcov.info'), 'No debe remover lcov.info');
      assert(!cleaner.shouldRemoveFile('/path/to/clover.xml'), 'No debe remover clover.xml');
    });
  }

  /**
   * Test de findEssentialFiles con directorio de prueba
   */
  async testFindEssentialFiles() {
    this.test('findEssentialFiles encuentra archivos esenciales', () => {
      // Crear directorio de prueba temporal
      this.setupTestDirectory();

      const cleaner = new CoverageCleaner(this.testDir);
      const essentialFiles = cleaner.findEssentialFiles();

      // Verificar que encuentra archivos esenciales
      const hasJsonFile = essentialFiles.some(f => f.includes('coverage-final.json'));
      const hasLcovFile = essentialFiles.some(f => f.includes('lcov.info'));

      assert(hasJsonFile, 'Debe encontrar coverage-final.json');
      assert(hasLcovFile, 'Debe encontrar lcov.info');

      // Limpiar directorio de prueba
      this.cleanupTestDirectory();
    });
  }

  /**
   * Test de formatBytes
   */
  async testFormatBytes() {
    this.test('formatBytes formatea correctamente', () => {
      const cleaner = new CoverageCleaner();

      assert(cleaner.formatBytes(0) === '0 Bytes', 'Debe formatear 0 bytes');
      assert(cleaner.formatBytes(1024) === '1 KB', 'Debe formatear 1024 bytes como 1 KB');
      assert(cleaner.formatBytes(1048576) === '1 MB', 'Debe formatear 1MB correctamente');
      assert(cleaner.formatBytes(1536) === '1.5 KB', 'Debe formatear decimales correctamente');
    });
  }

  /**
   * Test de updateKiroIgnore
   */
  async testUpdateKiroIgnore() {
    this.test('updateKiroIgnore actualiza archivo correctamente', () => {
      const testKiroIgnore = path.join(this.testDir, '.kiroignore');
      
      // Crear directorio de prueba
      fs.mkdirSync(this.testDir, { recursive: true });
      
      // Crear archivo .kiroignore inicial
      fs.writeFileSync(testKiroIgnore, '# Existing content\nnode_modules/\n');

      const cleaner = new CoverageCleaner(this.testDir);
      cleaner.updateKiroIgnore();

      // Verificar que se agregó el patrón
      const content = fs.readFileSync(testKiroIgnore, 'utf8');
      assert(content.includes('coverage/**/*.html'), 'Debe agregar patrón de coverage HTML');

      // Limpiar
      this.cleanupTestDirectory();
    });
  }

  /**
   * Configura directorio de prueba
   */
  setupTestDirectory() {
    // Crear estructura de prueba
    const coverageDir = path.join(this.testDir, 'coverage');
    const htmlDir = path.join(coverageDir, 'lcov-report');
    
    fs.mkdirSync(htmlDir, { recursive: true });

    // Crear archivos de prueba
    fs.writeFileSync(path.join(coverageDir, 'coverage-final.json'), '{}');
    fs.writeFileSync(path.join(coverageDir, 'lcov.info'), 'test data');
    fs.writeFileSync(path.join(htmlDir, 'index.html'), '<html></html>');
    fs.writeFileSync(path.join(htmlDir, 'style.css'), 'body {}');
  }

  /**
   * Limpia directorio de prueba
   */
  cleanupTestDirectory() {
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true, force: true });
    }
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
  const tests = new CoverageCleanerTests();
  await tests.runAllTests();
}

export default CoverageCleanerTests;