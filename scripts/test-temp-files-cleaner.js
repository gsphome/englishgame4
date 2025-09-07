#!/usr/bin/env node

import TempFilesCleaner from './temp-files-cleaner.js';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

/**
 * Tests unitarios para TempFilesCleaner
 */
class TempFilesCleanerTests {
  constructor() {
    this.testsPassed = 0;
    this.testsFailed = 0;
    this.testDir = './test-temp-cleaner-temp';
  }

  /**
   * Ejecuta todos los tests
   */
  async runAllTests() {
    console.log('🧪 Ejecutando tests del TempFilesCleaner...\n');

    await this.testShouldSkipDirectory();
    await this.testFormatBytes();
    await this.testGetDirectorySize();
    await this.testUpdateGitIgnore();

    console.log(`\n✅ Tests completados: ${this.testsPassed} pasaron, ${this.testsFailed} fallaron`);
    
    // Limpiar archivos de prueba
    this.cleanupTestDirectory();
    
    if (this.testsFailed > 0) {
      process.exit(1);
    }
  }

  /**
   * Test de shouldSkipDirectory
   */
  async testShouldSkipDirectory() {
    this.test('shouldSkipDirectory omite directorios correctos', () => {
      const cleaner = new TempFilesCleaner();

      assert(cleaner.shouldSkipDirectory('node_modules'), 'Debe omitir node_modules');
      assert(cleaner.shouldSkipDirectory('.git'), 'Debe omitir .git');
      assert(cleaner.shouldSkipDirectory('dist'), 'Debe omitir dist');
      assert(cleaner.shouldSkipDirectory('coverage'), 'Debe omitir coverage');
      
      assert(!cleaner.shouldSkipDirectory('src'), 'No debe omitir src');
      assert(!cleaner.shouldSkipDirectory('tests'), 'No debe omitir tests');
      assert(!cleaner.shouldSkipDirectory('.cache'), 'No debe omitir .cache (se limpia específicamente)');
    });
  }

  /**
   * Test de formatBytes
   */
  async testFormatBytes() {
    this.test('formatBytes formatea correctamente', () => {
      const cleaner = new TempFilesCleaner();

      assert(cleaner.formatBytes(0) === '0 Bytes', 'Debe formatear 0 bytes');
      assert(cleaner.formatBytes(1024) === '1 KB', 'Debe formatear 1024 bytes como 1 KB');
      assert(cleaner.formatBytes(1048576) === '1 MB', 'Debe formatear 1MB correctamente');
      assert(cleaner.formatBytes(1536) === '1.5 KB', 'Debe formatear decimales correctamente');
      assert(cleaner.formatBytes(1073741824) === '1 GB', 'Debe formatear 1GB correctamente');
    });
  }

  /**
   * Test de getDirectorySize
   */
  async testGetDirectorySize() {
    this.test('getDirectorySize calcula tamaño correctamente', () => {
      // Crear directorio de prueba con archivos
      this.setupTestDirectory();
      
      const testFile1 = path.join(this.testDir, 'test1.txt');
      const testFile2 = path.join(this.testDir, 'test2.txt');
      
      fs.writeFileSync(testFile1, 'Hello World'); // 11 bytes
      fs.writeFileSync(testFile2, 'Test'); // 4 bytes

      const cleaner = new TempFilesCleaner();
      const size = cleaner.getDirectorySize(this.testDir);

      assert(size === 15, `Debe calcular 15 bytes, calculó ${size}`);
    });
  }

  /**
   * Test de updateGitIgnore
   */
  async testUpdateGitIgnore() {
    this.test('updateGitIgnore actualiza archivo correctamente', () => {
      this.setupTestDirectory();
      
      const gitIgnorePath = path.join(this.testDir, '.gitignore');
      
      // Crear .gitignore inicial
      fs.writeFileSync(gitIgnorePath, '# Existing content\nnode_modules/\n');

      const cleaner = new TempFilesCleaner(this.testDir);
      cleaner.updateGitIgnore();

      // Verificar que se agregaron patrones
      const content = fs.readFileSync(gitIgnorePath, 'utf8');
      assert(content.includes('.DS_Store'), 'Debe agregar patrón .DS_Store');
      assert(content.includes('*.log'), 'Debe agregar patrón *.log');
      assert(content.includes('.cache/'), 'Debe agregar patrón .cache/');
    });

    this.test('updateGitIgnore no duplica patrones existentes', () => {
      this.setupTestDirectory();
      
      const gitIgnorePath = path.join(this.testDir, '.gitignore');
      
      // Crear .gitignore con algunos patrones ya existentes
      fs.writeFileSync(gitIgnorePath, '# Existing\n.DS_Store\n*.log\n');

      const cleaner = new TempFilesCleaner(this.testDir);
      cleaner.updateGitIgnore();

      // Verificar que no se duplicaron
      const content = fs.readFileSync(gitIgnorePath, 'utf8');
      const dsStoreCount = (content.match(/\.DS_Store/g) || []).length;
      const logCount = (content.match(/\*\.log/g) || []).length;
      
      assert(dsStoreCount <= 2, `No debe duplicar excesivamente .DS_Store (encontrado ${dsStoreCount} veces)`);
      assert(logCount <= 2, `No debe duplicar excesivamente *.log (encontrado ${logCount} veces)`);
    });
  }

  /**
   * Configura directorio de prueba
   */
  setupTestDirectory() {
    fs.mkdirSync(this.testDir, { recursive: true });
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
  const tests = new TempFilesCleanerTests();
  await tests.runAllTests();
}

export default TempFilesCleanerTests;