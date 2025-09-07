#!/usr/bin/env node

/**
 * Tests for Build Directory Consolidator
 * 
 * Tests the functionality of identifying, validating, and consolidating
 * multiple build directories safely.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import BuildConsolidator from './build-consolidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BuildConsolidatorTests {
  constructor() {
    this.testDir = path.join(__dirname, '../test-workspace');
    this.passedTests = 0;
    this.totalTests = 0;
  }

  /**
   * Sets up test environment
   */
  async setup() {
    // Clean up any existing test directory
    await this.cleanup();
    
    // Create test workspace
    await fs.mkdir(this.testDir, { recursive: true });
    
    // Create mock build directories with sample files
    const buildDirs = ['dist', 'dev-dist', 'html', 'build'];
    
    for (const dir of buildDirs) {
      const dirPath = path.join(this.testDir, dir);
      await fs.mkdir(dirPath, { recursive: true });
      
      // Create sample files
      await fs.writeFile(path.join(dirPath, 'index.html'), '<html><body>Test</body></html>');
      await fs.writeFile(path.join(dirPath, 'main.js'), 'console.log("test");');
      
      // Create subdirectory with files
      const assetsDir = path.join(dirPath, 'assets');
      await fs.mkdir(assetsDir, { recursive: true });
      await fs.writeFile(path.join(assetsDir, 'style.css'), 'body { margin: 0; }');
    }
    
    // Create a package.json for the test project
    await fs.writeFile(
      path.join(this.testDir, 'package.json'),
      JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2)
    );
  }

  /**
   * Cleans up test environment
   */
  async cleanup() {
    try {
      await fs.rm(this.testDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }
  }

  /**
   * Test helper to assert conditions
   */
  assert(condition, message) {
    this.totalTests++;
    if (condition) {
      console.log(`✓ ${message}`);
      this.passedTests++;
    } else {
      console.error(`✗ ${message}`);
    }
  }

  /**
   * Test helper to check if directory exists
   */
  async directoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Test helper to count files in directory recursively
   */
  async countFiles(dirPath) {
    let count = 0;
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          count += await this.countFiles(path.join(dirPath, entry.name));
        } else {
          count++;
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
    return count;
  }

  /**
   * Test: Identify build directories
   */
  async testIdentifyBuildDirectories() {
    console.log('\n--- Testing Build Directory Identification ---');
    
    const consolidator = new BuildConsolidator(this.testDir);
    const buildDirs = await consolidator.identifyBuildDirectories();
    
    this.assert(
      buildDirs.includes('dist'),
      'Should identify dist directory'
    );
    
    this.assert(
      buildDirs.includes('dev-dist'),
      'Should identify dev-dist directory'
    );
    
    this.assert(
      buildDirs.includes('html'),
      'Should identify html directory'
    );
    
    this.assert(
      buildDirs.includes('build'),
      'Should identify build directory'
    );
    
    this.assert(
      buildDirs.length === 4,
      `Should identify exactly 4 build directories, found ${buildDirs.length}`
    );
  }

  /**
   * Test: Validate directories not in use
   */
  async testValidateDirectoriesNotInUse() {
    console.log('\n--- Testing Directory Validation ---');
    
    const consolidator = new BuildConsolidator(this.testDir);
    const buildDirs = await consolidator.identifyBuildDirectories();
    const isValid = await consolidator.validateDirectoriesNotInUse(buildDirs, { 
      ignoreSystemProcesses: true 
    });
    
    this.assert(
      isValid === true,
      'Should validate that directories are not in use (ignoring system processes)'
    );
    
    // Test strict validation
    const isStrictValid = await consolidator.validateDirectoriesNotInUse(buildDirs, { 
      ignoreSystemProcesses: false 
    });
    
    // This might fail due to system processes, but we test the functionality
    console.log(`Strict validation result: ${isStrictValid}`);
  }

  /**
   * Test: Create backup
   */
  async testCreateBackup() {
    console.log('\n--- Testing Backup Creation ---');
    
    const consolidator = new BuildConsolidator(this.testDir);
    const buildDirs = await consolidator.identifyBuildDirectories();
    const backupDir = await consolidator.createBackup(buildDirs);
    
    this.assert(
      await this.directoryExists(backupDir),
      'Should create backup directory'
    );
    
    // Check that all original directories were backed up
    for (const dir of buildDirs) {
      const backupPath = path.join(backupDir, dir);
      this.assert(
        await this.directoryExists(backupPath),
        `Should backup ${dir} directory`
      );
      
      const originalCount = await this.countFiles(path.join(this.testDir, dir));
      const backupCount = await this.countFiles(backupPath);
      
      this.assert(
        originalCount === backupCount,
        `Should backup all files from ${dir} (${originalCount} files)`
      );
    }
  }

  /**
   * Test: Dry run consolidation
   */
  async testDryRunConsolidation() {
    console.log('\n--- Testing Dry Run Consolidation ---');
    
    const consolidator = new BuildConsolidator(this.testDir);
    const result = await consolidator.consolidate({ dryRun: true });
    
    this.assert(
      result.success === true,
      'Dry run should succeed'
    );
    
    this.assert(
      result.dryRun === true,
      'Result should indicate dry run'
    );
    
    // Verify no actual changes were made
    const buildDirs = await consolidator.identifyBuildDirectories();
    this.assert(
      buildDirs.length === 4,
      'Dry run should not remove any directories'
    );
  }

  /**
   * Test: Full consolidation process
   */
  async testFullConsolidation() {
    console.log('\n--- Testing Full Consolidation ---');
    
    const consolidator = new BuildConsolidator(this.testDir);
    
    // Count files before consolidation
    const originalDirs = await consolidator.identifyBuildDirectories();
    let totalOriginalFiles = 0;
    for (const dir of originalDirs) {
      totalOriginalFiles += await this.countFiles(path.join(this.testDir, dir));
    }
    
    const result = await consolidator.consolidate({
      createBackup: true,
      removeOriginals: true
    });
    
    this.assert(
      result.success === true,
      'Consolidation should succeed'
    );
    
    this.assert(
      result.filesProcessed > 0,
      `Should process files (processed: ${result.filesProcessed})`
    );
    
    // Verify target directory exists and has files
    const targetPath = path.join(this.testDir, 'dist');
    this.assert(
      await this.directoryExists(targetPath),
      'Target directory should exist'
    );
    
    const targetFileCount = await this.countFiles(targetPath);
    this.assert(
      targetFileCount > 0,
      `Target directory should contain files (found: ${targetFileCount})`
    );
    
    // Verify original directories (except target) were removed
    const remainingDirs = await consolidator.identifyBuildDirectories();
    this.assert(
      remainingDirs.length === 1 && remainingDirs[0] === 'dist',
      'Should only have target directory remaining'
    );
    
    // Verify backup was created
    const backupExists = await this.directoryExists(path.join(this.testDir, '.build-backup'));
    this.assert(
      backupExists,
      'Should create backup directory'
    );
  }

  /**
   * Test: Handle no build directories scenario
   */
  async testNoBuildDirectories() {
    console.log('\n--- Testing No Build Directories Scenario ---');
    
    // Create a clean test directory with no build directories
    const cleanTestDir = path.join(__dirname, '../test-workspace-clean');
    await fs.mkdir(cleanTestDir, { recursive: true });
    
    try {
      const consolidator = new BuildConsolidator(cleanTestDir);
      const result = await consolidator.consolidate();
      
      this.assert(
        result.success === true,
        'Should succeed when no build directories exist'
      );
      
      this.assert(
        result.consolidated.length === 0,
        'Should report no directories consolidated'
      );
      
      this.assert(
        result.filesProcessed === 0,
        'Should process no files'
      );
    } finally {
      await fs.rm(cleanTestDir, { recursive: true, force: true });
    }
  }

  /**
   * Test: Handle file conflicts during consolidation
   */
  async testFileConflicts() {
    console.log('\n--- Testing File Conflict Handling ---');
    
    // Create conflicting files in different build directories
    await fs.writeFile(
      path.join(this.testDir, 'dist', 'conflict.js'),
      'console.log("from dist");'
    );
    
    await fs.writeFile(
      path.join(this.testDir, 'dev-dist', 'conflict.js'),
      'console.log("from dev-dist");'
    );
    
    const consolidator = new BuildConsolidator(this.testDir);
    const result = await consolidator.consolidate({
      createBackup: false,
      removeOriginals: false
    });
    
    this.assert(
      result.success === true,
      'Should handle file conflicts successfully'
    );
    
    // Check that both files exist with different names
    const targetDir = path.join(this.testDir, 'dist');
    const files = await fs.readdir(targetDir);
    const conflictFiles = files.filter(f => f.startsWith('conflict'));
    
    this.assert(
      conflictFiles.length >= 2,
      `Should preserve conflicting files with different names (found: ${conflictFiles.join(', ')})`
    );
  }

  /**
   * Test: Error handling for invalid directories
   */
  async testErrorHandling() {
    console.log('\n--- Testing Error Handling ---');
    
    // Test with non-existent project directory
    const invalidDir = path.join(__dirname, '../non-existent-dir');
    const consolidator = new BuildConsolidator(invalidDir);
    
    const buildDirs = await consolidator.identifyBuildDirectories();
    this.assert(
      buildDirs.length === 0,
      'Should handle non-existent project directory gracefully'
    );
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Build Consolidator Tests...\n');
    
    try {
      await this.setup();
      
      await this.testIdentifyBuildDirectories();
      await this.testValidateDirectoriesNotInUse();
      await this.testCreateBackup();
      await this.testDryRunConsolidation();
      
      // Reset for full consolidation test
      await this.cleanup();
      await this.setup();
      
      await this.testFullConsolidation();
      await this.testNoBuildDirectories();
      
      // Reset for conflict test
      await this.cleanup();
      await this.setup();
      
      await this.testFileConflicts();
      await this.testErrorHandling();
      
    } finally {
      await this.cleanup();
    }
    
    console.log('\n=== Test Results ===');
    console.log(`Passed: ${this.passedTests}/${this.totalTests}`);
    
    if (this.passedTests === this.totalTests) {
      console.log('🎉 All tests passed!');
      return true;
    } else {
      console.log('❌ Some tests failed!');
      return false;
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new BuildConsolidatorTests();
  tests.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export default BuildConsolidatorTests;