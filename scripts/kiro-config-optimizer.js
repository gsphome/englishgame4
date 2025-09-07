#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

class KiroConfigOptimizer {
  constructor(rootPath = '.') {
    this.rootPath = rootPath;
    this.kiroSettingsPath = path.join(rootPath, '.kiro', 'settings.json');
    this.backupPath = `${this.kiroSettingsPath}.backup-${Date.now()}`;
    this.optimizationStats = {
      settingsUpdated: false,
      backupCreated: false,
      exclusionsAdded: 0,
      errors: []
    };
  }

  /**
   * Optimiza las configuraciones de Kiro para mejor rendimiento
   */
  async optimizeKiroSettings() {
    console.log('⚙️  Iniciando optimización de configuraciones de Kiro...');

    try {
      // Crear backup de configuraciones existentes
      await this.createBackup();

      // Generar configuraciones optimizadas
      const optimizedConfig = this.generateOptimizedConfig();

      // Aplicar configuraciones
      await this.applyOptimizedConfig(optimizedConfig);

      // Generar reporte
      this.generateOptimizationReport();

      return this.optimizationStats;
    } catch (error) {
      console.error(`❌ Error durante optimización: ${error.message}`);
      this.optimizationStats.errors.push(error.message);
      return this.optimizationStats;
    }
  }

  /**
   * Crea backup de configuraciones existentes
   */
  async createBackup() {
    try {
      if (fs.existsSync(this.kiroSettingsPath)) {
        fs.copyFileSync(this.kiroSettingsPath, this.backupPath);
        console.log(`📦 Backup creado: ${path.basename(this.backupPath)}`);
        this.optimizationStats.backupCreated = true;
      } else {
        console.log('ℹ️  No se encontró archivo de configuración existente');
      }
    } catch (error) {
      console.warn(`⚠️  Error creando backup: ${error.message}`);
      this.optimizationStats.errors.push(`Backup error: ${error.message}`);
    }
  }

  /**
   * Genera configuración optimizada basada en el análisis del proyecto
   */
  generateOptimizedConfig() {
    console.log('🔧 Generando configuraciones optimizadas...');

    // Configuración base existente
    let existingConfig = {};
    if (fs.existsSync(this.kiroSettingsPath)) {
      try {
        const content = fs.readFileSync(this.kiroSettingsPath, 'utf8');
        existingConfig = JSON.parse(content);
      } catch (error) {
        console.warn(`⚠️  Error leyendo configuración existente: ${error.message}`);
      }
    }

    // Configuraciones optimizadas para rendimiento
    const optimizedConfig = {
      ...existingConfig,
      "files.exclude": {
        ...existingConfig["files.exclude"],
        // Exclusiones básicas
        "**/node_modules": true,
        "**/package-lock.json": true,
        "**/.DS_Store": true,
        
        // Build outputs
        "**/dist": true,
        "**/dev-dist": true,
        "**/build": true,
        
        // Coverage y reportes
        "**/coverage": true,
        "**/coverage/**/*.html": true,
        "**/coverage/**/*.css": true,
        "**/coverage/**/*.js": true,
        "**/coverage/**/*.png": true,
        "**/html": true,
        
        // Archivos temporales y cache
        "**/.vite": true,
        "**/.cache": true,
        "**/.temp": true,
        "**/.tmp": true,
        "**/local": true,
        
        // Logs
        "**/*.log": true,
        "**/logs": true,
        
        // Test coverage outputs
        "**/.nyc_output": true,
        "**/*.lcov": true,
        
        // Microbundle cache
        "**/.rpt2_cache": true,
        "**/.rts2_cache_cjs": true,
        "**/.rts2_cache_es": true,
        "**/.rts2_cache_umd": true,
        
        // Parcel cache
        "**/.parcel-cache": true,
        
        // Vitest
        "**/.vitest": true,
        
        // TypeScript cache
        "**/*.tsbuildinfo": true,
        
        // Webpack
        "**/.webpack": true,
        
        // Rollup
        "**/.rollup.cache": true
      },
      
      "search.exclude": {
        ...existingConfig["search.exclude"],
        "**/node_modules": true,
        "**/coverage": true,
        "**/dist": true,
        "**/dev-dist": true,
        "**/build": true,
        "**/html": true,
        "**/local": true,
        "**/.vite": true,
        "**/.cache": true,
        "**/.temp": true,
        "**/.tmp": true,
        "**/*.log": true,
        "**/logs": true,
        "**/.nyc_output": true,
        "**/.parcel-cache": true,
        "**/.vitest": true,
        "**/.webpack": true,
        "**/.rollup.cache": true
      },
      
      "files.watcherExclude": {
        ...existingConfig["files.watcherExclude"],
        "**/node_modules/**": true,
        "**/coverage/**": true,
        "**/dist/**": true,
        "**/dev-dist/**": true,
        "**/build/**": true,
        "**/html/**": true,
        "**/local/**": true,
        "**/.vite/**": true,
        "**/.cache/**": true,
        "**/.temp/**": true,
        "**/.tmp/**": true,
        "**/logs/**": true,
        "**/.nyc_output/**": true,
        "**/.parcel-cache/**": true,
        "**/.vitest/**": true,
        "**/.webpack/**": true,
        "**/.rollup.cache/**": true
      }
    };

    // Agregar configuraciones específicas para mejorar rendimiento
    optimizedConfig["files.associations"] = {
      ...existingConfig["files.associations"],
      "*.json": "jsonc" // Mejor soporte para comentarios en JSON
    };

    // Configuraciones de editor para mejor rendimiento
    optimizedConfig["editor.quickSuggestions"] = {
      ...existingConfig["editor.quickSuggestions"],
      "other": false, // Reducir sugerencias automáticas en archivos grandes
      "comments": false,
      "strings": false
    };

    // Limitar análisis de archivos grandes
    optimizedConfig["typescript.preferences.includePackageJsonAutoImports"] = "off";
    optimizedConfig["typescript.suggest.autoImports"] = false;

    return optimizedConfig;
  }

  /**
   * Aplica la configuración optimizada
   */
  async applyOptimizedConfig(config) {
    try {
      // Asegurar que el directorio .kiro existe
      const kiroDir = path.dirname(this.kiroSettingsPath);
      if (!fs.existsSync(kiroDir)) {
        fs.mkdirSync(kiroDir, { recursive: true });
      }

      // Escribir configuración optimizada
      const configJson = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.kiroSettingsPath, configJson);

      console.log('✅ Configuraciones optimizadas aplicadas');
      this.optimizationStats.settingsUpdated = true;

      // Contar exclusiones agregadas
      this.optimizationStats.exclusionsAdded = this.countExclusions(config);

    } catch (error) {
      console.error(`❌ Error aplicando configuraciones: ${error.message}`);
      this.optimizationStats.errors.push(`Apply config error: ${error.message}`);
    }
  }

  /**
   * Cuenta el número total de exclusiones en la configuración
   */
  countExclusions(config) {
    let count = 0;
    
    if (config["files.exclude"]) {
      count += Object.keys(config["files.exclude"]).length;
    }
    
    if (config["search.exclude"]) {
      count += Object.keys(config["search.exclude"]).length;
    }
    
    if (config["files.watcherExclude"]) {
      count += Object.keys(config["files.watcherExclude"]).length;
    }
    
    return count;
  }

  /**
   * Valida que la configuración aplicada es correcta
   */
  validateConfiguration() {
    try {
      if (!fs.existsSync(this.kiroSettingsPath)) {
        return { valid: false, error: 'Archivo de configuración no existe' };
      }

      const content = fs.readFileSync(this.kiroSettingsPath, 'utf8');
      const config = JSON.parse(content);

      // Validar que tiene las secciones requeridas
      const requiredSections = ['files.exclude', 'search.exclude', 'files.watcherExclude'];
      for (const section of requiredSections) {
        if (!config[section]) {
          return { valid: false, error: `Sección faltante: ${section}` };
        }
      }

      // Validar que tiene exclusiones importantes
      const importantExclusions = ['**/node_modules', '**/coverage', '**/dist'];
      for (const exclusion of importantExclusions) {
        if (!config["files.exclude"][exclusion]) {
          return { valid: false, error: `Exclusión importante faltante: ${exclusion}` };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Genera reporte de optimización
   */
  generateOptimizationReport() {
    console.log('\n📊 REPORTE DE OPTIMIZACIÓN DE KIRO');
    console.log('==================================');
    
    console.log(`\n✅ Configuraciones actualizadas: ${this.optimizationStats.settingsUpdated ? 'Sí' : 'No'}`);
    console.log(`📦 Backup creado: ${this.optimizationStats.backupCreated ? 'Sí' : 'No'}`);
    console.log(`🚫 Exclusiones configuradas: ${this.optimizationStats.exclusionsAdded}`);
    
    if (this.optimizationStats.backupCreated) {
      console.log(`💾 Archivo de backup: ${path.basename(this.backupPath)}`);
    }

    // Validar configuración aplicada
    const validation = this.validateConfiguration();
    console.log(`\n🔍 Validación de configuración: ${validation.valid ? '✅ Válida' : '❌ Inválida'}`);
    if (!validation.valid) {
      console.log(`   Error: ${validation.error}`);
    }
    
    if (this.optimizationStats.errors.length > 0) {
      console.log(`\n⚠️  Errores encontrados (${this.optimizationStats.errors.length}):`);
      for (const error of this.optimizationStats.errors) {
        console.log(`   - ${error}`);
      }
    }

    console.log('\n💡 Recomendaciones post-optimización:');
    console.log('   1. Reinicia Kiro para aplicar todas las configuraciones');
    console.log('   2. Verifica que el indexado sea más rápido');
    console.log('   3. Monitorea el uso de memoria durante el desarrollo');
    
    if (this.optimizationStats.backupCreated) {
      console.log(`   4. Si hay problemas, restaura desde: ${path.basename(this.backupPath)}`);
    }
  }

  /**
   * Restaura configuración desde backup
   */
  restoreFromBackup() {
    try {
      if (fs.existsSync(this.backupPath)) {
        fs.copyFileSync(this.backupPath, this.kiroSettingsPath);
        console.log('✅ Configuración restaurada desde backup');
        return true;
      } else {
        console.log('❌ No se encontró archivo de backup');
        return false;
      }
    } catch (error) {
      console.error(`❌ Error restaurando backup: ${error.message}`);
      return false;
    }
  }

  /**
   * Genera configuración de ejemplo para referencia
   */
  generateExampleConfig() {
    const exampleConfig = {
      "// Configuración optimizada para proyectos grandes": "",
      "files.exclude": {
        "// Dependencias": "",
        "**/node_modules": true,
        "**/package-lock.json": true,
        
        "// Build outputs": "",
        "**/dist": true,
        "**/dev-dist": true,
        "**/build": true,
        
        "// Coverage y reportes": "",
        "**/coverage": true,
        "**/html": true,
        
        "// Archivos temporales": "",
        "**/.vite": true,
        "**/.cache": true,
        "**/local": true,
        
        "// Sistema": "",
        "**/.DS_Store": true,
        "**/*.log": true
      }
    };

    const examplePath = path.join(this.rootPath, '.kiro', 'settings.example.json');
    fs.writeFileSync(examplePath, JSON.stringify(exampleConfig, null, 2));
    console.log(`📝 Configuración de ejemplo creada: ${examplePath}`);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new KiroConfigOptimizer();
  optimizer.optimizeKiroSettings().then(() => {
    console.log('\n🎉 Optimización de configuraciones completada');
  });
}

export default KiroConfigOptimizer;