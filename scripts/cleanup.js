#!/usr/bin/env node

/**
 * Cleanup script to remove unused code and optimize the codebase
 * This script should be run periodically to maintain code quality
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  srcDir: './src',
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  excludeDirs: ['node_modules', 'dist', '.git'],
  patterns: {
    // Patterns to detect unused code
    unusedImports: /^import\s+.*\s+from\s+['"][^'"]+['"];\s*$/gm,
    todoComments: /\/\/\s*TODO:?.*$/gm,
    fixmeComments: /\/\/\s*FIXME:?.*$/gm,
    debugLogs: /console\.(log|debug)\([^)]*\);?\s*$/gm,
    emptyLines: /^\s*\n/gm,
    trailingSpaces: /[ \t]+$/gm,
  }
};

class CodeCleanup {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      issuesFound: 0,
      issuesFixed: 0,
    };
  }

  /**
   * Main cleanup function
   */
  async cleanup() {
    console.log('🧹 Starting code cleanup...\n');
    
    try {
      await this.processDirectory(config.srcDir);
      this.printSummary();
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Process a directory recursively
   */
  async processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!config.excludeDirs.includes(entry.name)) {
          await this.processDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (config.extensions.includes(ext)) {
          await this.processFile(fullPath);
        }
      }
    }
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modifiedContent = content;
      let fileIssues = 0;

      // Apply cleanup patterns
      for (const [patternName, pattern] of Object.entries(config.patterns)) {
        const matches = content.match(pattern);
        if (matches) {
          fileIssues += matches.length;
          
          // Only fix certain patterns automatically
          if (['trailingSpaces', 'emptyLines'].includes(patternName)) {
            if (patternName === 'trailingSpaces') {
              modifiedContent = modifiedContent.replace(pattern, '');
            } else if (patternName === 'emptyLines') {
              // Limit consecutive empty lines to maximum 2
              modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
            }
          }
        }
      }

      // Check for unused CSS classes (basic check)
      if (filePath.endsWith('.css')) {
        fileIssues += this.checkUnusedCSSClasses(filePath, content);
      }

      // Check for unused imports (basic check)
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileIssues += this.checkUnusedImports(filePath, content);
      }

      // Write back if content was modified
      if (modifiedContent !== originalContent) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        this.stats.issuesFixed++;
      }

      if (fileIssues > 0) {
        console.log(`📄 ${filePath}: ${fileIssues} issues found`);
        this.stats.issuesFound += fileIssues;
      }

      this.stats.filesProcessed++;
    } catch (error) {
      console.warn(`⚠️  Could not process ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check for unused CSS classes (basic implementation)
   */
  checkUnusedCSSClasses(filePath, content) {
    let issues = 0;
    
    // Extract CSS class definitions
    const classMatches = content.match(/\.([a-zA-Z0-9_-]+)\s*{/g);
    if (!classMatches) return 0;

    const definedClasses = classMatches.map(match => 
      match.replace(/^\./, '').replace(/\s*{$/, '')
    );

    // Check if classes are used in HTML/JSX files
    const srcFiles = this.getAllSourceFiles();
    const usedClasses = new Set();

    for (const srcFile of srcFiles) {
      if (srcFile.endsWith('.tsx') || srcFile.endsWith('.jsx') || srcFile.endsWith('.html')) {
        try {
          const srcContent = fs.readFileSync(srcFile, 'utf8');
          
          for (const className of definedClasses) {
            if (srcContent.includes(className)) {
              usedClasses.add(className);
            }
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    // Report unused classes
    for (const className of definedClasses) {
      if (!usedClasses.has(className)) {
        console.log(`  🎨 Potentially unused CSS class: .${className}`);
        issues++;
      }
    }

    return issues;
  }

  /**
   * Check for unused imports (basic implementation)
   */
  checkUnusedImports(filePath, content) {
    let issues = 0;
    
    // Extract import statements
    const importMatches = content.match(/^import\s+.*\s+from\s+['"][^'"]+['"];?\s*$/gm);
    if (!importMatches) return 0;

    for (const importStatement of importMatches) {
      // Extract imported names
      const namedImports = importStatement.match(/{\s*([^}]+)\s*}/);
      const defaultImport = importStatement.match(/import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      
      if (namedImports) {
        const imports = namedImports[1].split(',').map(imp => imp.trim());
        
        for (const importName of imports) {
          const cleanName = importName.replace(/\s+as\s+.*$/, '').trim();
          
          // Check if the import is used in the file
          const usageRegex = new RegExp(`\\b${cleanName}\\b`, 'g');
          const matches = content.match(usageRegex);
          
          // If only found in import statement, it might be unused
          if (!matches || matches.length <= 1) {
            console.log(`  📦 Potentially unused import: ${cleanName} in ${path.basename(filePath)}`);
            issues++;
          }
        }
      }
    }

    return issues;
  }

  /**
   * Get all source files for cross-referencing
   */
  getAllSourceFiles() {
    const files = [];
    
    const walkDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !config.excludeDirs.includes(entry.name)) {
          walkDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (config.extensions.includes(ext) || entry.name.endsWith('.html')) {
            files.push(fullPath);
          }
        }
      }
    };

    walkDir(config.srcDir);
    return files;
  }

  /**
   * Print cleanup summary
   */
  printSummary() {
    console.log('\n📊 Cleanup Summary:');
    console.log(`   Files processed: ${this.stats.filesProcessed}`);
    console.log(`   Issues found: ${this.stats.issuesFound}`);
    console.log(`   Issues auto-fixed: ${this.stats.issuesFixed}`);
    
    if (this.stats.issuesFound > this.stats.issuesFixed) {
      console.log('\n💡 Manual review recommended for remaining issues.');
    }
    
    console.log('\n✅ Cleanup completed!');
  }
}

// Run cleanup if called directly
if (require.main === module) {
  const cleanup = new CodeCleanup();
  cleanup.cleanup().catch(console.error);
}

module.exports = CodeCleanup;