#!/usr/bin/env node

/**
 * Build Directory Consolidator
 * 
 * Identifies multiple build directories and consolidates them into a single directory.
 * Validates that no processes are using the directories before consolidation.
 * 
 * Requirements: 4.2, 4.4
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class BuildConsolidator {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.buildDirectories = ['dist', 'dev-dist', 'html', 'build', 'out'];
    this.targetDirectory = 'dist';
    this.backupDirectory = '.build-backup';
  }

  /**
   * Identifies existing build directories in the project
   * @returns {Promise<string[]>} Array of build directory paths
   */
  async identifyBuildDirectories() {
    const existingDirs = [];
    
    for (const dir of this.buildDirectories) {
      const dirPath = path.join(this.projectRoot, dir);
      try {
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          existingDirs.push(dir);
        }
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
    
    return existingDirs;
  }

  /**
   * Validates that no processes are using the build directories
   * @param {string[]} directories - Array of directory names to check
   * @param {Object} options - Validation options
   * @returns {Promise<boolean>} True if directories are safe to modify
   */
  async validateDirectoriesNotInUse(directories, options = {}) {
    const { ignoreSystemProcesses = false } = options;
    
    for (const dir of directories) {
      const dirPath = path.join(this.projectRoot, dir);
      
      try {
        // Check if any process has files open in these directories (Unix/macOS)
        if (process.platform !== 'win32') {
          try {
            const result = execSync(`lsof +D "${dirPath}" 2>/dev/null || true`, { 
              encoding: 'utf8',
              timeout: 5000 
            });
            
            if (result.trim()) {
              // Filter out system processes that are safe to ignore
              const lines = result.trim().split('\n').filter(line => line.trim());
              
              // Skip header line if present
              const processLines = lines.filter(line => !line.startsWith('COMMAND'));
              
              const problematicProcesses = processLines.filter(line => {
                if (!ignoreSystemProcesses) return true;
                
                // Ignore common system processes that don't prevent file operations
                const systemProcesses = ['mdworker', 'mds', 'Spotlight', 'fsck', 'fseventsd'];
                return !systemProcesses.some(proc => line.includes(proc));
              });
              
              if (problematicProcesses.length > 0) {
                console.warn(`Warning: Directory ${dir} may be in use by another process`);
                console.warn('Open files:', problematicProcesses.join('\n'));
                return false;
              } else if (processLines.length > 0 && !ignoreSystemProcesses) {
                console.warn(`Warning: Directory ${dir} has system processes accessing it (continuing anyway)`);
              }
            }
          } catch (error) {
            // lsof command failed or not available, continue with other checks
          }
        }

        // Try to create a temporary file to test write access
        const testFile = path.join(dirPath, '.consolidator-test');
        try {
          await fs.writeFile(testFile, 'test');
          await fs.unlink(testFile);
        } catch (error) {
          console.error(`Cannot write to directory ${dir}: ${error.message}`);
          return false;
        }
      } catch (error) {
        console.error(`Error validating directory ${dir}: ${error.message}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Creates a backup of existing build directories
   * @param {string[]} directories - Directories to backup
   * @returns {Promise<void>}
   */
  async createBackup(directories) {
    const backupPath = path.join(this.projectRoot, this.backupDirectory);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(backupPath, `build-backup-${timestamp}`);
    
    await fs.mkdir(backupDir, { recursive: true });
    
    for (const dir of directories) {
      const sourcePath = path.join(this.projectRoot, dir);
      const targetPath = path.join(backupDir, dir);
      
      try {
        await this.copyDirectory(sourcePath, targetPath);
        console.log(`✓ Backed up ${dir} to ${path.relative(this.projectRoot, targetPath)}`);
      } catch (error) {
        console.error(`Failed to backup ${dir}: ${error.message}`);
        throw error;
      }
    }
    
    return backupDir;
  }

  /**
   * Recursively copies a directory
   * @param {string} source - Source directory path
   * @param {string} target - Target directory path
   * @returns {Promise<void>}
   */
  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  /**
   * Consolidates multiple build directories into the target directory
   * @param {string[]} directories - Directories to consolidate
   * @returns {Promise<ConsolidationResult>}
   */
  async consolidateDirectories(directories) {
    const targetPath = path.join(this.projectRoot, this.targetDirectory);
    const consolidationResult = {
      success: false,
      consolidated: [],
      errors: [],
      targetDirectory: this.targetDirectory,
      filesProcessed: 0
    };

    // Ensure target directory exists
    await fs.mkdir(targetPath, { recursive: true });

    for (const dir of directories) {
      if (dir === this.targetDirectory) {
        continue; // Skip the target directory itself
      }

      const sourcePath = path.join(this.projectRoot, dir);
      
      try {
        const result = await this.mergeDirectoryContents(sourcePath, targetPath);
        consolidationResult.filesProcessed += result.filesProcessed;
        consolidationResult.consolidated.push({
          directory: dir,
          filesProcessed: result.filesProcessed
        });
        
        console.log(`✓ Consolidated ${dir} (${result.filesProcessed} files)`);
      } catch (error) {
        const errorMsg = `Failed to consolidate ${dir}: ${error.message}`;
        console.error(errorMsg);
        consolidationResult.errors.push(errorMsg);
      }
    }

    consolidationResult.success = consolidationResult.errors.length === 0;
    return consolidationResult;
  }

  /**
   * Merges contents of source directory into target directory
   * @param {string} source - Source directory path
   * @param {string} target - Target directory path
   * @returns {Promise<{filesProcessed: number}>}
   */
  async mergeDirectoryContents(source, target) {
    let filesProcessed = 0;
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await fs.mkdir(targetPath, { recursive: true });
        const result = await this.mergeDirectoryContents(sourcePath, targetPath);
        filesProcessed += result.filesProcessed;
      } else {
        // Handle file conflicts by adding suffix if file exists
        let finalTargetPath = targetPath;
        let counter = 1;
        
        while (await this.fileExists(finalTargetPath)) {
          const ext = path.extname(entry.name);
          const name = path.basename(entry.name, ext);
          finalTargetPath = path.join(target, `${name}-${counter}${ext}`);
          counter++;
        }
        
        await fs.copyFile(sourcePath, finalTargetPath);
        filesProcessed++;
      }
    }
    
    return { filesProcessed };
  }

  /**
   * Checks if a file exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes the original build directories after successful consolidation
   * @param {string[]} directories - Directories to remove
   * @returns {Promise<void>}
   */
  async removeOriginalDirectories(directories) {
    for (const dir of directories) {
      if (dir === this.targetDirectory) {
        continue; // Don't remove the target directory
      }

      const dirPath = path.join(this.projectRoot, dir);
      
      try {
        await fs.rm(dirPath, { recursive: true, force: true });
        console.log(`✓ Removed original directory: ${dir}`);
      } catch (error) {
        console.error(`Failed to remove ${dir}: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Generates a consolidation report
   * @param {ConsolidationResult} result - Consolidation result
   * @returns {string} Report text
   */
  generateReport(result) {
    const report = [];
    report.push('=== Build Directory Consolidation Report ===');
    report.push(`Target Directory: ${result.targetDirectory}`);
    report.push(`Total Files Processed: ${result.filesProcessed}`);
    report.push(`Status: ${result.success ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
    report.push('');
    
    if (result.consolidated.length > 0) {
      report.push('Consolidated Directories:');
      result.consolidated.forEach(item => {
        report.push(`  - ${item.directory} (${item.filesProcessed} files)`);
      });
      report.push('');
    }
    
    if (result.errors.length > 0) {
      report.push('Errors:');
      result.errors.forEach(error => {
        report.push(`  - ${error}`);
      });
    }
    
    return report.join('\n');
  }

  /**
   * Main consolidation process
   * @param {Object} options - Consolidation options
   * @returns {Promise<ConsolidationResult>}
   */
  async consolidate(options = {}) {
    const {
      dryRun = false,
      createBackup = true,
      removeOriginals = true
    } = options;

    console.log('🔍 Identifying build directories...');
    const buildDirs = await this.identifyBuildDirectories();
    
    if (buildDirs.length <= 1) {
      console.log('ℹ️  No multiple build directories found. Nothing to consolidate.');
      return {
        success: true,
        consolidated: [],
        errors: [],
        targetDirectory: this.targetDirectory,
        filesProcessed: 0
      };
    }

    console.log(`📁 Found build directories: ${buildDirs.join(', ')}`);

    if (dryRun) {
      console.log('🔍 DRY RUN - No changes will be made');
      return {
        success: true,
        consolidated: buildDirs.map(dir => ({ directory: dir, filesProcessed: 0 })),
        errors: [],
        targetDirectory: this.targetDirectory,
        filesProcessed: 0,
        dryRun: true
      };
    }

    console.log('🔒 Validating directories are not in use...');
    const isValid = await this.validateDirectoriesNotInUse(buildDirs, { 
      ignoreSystemProcesses: true 
    });
    
    if (!isValid) {
      throw new Error('Cannot proceed: One or more directories are in use');
    }

    let backupDir = null;
    if (createBackup) {
      console.log('💾 Creating backup...');
      backupDir = await this.createBackup(buildDirs);
    }

    try {
      console.log('🔄 Consolidating directories...');
      const result = await this.consolidateDirectories(buildDirs);

      if (result.success && removeOriginals) {
        console.log('🗑️  Removing original directories...');
        await this.removeOriginalDirectories(buildDirs);
      }

      console.log('\n' + this.generateReport(result));
      
      if (backupDir) {
        console.log(`\n💾 Backup created at: ${path.relative(this.projectRoot, backupDir)}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Consolidation failed:', error.message);
      
      if (backupDir) {
        console.log(`💾 Backup available at: ${path.relative(this.projectRoot, backupDir)}`);
      }
      
      throw error;
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const consolidator = new BuildConsolidator();
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const noBackup = args.includes('--no-backup');
  const keepOriginals = args.includes('--keep-originals');

  consolidator.consolidate({
    dryRun,
    createBackup: !noBackup,
    removeOriginals: !keepOriginals
  }).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

export default BuildConsolidator;