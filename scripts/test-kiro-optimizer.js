#!/usr/bin/env node

/**
 * Test suite for Kiro Optimizer
 * Tests the main optimization workflow and individual components
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import KiroOptimizer from './kiro-optimizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('KiroOptimizer', () => {
  let testDir;
  let optimizer;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(__dirname, '..', 'test-temp-' + Date.now());
    await fs.mkdir(testDir, { recursive: true });
    
    // Create basic project structure
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          build: 'vite build',
          test: 'vitest'
        }
      }, null, 2)
    );

    optimizer = new KiroOptimizer(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Could not clean up test directory: ${error.message}`);
    }
  });

  describe('System Backup', () => {
    it('should create backup of critical files', async () => {
      const result = await optimizer.createSystemBackup();
      expect(result).toBe(true);

      const backupDir = path.join(testDir, '.kiro-optimization-backup');
      const backupExists = await fs.access(backupDir).then(() => true).catch(() => false);
      expect(backupExists).toBe(true);

      const packageBackup = path.join(backupDir, 'package.json');
      const packageBackupExists = await fs.access(packageBackup).then(() => true).catch(() => false);
      expect(packageBackupExists).toBe(true);
    });
  });

  describe('Project Analysis', () => {
    it('should analyze project structure successfully', async () => {
      const result = await optimizer.executeProjectAnalysis();
      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.analysis.totalFiles).toBeGreaterThan(0);
    });
  });

  describe('Configuration Reorganization', () => {
    it('should reorganize config files when they exist', async () => {
      // Create some config files
      await fs.writeFile(path.join(testDir, 'vite.config.ts'), 'export default {}');
      await fs.writeFile(path.join(testDir, 'tailwind.config.js'), 'module.exports = {}');

      const result = await optimizer.executeConfigReorganization();
      expect(result.success).toBe(true);

      // Check if config directory was created
      const configDir = path.join(testDir, 'config');
      const configExists = await fs.access(configDir).then(() => true).catch(() => false);
      expect(configExists).toBe(true);
    });

    it('should handle case with no config files gracefully', async () => {
      const result = await optimizer.executeConfigReorganization();
      expect(result.success).toBe(true);
    });
  });

  describe('Project Validation', () => {
    it('should validate project functionality', async () => {
      const result = await optimizer.validateProjectFunctionality();
      expect(result.success).toBe(true);
      expect(result.validationResults.packageJsonValid).toBe(true);
    });

    it('should detect invalid package.json', async () => {
      // Create invalid package.json
      await fs.writeFile(path.join(testDir, 'package.json'), 'invalid json');

      const result = await optimizer.validateProjectFunctionality();
      expect(result.validationResults.packageJsonValid).toBe(false);
    });
  });

  describe('Logging', () => {
    it('should log messages to file', async () => {
      await optimizer.log('Test message');

      const logFile = path.join(testDir, '.kiro-optimization.log');
      const logExists = await fs.access(logFile).then(() => true).catch(() => false);
      expect(logExists).toBe(true);

      const logContent = await fs.readFile(logFile, 'utf8');
      expect(logContent).toContain('Test message');
    });
  });

  describe('Report Generation', () => {
    it('should generate comprehensive report', async () => {
      // Add some mock results
      optimizer.optimizationResults.totalFilesRemoved = 10;
      optimizer.optimizationResults.totalSpaceSaved = 1024 * 1024; // 1MB
      optimizer.optimizationResults.steps.push({
        name: 'Test Step',
        success: true,
        details: { test: 'value' }
      });

      const report = await optimizer.generateReport();
      expect(report).toContain('KIRO PERFORMANCE OPTIMIZATION REPORT');
      expect(report).toContain('Total files removed: 10');
      expect(report).toContain('1.00 MB');

      const reportFile = path.join(testDir, '.kiro-optimization-report.txt');
      const reportExists = await fs.access(reportFile).then(() => true).catch(() => false);
      expect(reportExists).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle rollback gracefully', async () => {
      // Create backup first
      await optimizer.createSystemBackup();

      // Simulate some changes
      await fs.writeFile(path.join(testDir, 'package.json'), 'modified content');

      const result = await optimizer.rollback();
      expect(result).toBe(true);

      // Verify original content was restored
      const packageContent = await fs.readFile(path.join(testDir, 'package.json'), 'utf8');
      const packageJson = JSON.parse(packageContent);
      expect(packageJson.name).toBe('test-project');
    });
  });

  describe('Utility Functions', () => {
    it('should format bytes correctly', () => {
      expect(optimizer.formatBytes(0)).toBe('0 Bytes');
      expect(optimizer.formatBytes(1024)).toBe('1.00 KB');
      expect(optimizer.formatBytes(1024 * 1024)).toBe('1.00 MB');
      expect(optimizer.formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
    });
  });
});

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running Kiro Optimizer tests...');
  console.log('Use: npm test or vitest to run the full test suite');
}