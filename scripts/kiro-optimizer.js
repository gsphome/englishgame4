#!/usr/bin/env node

/**
 * Kiro Performance Optimizer - Main Script
 * 
 * Integrates all optimization components into a unified workflow:
 * - Project analysis
 * - File cleanup (coverage, temp files)
 * - Configuration optimization
 * - Structure reorganization
 * - Build consolidation
 * 
 * Requirements: 1.3, 3.4, 4.3, 5.4
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

// Import optimization components
import ProjectAnalyzer from './project-analyzer.js';
import CoverageCleaner from './coverage-cleaner.js';
import TempFilesCleaner from './temp-files-cleaner.js';
import KiroConfigOptimizer from './kiro-config-optimizer.js';
import ConfigReorganizer from './config-reorganizer.js';
import BuildConsolidator from './build-consolidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class KiroOptimizer {
  constructor(rootDir = projectRoot) {
    this.rootDir = rootDir;
    this.logFile = path.join(rootDir, '.kiro-optimization.log');
    this.backupDir = path.join(rootDir, '.kiro-optimization-backup');
    this.optimizationResults = {
      startTime: new Date(),
      endTime: null,
      steps: [],
      errors: [],
      totalFilesRemoved: 0,
      totalSpaceSaved: 0,
      success: false
    };
  }  /**

   * Logs messages to both console and log file
   */
  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(message);
    
    try {
      await fs.appendFile(this.logFile, logMessage + '\n');
    } catch (error) {
      console.warn(`Warning: Could not write to log file: ${error.message}`);
    }
  }

  /**
   * Creates a comprehensive backup before starting optimization
   */
  async createSystemBackup() {
    await this.log('📦 Creating system backup...');
    
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Backup critical files
      const criticalFiles = [
        'package.json',
        '.kiroignore',
        '.gitignore',
        'config/tsconfig.json',
        'config/tsconfig.node.json'
      ];
      
      for (const file of criticalFiles) {
        const filePath = path.join(this.rootDir, file);
        try {
          await fs.access(filePath);
          const backupPath = path.join(this.backupDir, file);
          await fs.copyFile(filePath, backupPath);
          await this.log(`  ✓ Backed up ${file}`);
        } catch (error) {
          // File doesn't exist, skip
        }
      }
      
      // Backup Kiro settings if they exist
      const kiroSettingsPath = path.join(this.rootDir, '.kiro', 'settings.json');
      try {
        await fs.access(kiroSettingsPath);
        const kiroBackupDir = path.join(this.backupDir, '.kiro');
        await fs.mkdir(kiroBackupDir, { recursive: true });
        await fs.copyFile(kiroSettingsPath, path.join(kiroBackupDir, 'settings.json'));
        await this.log('  ✓ Backed up Kiro settings');
      } catch (error) {
        // Settings don't exist, skip
      }
      
      await this.log('✅ System backup completed');
      return true;
    } catch (error) {
      await this.log(`❌ System backup failed: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`System backup failed: ${error.message}`);
      return false;
    }
  }  /**
   * 
Executes project analysis step
   */
  async executeProjectAnalysis() {
    await this.log('🔍 Step 1: Analyzing project structure...');
    
    try {
      const analyzer = new ProjectAnalyzer(this.rootDir);
      const analysis = analyzer.analyzeStructure();
      
      this.optimizationResults.steps.push({
        name: 'Project Analysis',
        success: true,
        details: {
          totalFiles: analysis.totalFiles,
          performanceIssues: analysis.performanceIssues.length,
          recommendations: analysis.recommendations.length
        }
      });
      
      await this.log(`  ✓ Found ${analysis.totalFiles} files`);
      await this.log(`  ✓ Identified ${analysis.performanceIssues.length} performance issues`);
      
      return { success: true, analysis };
    } catch (error) {
      await this.log(`❌ Project analysis failed: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`Project analysis failed: ${error.message}`);
      this.optimizationResults.steps.push({
        name: 'Project Analysis',
        success: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Executes coverage cleanup step
   */
  async executeCoverageCleanup() {
    await this.log('🧹 Step 2: Cleaning coverage files...');
    
    try {
      const cleaner = new CoverageCleaner(this.rootDir);
      
      // Override the confirmation to proceed automatically
      cleaner.confirmCleanup = async () => true;
      
      const stats = await cleaner.cleanCoverageFiles();
      
      this.optimizationResults.totalFilesRemoved += stats.filesRemoved;
      this.optimizationResults.totalSpaceSaved += stats.spaceSaved;
      
      this.optimizationResults.steps.push({
        name: 'Coverage Cleanup',
        success: true,
        details: {
          filesRemoved: stats.filesRemoved,
          spaceSaved: stats.spaceSaved,
          filesPreserved: stats.filesPreserved
        }
      });
      
      await this.log(`  ✓ Removed ${stats.filesRemoved} coverage files`);
      await this.log(`  ✓ Preserved ${stats.filesPreserved} essential files`);
      
      return { success: true, stats };
    } catch (error) {
      await this.log(`❌ Coverage cleanup failed: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`Coverage cleanup failed: ${error.message}`);
      this.optimizationResults.steps.push({
        name: 'Coverage Cleanup',
        success: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  } 
 /**
   * Executes temp files cleanup step
   */
  async executeTempFilesCleanup() {
    await this.log('🗑️  Step 3: Cleaning temporary files...');
    
    try {
      const cleaner = new TempFilesCleaner(this.rootDir);
      
      // Override the confirmation to proceed automatically
      cleaner.confirmCleanup = async () => true;
      
      const stats = await cleaner.cleanTempFiles();
      
      this.optimizationResults.totalFilesRemoved += 
        stats.dsStoreFiles + stats.logFiles + stats.cacheDirectories + stats.tempFiles;
      this.optimizationResults.totalSpaceSaved += stats.totalSpaceSaved;
      
      this.optimizationResults.steps.push({
        name: 'Temp Files Cleanup',
        success: true,
        details: {
          dsStoreFiles: stats.dsStoreFiles,
          logFiles: stats.logFiles,
          cacheDirectories: stats.cacheDirectories,
          tempFiles: stats.tempFiles,
          totalSpaceSaved: stats.totalSpaceSaved
        }
      });
      
      await this.log(`  ✓ Removed ${stats.dsStoreFiles} .DS_Store files`);
      await this.log(`  ✓ Removed ${stats.logFiles} log files`);
      await this.log(`  ✓ Removed ${stats.cacheDirectories} cache directories`);
      
      return { success: true, stats };
    } catch (error) {
      await this.log(`❌ Temp files cleanup failed: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`Temp files cleanup failed: ${error.message}`);
      this.optimizationResults.steps.push({
        name: 'Temp Files Cleanup',
        success: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Executes Kiro configuration optimization step
   */
  async executeKiroConfigOptimization() {
    await this.log('⚙️  Step 4: Optimizing Kiro configurations...');
    
    try {
      const optimizer = new KiroConfigOptimizer(this.rootDir);
      const stats = await optimizer.optimizeKiroSettings();
      
      this.optimizationResults.steps.push({
        name: 'Kiro Config Optimization',
        success: stats.settingsUpdated,
        details: {
          settingsUpdated: stats.settingsUpdated,
          backupCreated: stats.backupCreated,
          exclusionsAdded: stats.exclusionsAdded
        }
      });
      
      await this.log(`  ✓ Updated Kiro settings with ${stats.exclusionsAdded} exclusions`);
      if (stats.backupCreated) {
        await this.log('  ✓ Created backup of existing settings');
      }
      
      return { success: true, stats };
    } catch (error) {
      await this.log(`❌ Kiro config optimization failed: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`Kiro config optimization failed: ${error.message}`);
      this.optimizationResults.steps.push({
        name: 'Kiro Config Optimization',
        success: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  } 
 /**
   * Executes configuration reorganization step
   */
  async executeConfigReorganization() {
    await this.log('📁 Step 5: Reorganizing configuration files...');
    
    try {
      const reorganizer = new ConfigReorganizer(this.rootDir);
      const result = await reorganizer.reorganize({ dryRun: false });
      
      this.optimizationResults.steps.push({
        name: 'Config Reorganization',
        success: result.success,
        details: {
          movedFiles: result.movedFiles?.length || 0,
          backupCreated: !!result.backupDir
        }
      });
      
      if (result.success) {
        await this.log(`  ✓ Moved ${result.movedFiles?.length || 0} configuration files to config/`);
        if (result.backupDir) {
          await this.log(`  ✓ Created backup at ${path.relative(this.rootDir, result.backupDir)}`);
        }
      }
      
      return { success: result.success, result };
    } catch (error) {
      await this.log(`❌ Config reorganization failed: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`Config reorganization failed: ${error.message}`);
      this.optimizationResults.steps.push({
        name: 'Config Reorganization',
        success: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Executes build consolidation step
   */
  async executeBuildConsolidation() {
    await this.log('🔄 Step 6: Consolidating build directories...');
    
    try {
      const consolidator = new BuildConsolidator(this.rootDir);
      const result = await consolidator.consolidate({
        dryRun: false,
        createBackup: true,
        removeOriginals: true
      });
      
      this.optimizationResults.steps.push({
        name: 'Build Consolidation',
        success: result.success,
        details: {
          consolidated: result.consolidated.length,
          filesProcessed: result.filesProcessed,
          targetDirectory: result.targetDirectory
        }
      });
      
      if (result.consolidated.length > 0) {
        await this.log(`  ✓ Consolidated ${result.consolidated.length} build directories`);
        await this.log(`  ✓ Processed ${result.filesProcessed} files`);
      } else {
        await this.log('  ℹ️  No build directories to consolidate');
      }
      
      return { success: true, result };
    } catch (error) {
      await this.log(`❌ Build consolidation failed: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`Build consolidation failed: ${error.message}`);
      this.optimizationResults.steps.push({
        name: 'Build Consolidation',
        success: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }  /**

   * Validates that the project still functions after optimization
   */
  async validateProjectFunctionality() {
    await this.log('✅ Step 7: Validating project functionality...');
    
    try {
      const validationResults = {
        packageJsonValid: false,
        configFilesAccessible: false,
        buildScriptsWork: false,
        kiroSettingsValid: false
      };
      
      // Check package.json is valid
      try {
        const packageJsonPath = path.join(this.rootDir, 'package.json');
        const packageContent = await fs.readFile(packageJsonPath, 'utf8');
        JSON.parse(packageContent);
        validationResults.packageJsonValid = true;
        await this.log('  ✓ package.json is valid');
      } catch (error) {
        await this.log(`  ❌ package.json validation failed: ${error.message}`, 'error');
      }
      
      // Check config files are accessible
      try {
        const configDir = path.join(this.rootDir, 'config');
        const configExists = await fs.access(configDir).then(() => true).catch(() => false);
        
        if (configExists) {
          const configFiles = await fs.readdir(configDir);
          validationResults.configFilesAccessible = configFiles.length > 0;
          await this.log(`  ✓ Config directory contains ${configFiles.length} files`);
        } else {
          validationResults.configFilesAccessible = true; // No config dir is also valid
          await this.log('  ✓ No config directory (original structure maintained)');
        }
      } catch (error) {
        await this.log(`  ❌ Config files validation failed: ${error.message}`, 'error');
      }
      
      // Check Kiro settings are valid
      try {
        const kiroSettingsPath = path.join(this.rootDir, '.kiro', 'settings.json');
        const settingsExist = await fs.access(kiroSettingsPath).then(() => true).catch(() => false);
        
        if (settingsExist) {
          const settingsContent = await fs.readFile(kiroSettingsPath, 'utf8');
          JSON.parse(settingsContent);
          validationResults.kiroSettingsValid = true;
          await this.log('  ✓ Kiro settings are valid JSON');
        } else {
          validationResults.kiroSettingsValid = true; // No settings is also valid
          await this.log('  ✓ No Kiro settings file (using defaults)');
        }
      } catch (error) {
        await this.log(`  ❌ Kiro settings validation failed: ${error.message}`, 'error');
      }
      
      const allValid = Object.values(validationResults).every(result => result === true);
      
      this.optimizationResults.steps.push({
        name: 'Project Validation',
        success: allValid,
        details: validationResults
      });
      
      if (allValid) {
        await this.log('  ✅ All validations passed');
      } else {
        await this.log('  ⚠️  Some validations failed - check details above');
      }
      
      return { success: allValid, validationResults };
    } catch (error) {
      await this.log(`❌ Project validation failed: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`Project validation failed: ${error.message}`);
      this.optimizationResults.steps.push({
        name: 'Project Validation',
        success: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }  /*
*
   * Handles rollback in case of errors
   */
  async rollback() {
    await this.log('🔄 Initiating rollback...');
    
    try {
      // Restore critical files from backup
      const backupFiles = await fs.readdir(this.backupDir);
      
      for (const file of backupFiles) {
        if (file === '.kiro') {
          // Restore Kiro settings
          const kiroBackupDir = path.join(this.backupDir, '.kiro');
          const kiroDir = path.join(this.rootDir, '.kiro');
          
          try {
            await fs.mkdir(kiroDir, { recursive: true });
            const settingsBackup = path.join(kiroBackupDir, 'settings.json');
            const settingsTarget = path.join(kiroDir, 'settings.json');
            await fs.copyFile(settingsBackup, settingsTarget);
            await this.log('  ✓ Restored Kiro settings');
          } catch (error) {
            await this.log(`  ⚠️  Could not restore Kiro settings: ${error.message}`);
          }
        } else {
          // Restore other critical files
          const backupPath = path.join(this.backupDir, file);
          const targetPath = path.join(this.rootDir, file);
          
          try {
            await fs.copyFile(backupPath, targetPath);
            await this.log(`  ✓ Restored ${file}`);
          } catch (error) {
            await this.log(`  ⚠️  Could not restore ${file}: ${error.message}`);
          }
        }
      }
      
      await this.log('✅ Rollback completed');
      return true;
    } catch (error) {
      await this.log(`❌ Rollback failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Generates comprehensive optimization report
   */
  async generateReport() {
    this.optimizationResults.endTime = new Date();
    const duration = this.optimizationResults.endTime - this.optimizationResults.startTime;
    
    const report = [];
    report.push('');
    report.push('🎉 KIRO PERFORMANCE OPTIMIZATION REPORT');
    report.push('=====================================');
    report.push('');
    report.push(`📅 Started: ${this.optimizationResults.startTime.toLocaleString()}`);
    report.push(`📅 Completed: ${this.optimizationResults.endTime.toLocaleString()}`);
    report.push(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
    report.push(`✅ Success: ${this.optimizationResults.success ? 'Yes' : 'No'}`);
    report.push('');
    
    // Summary statistics
    report.push('📊 SUMMARY STATISTICS');
    report.push('--------------------');
    report.push(`🗑️  Total files removed: ${this.optimizationResults.totalFilesRemoved.toLocaleString()}`);
    report.push(`💾 Total space saved: ${this.formatBytes(this.optimizationResults.totalSpaceSaved)}`);
    report.push(`🔧 Steps completed: ${this.optimizationResults.steps.filter(s => s.success).length}/${this.optimizationResults.steps.length}`);
    report.push(`❌ Errors encountered: ${this.optimizationResults.errors.length}`);
    report.push('');
    
    // Step details
    report.push('📋 STEP DETAILS');
    report.push('---------------');
    for (const step of this.optimizationResults.steps) {
      const status = step.success ? '✅' : '❌';
      report.push(`${status} ${step.name}`);
      
      if (step.details) {
        for (const [key, value] of Object.entries(step.details)) {
          report.push(`   ${key}: ${value}`);
        }
      }
      
      if (step.error) {
        report.push(`   Error: ${step.error}`);
      }
      report.push('');
    }
    
    // Errors
    if (this.optimizationResults.errors.length > 0) {
      report.push('⚠️  ERRORS ENCOUNTERED');
      report.push('---------------------');
      for (const error of this.optimizationResults.errors) {
        report.push(`• ${error}`);
      }
      report.push('');
    }
    
    // Recommendations
    report.push('💡 NEXT STEPS');
    report.push('-------------');
    report.push('1. Restart Kiro to apply all configuration changes');
    report.push('2. Test that all build and development commands work correctly');
    report.push('3. Monitor Kiro performance during normal development');
    report.push('4. Remove backup directories if everything works correctly');
    report.push('');
    
    if (this.optimizationResults.success) {
      report.push('🎊 Optimization completed successfully!');
      report.push('Your Kiro workspace should now be significantly more responsive.');
    } else {
      report.push('⚠️  Optimization completed with some issues.');
      report.push('Please review the errors above and consider running individual');
      report.push('optimization steps manually if needed.');
    }
    
    const reportText = report.join('\n');
    
    // Write report to file
    const reportPath = path.join(this.rootDir, '.kiro-optimization-report.txt');
    await fs.writeFile(reportPath, reportText);
    
    // Display report
    console.log(reportText);
    
    await this.log(`📄 Full report saved to: ${path.relative(this.rootDir, reportPath)}`);
    
    return reportText;
  }  /**
   
* Formats bytes in human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Prompts user for confirmation
   */
  async promptUser(question) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.toLowerCase().trim());
      });
    });
  }

  /**
   * Main optimization workflow
   */
  async optimize(options = {}) {
    const {
      skipConfirmation = false,
      skipBackup = false,
      continueOnError = false
    } = options;

    try {
      await this.log('🚀 Starting Kiro Performance Optimization...');
      await this.log(`📁 Project root: ${this.rootDir}`);
      
      // User confirmation
      if (!skipConfirmation) {
        const answer = await this.promptUser(
          '\n⚠️  This will modify your project structure and configurations.\n' +
          'Make sure you have committed your changes to git.\n' +
          'Continue? (y/N): '
        );
        
        if (answer !== 'y' && answer !== 'yes') {
          await this.log('❌ Optimization cancelled by user');
          return { success: false, cancelled: true };
        }
      }
      
      // Create system backup
      if (!skipBackup) {
        const backupSuccess = await this.createSystemBackup();
        if (!backupSuccess && !continueOnError) {
          await this.log('❌ Optimization aborted due to backup failure');
          return { success: false, error: 'Backup failed' };
        }
      }
      
      // Execute optimization steps
      const steps = [
        () => this.executeProjectAnalysis(),
        () => this.executeCoverageCleanup(),
        () => this.executeTempFilesCleanup(),
        () => this.executeKiroConfigOptimization(),
        () => this.executeConfigReorganization(),
        () => this.executeBuildConsolidation(),
        () => this.validateProjectFunctionality()
      ];
      
      let allStepsSuccessful = true;
      
      for (const step of steps) {
        const result = await step();
        
        if (!result.success) {
          allStepsSuccessful = false;
          
          if (!continueOnError) {
            await this.log('❌ Optimization failed, initiating rollback...');
            await this.rollback();
            break;
          } else {
            await this.log('⚠️  Step failed but continuing with remaining steps...');
          }
        }
      }
      
      this.optimizationResults.success = allStepsSuccessful;
      
      // Generate final report
      await this.generateReport();
      
      return {
        success: this.optimizationResults.success,
        results: this.optimizationResults
      };
      
    } catch (error) {
      await this.log(`❌ Unexpected error during optimization: ${error.message}`, 'error');
      this.optimizationResults.errors.push(`Unexpected error: ${error.message}`);
      this.optimizationResults.success = false;
      
      // Attempt rollback
      await this.rollback();
      
      await this.generateReport();
      
      return {
        success: false,
        error: error.message,
        results: this.optimizationResults
      };
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const skipConfirmation = args.includes('--yes') || args.includes('-y');
  const skipBackup = args.includes('--no-backup');
  const continueOnError = args.includes('--continue-on-error');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Kiro Performance Optimizer

Usage: node kiro-optimizer.js [options]

Options:
  --yes, -y              Skip confirmation prompts
  --no-backup           Skip creating system backup
  --continue-on-error   Continue optimization even if steps fail
  --help, -h            Show this help message

This script will:
1. Analyze your project structure
2. Clean coverage and temporary files
3. Optimize Kiro configurations
4. Reorganize configuration files to config/ directory
5. Consolidate build directories
6. Validate project functionality

A backup will be created before making changes (unless --no-backup is used).
    `);
    process.exit(0);
  }

  const optimizer = new KiroOptimizer();
  
  optimizer.optimize({
    skipConfirmation,
    skipBackup,
    continueOnError
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

export default KiroOptimizer;