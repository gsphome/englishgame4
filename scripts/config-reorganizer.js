#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Configuration file reorganizer
 * Identifies scattered configuration files and reorganizes them into a config/ directory
 */
class ConfigReorganizer {
  constructor(rootDir = projectRoot) {
    this.rootDir = rootDir;
    this.configFiles = [
      'eslint.config.js',
      'postcss.config.js', 
      'tailwind.config.js',
      'vite.config.ts',
      'vitest.config.ts',
      '.prettierrc',
      '.prettierignore',
      '.env.example'
    ];
    
    this.configDir = path.join(this.rootDir, 'config');
    this.packageJsonPath = path.join(this.rootDir, 'package.json');
    this.backupDir = path.join(this.rootDir, '.config-backup');
  }

  /**
   * Identify scattered configuration files in the project root
   */
  async identifyScatteredConfigs() {
    const scatteredConfigs = [];
    
    for (const configFile of this.configFiles) {
      const filePath = path.join(this.rootDir, configFile);
      try {
        await fs.access(filePath);
        scatteredConfigs.push({
          name: configFile,
          currentPath: filePath,
          targetPath: path.join(this.configDir, configFile)
        });
      } catch (error) {
        // File doesn't exist, skip
      }
    }
    
    return scatteredConfigs;
  }

  /**
   * Create config directory if it doesn't exist
   */
  async createConfigDirectory() {
    try {
      await fs.access(this.configDir);
      console.log('✓ Config directory already exists');
    } catch (error) {
      await fs.mkdir(this.configDir, { recursive: true });
      console.log('✓ Created config/ directory');
    }
  }

  /**
   * Create backup of current configuration files
   */
  async createBackup(scatteredConfigs) {
    if (scatteredConfigs.length === 0) {
      return;
    }

    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      for (const config of scatteredConfigs) {
        const backupPath = path.join(this.backupDir, config.name);
        await fs.copyFile(config.currentPath, backupPath);
      }
      
      console.log(`✓ Created backup in ${this.backupDir}`);
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Move configuration files to config directory
   */
  async moveConfigFiles(scatteredConfigs) {
    const movedFiles = [];
    
    for (const config of scatteredConfigs) {
      try {
        await fs.rename(config.currentPath, config.targetPath);
        movedFiles.push(config);
        console.log(`✓ Moved ${config.name} to config/`);
      } catch (error) {
        console.error(`✗ Failed to move ${config.name}: ${error.message}`);
      }
    }
    
    return movedFiles;
  }

  /**
   * Update package.json references to moved configuration files
   */
  async updatePackageJsonReferences(movedFiles) {
    try {
      const packageJsonContent = await fs.readFile(this.packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      let updated = false;

      // Update script references
      if (packageJson.scripts) {
        for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts)) {
          let updatedCommand = scriptCommand;
          
          // Update references to moved config files
          for (const config of movedFiles) {
            const configName = config.name;
            const configPath = `config/${configName}`;
            
            // Replace direct references to config files with various patterns
            const patterns = [
              // Direct file reference
              new RegExp(`\\b${configName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
              // With --config flag
              new RegExp(`--config\\s+${configName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
              // With -c flag
              new RegExp(`-c\\s+${configName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
            ];
            
            for (const pattern of patterns) {
              if (pattern.test(updatedCommand)) {
                if (pattern.source.includes('--config') || pattern.source.includes('-c')) {
                  updatedCommand = updatedCommand.replace(pattern, (match) => 
                    match.replace(configName, configPath)
                  );
                } else {
                  updatedCommand = updatedCommand.replace(pattern, configPath);
                }
              }
            }
          }
          
          if (updatedCommand !== scriptCommand) {
            packageJson.scripts[scriptName] = updatedCommand;
            updated = true;
            console.log(`✓ Updated script "${scriptName}": ${scriptCommand} → ${updatedCommand}`);
          }
        }
      }

      // Check for other potential references in package.json
      const packageJsonStr = JSON.stringify(packageJson, null, 2);
      for (const config of movedFiles) {
        const configName = config.name;
        if (packageJsonStr.includes(`"${configName}"`) && !packageJsonStr.includes(`"config/${configName}"`)) {
          console.log(`⚠ Manual review needed: Found reference to ${configName} in package.json`);
        }
      }

      if (updated) {
        await fs.writeFile(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log('✓ Updated package.json references');
      } else {
        console.log('✓ No package.json updates needed');
      }

    } catch (error) {
      console.error(`✗ Failed to update package.json: ${error.message}`);
    }
  }

  /**
   * Update configuration files that reference other config files
   */
  async updateConfigFileReferences(movedFiles) {
    // Update tsconfig.node.json to reference the moved vite.config.ts
    const tsconfigNodePath = path.join(this.rootDir, 'tsconfig.node.json');
    
    try {
      const tsconfigContent = await fs.readFile(tsconfigNodePath, 'utf8');
      const tsconfig = JSON.parse(tsconfigContent);
      let updated = false;
      
      if (tsconfig.include && Array.isArray(tsconfig.include)) {
        const originalInclude = [...tsconfig.include];
        tsconfig.include = tsconfig.include.map(include => {
          for (const config of movedFiles) {
            if (include === config.name) {
              return `config/${config.name}`;
            }
          }
          return include;
        });
        
        if (JSON.stringify(originalInclude) !== JSON.stringify(tsconfig.include)) {
          updated = true;
        }
      }
      
      if (updated) {
        await fs.writeFile(tsconfigNodePath, JSON.stringify(tsconfig, null, 2) + '\n');
        console.log('✓ Updated tsconfig.node.json references');
      } else {
        console.log('✓ No tsconfig.node.json updates needed');
      }
    } catch (error) {
      console.log(`⚠ Could not update tsconfig.node.json references: ${error.message}`);
    }
  }

  /**
   * Generate summary report
   */
  generateReport(scatteredConfigs, movedFiles) {
    console.log('\n📊 Configuration Reorganization Report');
    console.log('=====================================');
    console.log(`Total config files found: ${scatteredConfigs.length}`);
    console.log(`Successfully moved: ${movedFiles.length}`);
    console.log(`Failed to move: ${scatteredConfigs.length - movedFiles.length}`);
    
    if (movedFiles.length > 0) {
      console.log('\n✅ Moved files:');
      movedFiles.forEach(file => {
        console.log(`  • ${file.name} → config/${file.name}`);
      });
    }
    
    const failedFiles = scatteredConfigs.filter(config => 
      !movedFiles.some(moved => moved.name === config.name)
    );
    
    if (failedFiles.length > 0) {
      console.log('\n❌ Failed to move:');
      failedFiles.forEach(file => {
        console.log(`  • ${file.name}`);
      });
    }

    console.log('\n📝 Next steps:');
    console.log('  1. Test that all build/dev commands still work');
    console.log('  2. Update any IDE/editor configurations');
    console.log('  3. Update documentation references');
    console.log(`  4. Remove backup directory: ${this.backupDir}`);
  }

  /**
   * Rollback changes if something goes wrong
   */
  async rollback() {
    try {
      const backupFiles = await fs.readdir(this.backupDir);
      
      for (const file of backupFiles) {
        const backupPath = path.join(this.backupDir, file);
        const originalPath = path.join(this.rootDir, file);
        const configPath = path.join(this.configDir, file);
        
        // Remove from config directory if it exists
        try {
          await fs.unlink(configPath);
        } catch (error) {
          // File might not exist, continue
        }
        
        // Restore from backup
        await fs.copyFile(backupPath, originalPath);
        console.log(`✓ Restored ${file}`);
      }
      
      console.log('✓ Rollback completed successfully');
    } catch (error) {
      console.error(`✗ Rollback failed: ${error.message}`);
    }
  }

  /**
   * Main reorganization process
   */
  async reorganize(options = {}) {
    const { dryRun = false } = options;
    
    console.log('🔧 Configuration File Reorganizer');
    console.log('=================================\n');
    
    try {
      // Step 1: Identify scattered configuration files
      console.log('1. Identifying scattered configuration files...');
      const scatteredConfigs = await this.identifyScatteredConfigs();
      
      if (scatteredConfigs.length === 0) {
        console.log('✓ No scattered configuration files found');
        return { success: true, movedFiles: [] };
      }
      
      console.log(`Found ${scatteredConfigs.length} configuration files to reorganize:`);
      scatteredConfigs.forEach(config => {
        console.log(`  • ${config.name}`);
      });
      
      if (dryRun) {
        console.log('\n🔍 DRY RUN - No changes will be made');
        return { success: true, movedFiles: [], dryRun: true };
      }
      
      // Step 2: Create config directory
      console.log('\n2. Creating config directory...');
      await this.createConfigDirectory();
      
      // Step 3: Create backup
      console.log('\n3. Creating backup...');
      await this.createBackup(scatteredConfigs);
      
      // Step 4: Move configuration files
      console.log('\n4. Moving configuration files...');
      const movedFiles = await this.moveConfigFiles(scatteredConfigs);
      
      // Step 5: Update package.json references
      console.log('\n5. Updating package.json references...');
      await this.updatePackageJsonReferences(movedFiles);
      
      // Step 6: Update other config file references
      console.log('\n6. Updating configuration file references...');
      await this.updateConfigFileReferences(movedFiles);
      
      // Step 7: Generate report
      this.generateReport(scatteredConfigs, movedFiles);
      
      return { 
        success: true, 
        movedFiles,
        scatteredConfigs,
        backupDir: this.backupDir
      };
      
    } catch (error) {
      console.error(`\n❌ Reorganization failed: ${error.message}`);
      console.log('\n🔄 Attempting rollback...');
      await this.rollback();
      return { success: false, error: error.message };
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rollback = args.includes('--rollback');
  
  const reorganizer = new ConfigReorganizer();
  
  if (rollback) {
    console.log('🔄 Rolling back configuration changes...');
    await reorganizer.rollback();
  } else {
    await reorganizer.reorganize({ dryRun });
  }
}

export default ConfigReorganizer;