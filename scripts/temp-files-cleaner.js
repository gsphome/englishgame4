#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

class TempFilesCleaner {
  constructor(rootPath = '.') {
    this.rootPath = rootPath;
    this.cleanupStats = {
      dsStoreFiles: 0,
      logFiles: 0,
      cacheDirectories: 0,
      tempFiles: 0,
      totalSpaceSaved: 0,
      errors: []
    };
  }

  /**
   * Limpia archivos temporales del sistema
   */
  async cleanTempFiles() {
    console.log('🧹 Iniciando limpieza de archivos temporales del sistema...');

    // Confirmar con usuario
    const shouldProceed = await this.confirmCleanup();
    if (!shouldProceed) {
      console.log('❌ Limpieza cancelada por el usuario');
      return this.cleanupStats;
    }

    // Limpiar diferentes tipos de archivos temporales
    await this.cleanDSStoreFiles();
    await this.cleanLogFiles();
    await this.cleanCacheDirectories();
    await this.cleanTempDirectories();

    // Generar reporte
    this.generateCleanupReport();

    return this.cleanupStats;
  }

  /**
   * Confirma con el usuario antes de proceder
   */
  async confirmCleanup() {
    const { createInterface } = await import('readline');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('¿Deseas proceder con la limpieza de archivos temporales? (s/N): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'si');
      });
    });
  }

  /**
   * Limpia archivos .DS_Store de macOS
   */
  async cleanDSStoreFiles() {
    console.log('🗑️  Limpiando archivos .DS_Store...');

    const dsStoreFiles = [];
    
    const findDSStoreFiles = (dir, level = 0) => {
      if (level > 10) return; // Prevenir recursión infinita
      
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          
          if (item === '.DS_Store') {
            dsStoreFiles.push(fullPath);
          } else {
            try {
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
                findDSStoreFiles(fullPath, level + 1);
              }
            } catch (error) {
              // Ignorar errores de acceso a archivos/directorios
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  No se pudo acceder a ${dir}: ${error.message}`);
      }
    };

    findDSStoreFiles(this.rootPath);

    // Remover archivos encontrados
    for (const filePath of dsStoreFiles) {
      try {
        const stat = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        this.cleanupStats.dsStoreFiles++;
        this.cleanupStats.totalSpaceSaved += stat.size;
        console.log(`   ✅ Removido: ${path.relative(this.rootPath, filePath)}`);
      } catch (error) {
        console.warn(`   ⚠️  Error removiendo ${filePath}: ${error.message}`);
        this.cleanupStats.errors.push(`DS_Store error: ${error.message}`);
      }
    }

    console.log(`   📊 Total archivos .DS_Store removidos: ${this.cleanupStats.dsStoreFiles}`);
  }

  /**
   * Limpia archivos de log
   */
  async cleanLogFiles() {
    console.log('📝 Limpiando archivos de log...');

    const logPatterns = [
      /\.log$/,
      /npm-debug\.log.*$/,
      /yarn-debug\.log.*$/,
      /yarn-error\.log.*$/,
      /pnpm-debug\.log.*$/,
      /lerna-debug\.log.*$/
    ];

    const logFiles = [];
    
    const findLogFiles = (dir, level = 0) => {
      if (level > 10) return;
      
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          
          try {
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              if (!this.shouldSkipDirectory(item)) {
                findLogFiles(fullPath, level + 1);
              }
            } else {
              // Verificar si coincide con patrones de log
              if (logPatterns.some(pattern => pattern.test(item))) {
                logFiles.push({
                  path: fullPath,
                  size: stat.size
                });
              }
            }
          } catch (error) {
            // Ignorar errores de acceso
          }
        }
      } catch (error) {
        console.warn(`⚠️  No se pudo acceder a ${dir}: ${error.message}`);
      }
    };

    findLogFiles(this.rootPath);

    // Remover archivos de log
    for (const logFile of logFiles) {
      try {
        fs.unlinkSync(logFile.path);
        this.cleanupStats.logFiles++;
        this.cleanupStats.totalSpaceSaved += logFile.size;
        console.log(`   ✅ Removido: ${path.relative(this.rootPath, logFile.path)}`);
      } catch (error) {
        console.warn(`   ⚠️  Error removiendo ${logFile.path}: ${error.message}`);
        this.cleanupStats.errors.push(`Log file error: ${error.message}`);
      }
    }

    console.log(`   📊 Total archivos de log removidos: ${this.cleanupStats.logFiles}`);
  }

  /**
   * Limpia directorios de cache
   */
  async cleanCacheDirectories() {
    console.log('💾 Limpiando directorios de cache...');

    const cacheDirectories = [
      '.cache',
      '.vite',
      '.rpt2_cache',
      '.rts2_cache_cjs',
      '.rts2_cache_es',
      '.rts2_cache_umd',
      '.parcel-cache',
      '.webpack',
      '.rollup.cache'
    ];

    for (const cacheDir of cacheDirectories) {
      const cachePath = path.join(this.rootPath, cacheDir);
      
      if (fs.existsSync(cachePath)) {
        try {
          const sizeBefore = this.getDirectorySize(cachePath);
          this.removeDirectory(cachePath);
          this.cleanupStats.cacheDirectories++;
          this.cleanupStats.totalSpaceSaved += sizeBefore;
          console.log(`   ✅ Cache removido: ${cacheDir}`);
        } catch (error) {
          console.warn(`   ⚠️  Error removiendo cache ${cacheDir}: ${error.message}`);
          this.cleanupStats.errors.push(`Cache error: ${error.message}`);
        }
      }
    }

    console.log(`   📊 Total directorios de cache removidos: ${this.cleanupStats.cacheDirectories}`);
  }

  /**
   * Limpia directorios temporales
   */
  async cleanTempDirectories() {
    console.log('🗂️  Limpiando directorios temporales...');

    const tempDirectories = [
      '.temp',
      '.tmp',
      'temp',
      'tmp'
    ];

    for (const tempDir of tempDirectories) {
      const tempPath = path.join(this.rootPath, tempDir);
      
      if (fs.existsSync(tempPath)) {
        try {
          const stat = fs.statSync(tempPath);
          if (stat.isDirectory()) {
            const sizeBefore = this.getDirectorySize(tempPath);
            this.removeDirectory(tempPath);
            this.cleanupStats.tempFiles++;
            this.cleanupStats.totalSpaceSaved += sizeBefore;
            console.log(`   ✅ Directorio temporal removido: ${tempDir}`);
          }
        } catch (error) {
          console.warn(`   ⚠️  Error removiendo directorio temporal ${tempDir}: ${error.message}`);
          this.cleanupStats.errors.push(`Temp dir error: ${error.message}`);
        }
      }
    }

    console.log(`   📊 Total directorios temporales removidos: ${this.cleanupStats.tempFiles}`);
  }

  /**
   * Determina si un directorio debe ser omitido
   */
  shouldSkipDirectory(dirname) {
    const skipDirs = [
      'node_modules', '.git', '.vscode', '.idea',
      'dist', 'build', 'coverage'
    ];
    return skipDirs.includes(dirname);
  }

  /**
   * Obtiene el tamaño de un directorio en bytes
   */
  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const calculateSize = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          try {
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              calculateSize(fullPath);
            } else {
              totalSize += stat.size;
            }
          } catch (error) {
            // Ignorar errores de acceso
          }
        }
      } catch (error) {
        // Ignorar errores de acceso al directorio
      }
    };

    calculateSize(dirPath);
    return totalSize;
  }

  /**
   * Remueve un directorio y todo su contenido
   */
  removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }

  /**
   * Formatea bytes en formato legible
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Genera reporte de limpieza
   */
  generateCleanupReport() {
    console.log('\n📊 REPORTE DE LIMPIEZA DE ARCHIVOS TEMPORALES');
    console.log('=============================================');
    
    console.log(`\n🗑️  Archivos .DS_Store removidos: ${this.cleanupStats.dsStoreFiles}`);
    console.log(`📝 Archivos de log removidos: ${this.cleanupStats.logFiles}`);
    console.log(`💾 Directorios de cache removidos: ${this.cleanupStats.cacheDirectories}`);
    console.log(`🗂️  Directorios temporales removidos: ${this.cleanupStats.tempFiles}`);
    
    console.log(`\n💾 Espacio total liberado: ${this.formatBytes(this.cleanupStats.totalSpaceSaved)}`);
    
    if (this.cleanupStats.errors.length > 0) {
      console.log(`\n⚠️  Errores encontrados (${this.cleanupStats.errors.length}):`);
      for (const error of this.cleanupStats.errors) {
        console.log(`   - ${error}`);
      }
    }

    const totalItemsRemoved = this.cleanupStats.dsStoreFiles + 
                             this.cleanupStats.logFiles + 
                             this.cleanupStats.cacheDirectories + 
                             this.cleanupStats.tempFiles;

    if (totalItemsRemoved > 0) {
      console.log('\n💡 Recomendaciones:');
      console.log('   1. Considera agregar estos patrones a tu .gitignore');
      console.log('   2. Configura tu editor para no crear archivos .DS_Store');
      console.log('   3. Ejecuta esta limpieza periódicamente');
    } else {
      console.log('\n✨ ¡Tu proyecto ya está limpio de archivos temporales!');
    }
  }

  /**
   * Actualiza .gitignore para prevenir archivos temporales
   */
  updateGitIgnore() {
    const gitIgnorePath = path.join(this.rootPath, '.gitignore');
    const tempPatterns = [
      '# Sistema operativo',
      '.DS_Store',
      '.DS_Store?',
      '._*',
      'Thumbs.db',
      'ehthumbs.db',
      '',
      '# Archivos temporales',
      '.temp/',
      '.tmp/',
      'temp/',
      'tmp/',
      '',
      '# Cache',
      '.cache/',
      '.vite/',
      '.parcel-cache/',
      '',
      '# Logs',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*'
    ];

    try {
      let content = '';
      if (fs.existsSync(gitIgnorePath)) {
        content = fs.readFileSync(gitIgnorePath, 'utf8');
      }

      // Agregar patrones que no existen
      let updated = false;
      for (const pattern of tempPatterns) {
        if (pattern && !content.includes(pattern)) {
          if (!updated) {
            content += '\n# Archivos temporales agregados automáticamente\n';
            updated = true;
          }
          content += pattern + '\n';
        }
      }

      if (updated) {
        fs.writeFileSync(gitIgnorePath, content);
        console.log('✅ .gitignore actualizado para prevenir archivos temporales');
      }
    } catch (error) {
      console.warn(`⚠️  Error actualizando .gitignore: ${error.message}`);
    }
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new TempFilesCleaner();
  cleaner.cleanTempFiles().then(() => {
    cleaner.updateGitIgnore();
    console.log('\n🎉 Limpieza de archivos temporales completada');
  });
}

export default TempFilesCleaner;