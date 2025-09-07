#!/usr/bin/env node

import KiroConfigOptimizer from './kiro-config-optimizer.js';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

/**
 * Tests unitarios para KiroConfigOptimizer
 */
class KiroConfigOptimizerTests {
  constructor() {
    this.testsPassed = 0;
    this.testsFailed = 0;
    this.testDir = './test-kiro-config-temp';
  }

  /**
   * Ejecuta todos los tests
   */
  async runAllTests() {
    console.log('🧪 Ejecutando tests del KiroConfigOptimizer...\n');

    await this.testGenerateOptimizedConfig();
    await this.testCountExclusions();
    await this.testValidateConfiguration();
    await this.testCreateBackup();

    console.log(`\n✅ Tests completados: ${this.testsPassed} pasaron, ${this.testsFailed} fallaron`);
    
    // Limpiar archivos de prueba
    this.cleanupTestDirectory();
    
    if (this.testsFailed > 0) {
      process.exit(1);
    }
  }

  /**
   * Test de generateOptimizedConfig
   */
  async testGenerateOptimizedConfig() {
    this.test('generateOptimizedConfig genera configuración válida', () => {
      const optimizer = new KiroConfigOptimizer(this.testDir);
      const config = optimizer.generateOptimizedConfig();

      // Verificar que tiene las secciones requeridas
      assert(config['files.exclude'], 'Debe tener files.exclude');
      assert(config['search.exclude'], 'Debe tener search.exclude');
      assert(config['files.watcherExclude'], 'Debe tener files.watcherExclude');

      // Verificar exclusiones importantes
      assert(config['files.exclude']['**/node_modules'], 'Debe excluir node_modules');
      assert(config['files.exclude']['**/coverage'], 'Debe excluir coverage');
      assert(config['files.exclude']['**/dist'], 'Debe excluir dist');
    });

    this.test('generateOptimizedConfig preserva configuración existente', () => {
      // Crear configuración existente
      this.setupTestDirectory();
      const existingConfigPath = path.join(this.testDir, '.kiro', 'settings.json');
      const existingConfig = {
        'files.exclude': {
          'custom-exclude': true
        },
        'customSetting': 'value'
      };
      fs.writeFileSync(existingConfigPath, JSON.stringify(existingConfig, null, 2));

      const optimizer = new KiroConfigOptimizer(this.testDir);
      const config = optimizer.generateOptimizedConfig();

      // Verificar que preserva configuraciones existentes
      assert(config['customSetting'] === 'value', 'Debe preservar configuraciones personalizadas');
      assert(config['files.exclude']['custom-exclude'], 'Debe preservar exclusiones personalizadas');
    });
  }

  /**
   * Test de countExclusions
   */
  async testCountExclusions() {
    this.test('countExclusions cuenta correctamente', () => {
      const optimizer = new KiroConfigOptimizer();
      const config = {
        'files.exclude': { 'a': true, 'b': true },
        'search.exclude': { 'c': true },
        'files.watcherExclude': { 'd': true, 'e': true, 'f': true }
      };

      const count = optimizer.countExclusions(config);
      assert(count === 6, `Debe contar 6 exclusiones, contó ${count}`);
    });
  }

  /**
   * Test de validateConfiguration
   */
  async testValidateConfiguration() {
    this.test('validateConfiguration valida configuración correcta', () => {
      this.setupTestDirectory();
      
      const validConfig = {
        'files.exclude': {
          '**/node_modules': true,
          '**/coverage': true,
          '**/dist': true
        },
        'search.exclude': {},
        'files.watcherExclude': {}
      };

      const configPath = path.join(this.testDir, '.kiro', 'settings.json');
      fs.writeFileSync(configPath, JSON.stringify(validConfig, null, 2));

      const optimizer = new KiroConfigOptimizer(this.testDir);
      const result = optimizer.validateConfiguration();

      assert(result.valid === true, 'Debe validar configuración correcta');
    });

    this.test('validateConfiguration detecta configuración inválida', () => {
      this.setupTestDirectory();
      
      const invalidConfig = {
        'files.exclude': {} // Falta exclusiones importantes
      };

      const configPath = path.join(this.testDir, '.kiro', 'settings.json');
      fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

      const optimizer = new KiroConfigOptimizer(this.testDir);
      const result = optimizer.validateConfiguration();

      assert(result.valid === false, 'Debe detectar configuración inválida');
      assert(result.error, 'Debe proporcionar mensaje de error');
    });
  }

  /**
   * Test de createBackup
   */
  async testCreateBackup() {
    this.test('createBackup crea backup correctamente', async () => {
      this.setupTestDirectory();
      
      // Crear configuración existente
      const configPath = path.join(this.testDir, '.kiro', 'settings.json');
      const originalConfig = { 'test': 'value' };
      fs.writeFileSync(configPath, JSON.stringify(originalConfig, null, 2));

      const optimizer = new KiroConfigOptimizer(this.testDir);
      await optimizer.createBackup();

      // Verificar que se creó el backup
      assert(optimizer.optimizationStats.backupCreated, 'Debe marcar backup como creado');
      assert(fs.existsSync(optimizer.backupPath), 'Debe crear archivo de backup');

      // Verificar contenido del backup
      const backupContent = JSON.parse(fs.readFileSync(optimizer.backupPath, 'utf8'));
      assert(backupContent.test === 'value', 'Backup debe contener configuración original');
    });
  }

  /**
   * Configura directorio de prueba
   */
  setupTestDirectory() {
    const kiroDir = path.join(this.testDir, '.kiro');
    fs.mkdirSync(kiroDir, { recursive: true });
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
  const tests = new KiroConfigOptimizerTests();
  await tests.runAllTests();
}

export default KiroConfigOptimizerTests;