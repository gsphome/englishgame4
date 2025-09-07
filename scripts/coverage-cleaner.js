#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

class CoverageCleaner {
  constructor(rootPath = '.') {
    this.rootPath = rootPath;
    this.coverageDir = path.join(rootPath, 'coverage');
    this.cleanupStats = {
      filesRemoved: 0,
      spaceSaved: 0,
      filesPreserved: 0,
      errors: []
    };
  }

  /**
   * Limpia archivos HTML de coverage manteniendo datos esenciales
   */
  async cleanCoverageFiles() {
    console.log('🧹 Iniciando limpieza de archivos de coverage...');

    if (!fs.existsSync(this.coverageDir)) {
      console.log('ℹ️  No se encontró directorio coverage');
      return this.cleanupStats;
    }

    // Confirmar con usuario antes de proceder
    const shouldProceed = await this.confirmCleanup();
    if (!shouldProceed) {
      console.log('❌ Limpieza cancelada por el usuario');
      return this.cleanupStats;
    }

    // Crear backup antes de limpiar
    await this.createBackup();

    // Identificar y limpiar archivos
    await this.identifyAndCleanFiles();

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
      rl.question('¿Deseas proceder con la limpieza de archivos HTML de coverage? (s/N): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'si');
      });
    });
  }

  /**
   * Crea backup del directorio coverage
   */
  async createBackup() {
    const backupDir = `${this.coverageDir}-backup-${Date.now()}`;
    
    try {
      console.log(`📦 Creando backup en ${backupDir}...`);
      
      // Copiar solo archivos esenciales para el backup
      const essentialFiles = this.findEssentialFiles();
      
      if (essentialFiles.length > 0) {
        fs.mkdirSync(backupDir, { recursive: true });
        
        for (const file of essentialFiles) {
          const destFile = path.join(backupDir, path.relative(this.coverageDir, file));
          const destDir = path.dirname(destFile);
          
          fs.mkdirSync(destDir, { recursive: true });
          fs.copyFileSync(file, destFile);
        }
        
        console.log(`✅ Backup creado con ${essentialFiles.length} archivos esenciales`);
      }
    } catch (error) {
      console.warn(`⚠️  Error creando backup: ${error.message}`);
      this.cleanupStats.errors.push(`Backup error: ${error.message}`);
    }
  }

  /**
   * Encuentra archivos esenciales que deben preservarse
   */
  findEssentialFiles() {
    const essentialPatterns = [
      /coverage-final\.json$/,
      /lcov\.info$/,
      /clover\.xml$/,
      /cobertura-coverage\.xml$/,
      /coverage-summary\.json$/
    ];

    const essentialFiles = [];
    
    const walkDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else {
            // Verificar si es archivo esencial
            if (essentialPatterns.some(pattern => pattern.test(item))) {
              essentialFiles.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Error accediendo a ${dir}: ${error.message}`);
      }
    };

    walkDir(this.coverageDir);
    return essentialFiles;
  }

  /**
   * Identifica y limpia archivos no esenciales
   */
  async identifyAndCleanFiles() {
    console.log('🔍 Identificando archivos para limpiar...');

    const filesToRemove = [];
    const filesToPreserve = [];

    const walkDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else {
            if (this.shouldRemoveFile(fullPath)) {
              filesToRemove.push({
                path: fullPath,
                size: stat.size
              });
            } else {
              filesToPreserve.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Error accediendo a ${dir}: ${error.message}`);
        this.cleanupStats.errors.push(`Access error: ${error.message}`);
      }
    };

    walkDir(this.coverageDir);

    console.log(`📋 Archivos a remover: ${filesToRemove.length}`);
    console.log(`📋 Archivos a preservar: ${filesToPreserve.length}`);

    // Remover archivos identificados
    for (const file of filesToRemove) {
      try {
        fs.unlinkSync(file.path);
        this.cleanupStats.filesRemoved++;
        this.cleanupStats.spaceSaved += file.size;
      } catch (error) {
        console.warn(`⚠️  Error removiendo ${file.path}: ${error.message}`);
        this.cleanupStats.errors.push(`Remove error: ${error.message}`);
      }
    }

    this.cleanupStats.filesPreserved = filesToPreserve.length;

    // Remover directorios vacíos
    this.removeEmptyDirectories();
  }

  /**
   * Determina si un archivo debe ser removido
   */
  shouldRemoveFile(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();

    // Preservar archivos esenciales
    const essentialPatterns = [
      /coverage-final\.json$/,
      /lcov\.info$/,
      /clover\.xml$/,
      /cobertura-coverage\.xml$/,
      /coverage-summary\.json$/
    ];

    if (essentialPatterns.some(pattern => pattern.test(fileName))) {
      return false;
    }

    // Remover archivos HTML y CSS de reportes
    const removePatterns = [
      /\.html$/,
      /\.css$/,
      /\.js$/, // JavaScript de reportes HTML
      /\.png$/, // Iconos de reportes
      /\.svg$/, // Iconos SVG de reportes
    ];

    return removePatterns.some(pattern => pattern.test(ext));
  }

  /**
   * Remueve directorios vacíos después de la limpieza
   */
  removeEmptyDirectories() {
    const removeEmptyDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        // Primero procesar subdirectorios
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            removeEmptyDir(fullPath);
          }
        }

        // Verificar si el directorio está vacío ahora
        const remainingItems = fs.readdirSync(dir);
        if (remainingItems.length === 0 && dir !== this.coverageDir) {
          fs.rmdirSync(dir);
          console.log(`🗑️  Directorio vacío removido: ${path.relative(this.rootPath, dir)}`);
        }
      } catch (error) {
        // Ignorar errores de directorios que no se pueden remover
      }
    };

    removeEmptyDir(this.coverageDir);
  }

  /**
   * Genera reporte de la limpieza realizada
   */
  generateCleanupReport() {
    console.log('\n📊 REPORTE DE LIMPIEZA DE COVERAGE');
    console.log('==================================');
    
    console.log(`\n✅ Archivos removidos: ${this.cleanupStats.filesRemoved}`);
    console.log(`💾 Espacio liberado: ${this.formatBytes(this.cleanupStats.spaceSaved)}`);
    console.log(`📁 Archivos preservados: ${this.cleanupStats.filesPreserved}`);
    
    if (this.cleanupStats.errors.length > 0) {
      console.log(`\n⚠️  Errores encontrados (${this.cleanupStats.errors.length}):`);
      for (const error of this.cleanupStats.errors) {
        console.log(`   - ${error}`);
      }
    }

    // Verificar archivos esenciales preservados
    const essentialFiles = this.findEssentialFiles();
    if (essentialFiles.length > 0) {
      console.log(`\n🔒 Archivos esenciales preservados:`);
      for (const file of essentialFiles) {
        console.log(`   - ${path.relative(this.rootPath, file)}`);
      }
    }

    console.log(`\n💡 Recomendación: Actualiza tu .kiroignore para excluir coverage/**/*.html`);
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
   * Actualiza .kiroignore para excluir archivos HTML de coverage
   */
  updateKiroIgnore() {
    const kiroIgnorePath = path.join(this.rootPath, '.kiroignore');
    const coverageHtmlPattern = 'coverage/**/*.html';
    
    try {
      let content = '';
      if (fs.existsSync(kiroIgnorePath)) {
        content = fs.readFileSync(kiroIgnorePath, 'utf8');
      }

      // Verificar si el patrón ya existe
      if (!content.includes(coverageHtmlPattern)) {
        content += `\n# Coverage HTML reports\n${coverageHtmlPattern}\n`;
        fs.writeFileSync(kiroIgnorePath, content);
        console.log('✅ .kiroignore actualizado para excluir archivos HTML de coverage');
      }
    } catch (error) {
      console.warn(`⚠️  Error actualizando .kiroignore: ${error.message}`);
    }
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new CoverageCleaner();
  cleaner.cleanCoverageFiles().then(() => {
    cleaner.updateKiroIgnore();
    console.log('\n🎉 Limpieza completada');
  });
}

export default CoverageCleaner;