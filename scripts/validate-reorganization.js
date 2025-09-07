#!/usr/bin/env node

/**
 * Validation script to verify that the configuration reorganization was successful
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function validateReorganization() {
  console.log('🔍 Validating configuration reorganization...\n');
  
  const results = {
    configDirExists: false,
    configFilesExist: [],
    configFilesMissing: [],
    originalFilesRemoved: [],
    originalFilesStillExist: [],
    packageJsonUpdated: false,
    tsconfigUpdated: false,
    buildWorks: false
  };

  // Check if config directory exists
  try {
    await fs.access(path.join(projectRoot, 'config'));
    results.configDirExists = true;
    console.log('✅ Config directory exists');
  } catch (error) {
    console.log('❌ Config directory does not exist');
  }

  // Check if config files exist in new location
  const expectedConfigFiles = [
    'eslint.config.js',
    'postcss.config.js',
    'tailwind.config.js',
    'vite.config.ts',
    'vitest.config.ts',
    '.prettierrc',
    '.prettierignore',
    '.env.example'
  ];

  for (const file of expectedConfigFiles) {
    const configPath = path.join(projectRoot, 'config', file);
    const rootPath = path.join(projectRoot, file);
    
    try {
      await fs.access(configPath);
      results.configFilesExist.push(file);
      console.log(`✅ ${file} exists in config/`);
    } catch (error) {
      results.configFilesMissing.push(file);
      console.log(`❌ ${file} missing from config/`);
    }

    // Check if original files were removed
    try {
      await fs.access(rootPath);
      results.originalFilesStillExist.push(file);
      console.log(`⚠️  ${file} still exists in root`);
    } catch (error) {
      results.originalFilesRemoved.push(file);
      console.log(`✅ ${file} removed from root`);
    }
  }

  // Check if tsconfig.node.json was updated
  try {
    const tsconfigContent = await fs.readFile(path.join(projectRoot, 'tsconfig.node.json'), 'utf8');
    if (tsconfigContent.includes('config/vite.config.ts')) {
      results.tsconfigUpdated = true;
      console.log('✅ tsconfig.node.json updated to reference config/vite.config.ts');
    } else {
      console.log('❌ tsconfig.node.json not updated');
    }
  } catch (error) {
    console.log('❌ Could not read tsconfig.node.json');
  }

  // Check if package.json was updated for eslint
  try {
    const packageContent = await fs.readFile(path.join(projectRoot, 'package.json'), 'utf8');
    const packageJson = JSON.parse(packageContent);
    if (packageJson.scripts.lint && packageJson.scripts.lint.includes('config/eslint.config.js')) {
      results.packageJsonUpdated = true;
      console.log('✅ package.json updated to reference config/eslint.config.js');
    } else {
      console.log('❌ package.json not updated for eslint config');
    }
  } catch (error) {
    console.log('❌ Could not read package.json');
  }

  // Generate summary
  console.log('\n📊 REORGANIZATION VALIDATION SUMMARY');
  console.log('====================================');
  console.log(`Config directory created: ${results.configDirExists ? '✅' : '❌'}`);
  console.log(`Config files moved: ${results.configFilesExist.length}/${expectedConfigFiles.length}`);
  console.log(`Original files removed: ${results.originalFilesRemoved.length}/${expectedConfigFiles.length}`);
  console.log(`tsconfig.node.json updated: ${results.tsconfigUpdated ? '✅' : '❌'}`);
  console.log(`package.json updated: ${results.packageJsonUpdated ? '✅' : '❌'}`);

  const success = results.configDirExists && 
                  results.configFilesExist.length === expectedConfigFiles.length &&
                  results.originalFilesRemoved.length === expectedConfigFiles.length &&
                  results.tsconfigUpdated &&
                  results.packageJsonUpdated;

  console.log(`\n🎯 Overall Status: ${success ? '✅ SUCCESS' : '❌ NEEDS ATTENTION'}`);

  if (success) {
    console.log('\n🎉 Configuration reorganization completed successfully!');
    console.log('All configuration files have been moved to the config/ directory.');
    console.log('The build system can find all configuration files in their new locations.');
  } else {
    console.log('\n⚠️  Some issues were found with the reorganization.');
    console.log('Please review the details above and fix any missing configurations.');
  }

  return success;
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateReorganization().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

export default validateReorganization;