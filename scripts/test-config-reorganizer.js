#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ConfigReorganizer from './config-reorganizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test suite for ConfigReorganizer
 */
class ConfigReorganizerTests {
  constructor() {
    this.testDir = path.join(__dirname, 'test-config-reorganizer-temp');
    this.testResults = [];
  }

  /**
   * Setup test environment
   */
  async setup() {
    // Clean up any existing test directory
    await this.cleanup();
    
    // Create test directory structure
    await fs.mkdir(this.testDir, { recursive: true });
    
    // Create mock configuration files
    const mockConfigs = {
      'eslint.config.js': `export default [
  {
    ignores: ['dist', 'node_modules']
  }
];`,
      'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
      'tailwind.config.js': `export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};`,
      'vite.config.ts': `import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [],
});`,
      'vitest.config.ts': `import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { globals: true }
});`
    };

    // Create mock package.json
    const mockPackageJson = {
      name: 'test-project',
      scripts: {
        'build': 'vite build',
        'test': 'vitest',
        'lint': 'eslint . --config eslint.config.js'
      }
    };

    // Create mock tsconfig.node.json
    const mockTsConfigNode = {
      compilerOptions: {
        module: 'ESNext'
      },
      include: ['vite.config.ts']
    };

    // Write all mock files
    for (const [filename, content] of Object.entries(mockConfigs)) {
      await fs.writeFile(path.join(this.testDir, filename), content);
    }
    
    await fs.writeFile(
      path.join(this.testDir, 'package.json'), 
      JSON.stringify(mockPackageJson, null, 2)
    );
    
    await fs.writeFile(
      path.join(this.testDir, 'tsconfig.node.json'), 
      JSON.stringify(mockTsConfigNode, null, 2)
    );
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    try {
      await fs.rm(this.testDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }
  }

  /**
   * Run a test and record results
   */
  async runTest(testName, testFn) {
    console.log(`\n🧪 Running test: ${testName}`);
    try {
      await testFn();
      console.log(`✅ ${testName} - PASSED`);
      this.testResults.push({ name: testName, status: 'PASSED' });
    } catch (error) {
      console.error(`❌ ${testName} - FAILED: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
  }

  /**
   * Test: Identify scattered configuration files
   */
  async testIdentifyScatteredConfigs() {
    const reorganizer = new ConfigReorganizer(this.testDir);
    
    const scatteredConfigs = await reorganizer.identifyScatteredConfigs();
    
    // Should find all 5 config files
    if (scatteredConfigs.length !== 5) {
      throw new Error(`Expected 5 config files, found ${scatteredConfigs.length}`);
    }
    
    const expectedFiles = ['eslint.config.js', 'postcss.config.js', 'tailwind.config.js', 'vite.config.ts', 'vitest.config.ts'];
    const foundFiles = scatteredConfigs.map(config => config.name);
    
    for (const expectedFile of expectedFiles) {
      if (!foundFiles.includes(expectedFile)) {
        throw new Error(`Expected to find ${expectedFile} but didn't`);
      }
    }
  }

  /**
   * Test: Create config directory
   */
  async testCreateConfigDirectory() {
    const reorganizer = new ConfigReorganizer(this.testDir);
    
    await reorganizer.createConfigDirectory();
    
    // Check if directory was created
    const stats = await fs.stat(path.join(this.testDir, 'config'));
    if (!stats.isDirectory()) {
      throw new Error('Config directory was not created');
    }
  }

  /**
   * Test: Move configuration files
   */
  async testMoveConfigFiles() {
    const reorganizer = new ConfigReorganizer(this.testDir);
    
    // Create config directory
    await reorganizer.createConfigDirectory();
    
    // Get scattered configs
    const scatteredConfigs = await reorganizer.identifyScatteredConfigs();
    
    // Create backup
    await reorganizer.createBackup(scatteredConfigs);
    
    // Move files
    const movedFiles = await reorganizer.moveConfigFiles(scatteredConfigs);
    
    // Verify files were moved
    if (movedFiles.length !== 5) {
      throw new Error(`Expected to move 5 files, moved ${movedFiles.length}`);
    }
    
    // Check that files exist in config directory
    for (const movedFile of movedFiles) {
      const stats = await fs.stat(movedFile.targetPath);
      if (!stats.isFile()) {
        throw new Error(`File ${movedFile.name} was not moved to config directory`);
      }
    }
    
    // Check that original files no longer exist
    for (const movedFile of movedFiles) {
      try {
        await fs.access(movedFile.currentPath);
        throw new Error(`Original file ${movedFile.name} still exists`);
      } catch (error) {
        // This is expected - file should not exist
      }
    }
  }

  /**
   * Test: Update package.json references
   */
  async testUpdatePackageJsonReferences() {
    const reorganizer = new ConfigReorganizer(this.testDir);
    
    // Setup and move files first
    await reorganizer.createConfigDirectory();
    const scatteredConfigs = await reorganizer.identifyScatteredConfigs();
    await reorganizer.createBackup(scatteredConfigs);
    const movedFiles = await reorganizer.moveConfigFiles(scatteredConfigs);
    
    // Update package.json references
    await reorganizer.updatePackageJsonReferences(movedFiles);
    
    // Read updated package.json
    const packageJsonContent = await fs.readFile(path.join(this.testDir, 'package.json'), 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Check that lint script was updated
    if (!packageJson.scripts.lint.includes('config/eslint.config.js')) {
      throw new Error(`package.json lint script was not updated. Current: ${packageJson.scripts.lint}`);
    }
  }

  /**
   * Test: Update configuration file references
   */
  async testUpdateConfigFileReferences() {
    const reorganizer = new ConfigReorganizer(this.testDir);
    
    // Setup and move files first
    await reorganizer.createConfigDirectory();
    const scatteredConfigs = await reorganizer.identifyScatteredConfigs();
    await reorganizer.createBackup(scatteredConfigs);
    const movedFiles = await reorganizer.moveConfigFiles(scatteredConfigs);
    
    // Update config file references
    await reorganizer.updateConfigFileReferences(movedFiles);
    
    // Read updated tsconfig.node.json
    const tsconfigContent = await fs.readFile(path.join(this.testDir, 'tsconfig.node.json'), 'utf8');
    const tsconfig = JSON.parse(tsconfigContent);
    
    // Check that include was updated
    if (!tsconfig.include.includes('config/vite.config.ts')) {
      throw new Error(`tsconfig.node.json include was not updated. Current: ${JSON.stringify(tsconfig.include)}`);
    }
  }

  /**
   * Test: Rollback functionality
   */
  async testRollback() {
    const reorganizer = new ConfigReorganizer(this.testDir);
    
    // Setup and move files first
    await reorganizer.createConfigDirectory();
    const scatteredConfigs = await reorganizer.identifyScatteredConfigs();
    await reorganizer.createBackup(scatteredConfigs);
    const movedFiles = await reorganizer.moveConfigFiles(scatteredConfigs);
    
    // Verify files were moved (they should not exist in original location)
    for (const config of scatteredConfigs) {
      try {
        await fs.access(config.currentPath);
        throw new Error(`File ${config.name} should have been moved but still exists in original location`);
      } catch (error) {
        // This is expected - file should not exist in original location
      }
    }
    
    // Now rollback
    await reorganizer.rollback();
    
    // Check that original files are restored
    for (const config of scatteredConfigs) {
      const stats = await fs.stat(config.currentPath);
      if (!stats.isFile()) {
        throw new Error(`File ${config.name} was not restored during rollback`);
      }
    }
    
    // Check that files are no longer in config directory
    for (const config of scatteredConfigs) {
      try {
        await fs.access(path.join(this.testDir, 'config', config.name));
        throw new Error(`File ${config.name} should have been removed from config directory during rollback`);
      } catch (error) {
        // This is expected - file should not exist in config directory
      }
    }
  }

  /**
   * Test: Dry run functionality
   */
  async testDryRun() {
    const reorganizer = new ConfigReorganizer(this.testDir);
    
    // Run dry run
    const result = await reorganizer.reorganize({ dryRun: true });
    
    if (!result.success || !result.dryRun) {
      throw new Error('Dry run did not complete successfully');
    }
    
    // Check that no files were actually moved
    for (const configFile of reorganizer.configFiles) {
      const originalPath = path.join(this.testDir, configFile);
      try {
        await fs.access(originalPath);
        // File should still exist in original location
      } catch (error) {
        throw new Error(`Dry run moved file ${configFile} when it shouldn't have`);
      }
    }
    
    // Check that config directory was not created
    try {
      await fs.access(path.join(this.testDir, 'config'));
      throw new Error('Dry run created config directory when it shouldn\'t have');
    } catch (error) {
      // This is expected - directory should not exist
    }
  }

  /**
   * Test: Full reorganization process
   */
  async testFullReorganization() {
    const reorganizer = new ConfigReorganizer(this.testDir);
    
    // Run full reorganization
    const result = await reorganizer.reorganize();
    
    if (!result.success) {
      throw new Error(`Reorganization failed: ${result.error}`);
    }
    
    if (result.movedFiles.length !== 5) {
      throw new Error(`Expected 5 moved files, got ${result.movedFiles.length}`);
    }
    
    // Verify all files are in config directory
    for (const movedFile of result.movedFiles) {
      const stats = await fs.stat(movedFile.targetPath);
      if (!stats.isFile()) {
        throw new Error(`File ${movedFile.name} not found in config directory`);
      }
    }
    
    // Verify backup was created
    const backupStats = await fs.stat(result.backupDir);
    if (!backupStats.isDirectory()) {
      throw new Error('Backup directory was not created');
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting ConfigReorganizer Tests');
    console.log('===================================');

    await this.setup();

    await this.runTest('Identify Scattered Configs', () => this.testIdentifyScatteredConfigs());
    
    // Reset for next test
    await this.cleanup();
    await this.setup();
    await this.runTest('Create Config Directory', () => this.testCreateConfigDirectory());
    
    // Reset for next test
    await this.cleanup();
    await this.setup();
    await this.runTest('Move Config Files', () => this.testMoveConfigFiles());
    
    // Reset for next test
    await this.cleanup();
    await this.setup();
    await this.runTest('Update Package.json References', () => this.testUpdatePackageJsonReferences());
    
    // Reset for next test
    await this.cleanup();
    await this.setup();
    await this.runTest('Update Config File References', () => this.testUpdateConfigFileReferences());
    
    // Reset for next test
    await this.cleanup();
    await this.setup();
    await this.runTest('Rollback Functionality', () => this.testRollback());
    
    // Reset for next test
    await this.cleanup();
    await this.setup();
    await this.runTest('Dry Run Functionality', () => this.testDryRun());
    
    // Reset for next test
    await this.cleanup();
    await this.setup();
    await this.runTest('Full Reorganization Process', () => this.testFullReorganization());

    await this.cleanup();

    // Print test summary
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    
    const passed = this.testResults.filter(test => test.status === 'PASSED').length;
    const failed = this.testResults.filter(test => test.status === 'FAILED').length;
    
    console.log(`Total tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed tests:');
      this.testResults
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }
    
    return failed === 0;
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new ConfigReorganizerTests();
  const success = await tests.runAllTests();
  process.exit(success ? 0 : 1);
}

export default ConfigReorganizerTests;