#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class ProjectAnalyzer {
  constructor(rootPath = '.') {
    this.rootPath = rootPath;
    this.analysis = {
      totalFiles: 0,
      filesByType: {},
      directorySize: {},
      performanceIssues: [],
      recommendations: []
    };
  }

  /**
   * Analiza la estructura completa del proyecto
   */
  analyzeStructure() {
    console.log('🔍 Analizando estructura del proyecto...');
    
    this.countFiles();
    this.calculateDirectorySizes();
    this.identifyPerformanceIssues();
    this.generateRecommendations();
    
    return this.analysis;
  }

  /**
   * Cuenta archivos por tipo y total
   */
  countFiles() {
    const walkDir = (dir, level = 0) => {
      if (level > 10) return; // Prevenir recursión infinita
      
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Saltar directorios problemáticos
            if (this.shouldSkipDirectory(item)) continue;
            walkDir(fullPath, level + 1);
          } else {
            this.analysis.totalFiles++;
            const ext = path.extname(item).toLowerCase() || 'no-extension';
            this.analysis.filesByType[ext] = (this.analysis.filesByType[ext] || 0) + 1;
          }
        }
      } catch (error) {
        console.warn(`⚠️  No se pudo acceder a ${dir}: ${error.message}`);
      }
    };

    walkDir(this.rootPath);
  }

  /**
   * Calcula el tamaño de directorios importantes
   */
  calculateDirectorySizes() {
    const importantDirs = ['node_modules', 'coverage', 'dist', 'dev-dist', 'html', 'local', '.vite'];
    
    for (const dir of importantDirs) {
      const dirPath = path.join(this.rootPath, dir);
      if (fs.existsSync(dirPath)) {
        this.analysis.directorySize[dir] = this.getDirectorySize(dirPath);
      }
    }
  }

  /**
   * Identifica problemas de rendimiento
   */
  identifyPerformanceIssues() {
    const issues = [];

    // Problema: Demasiados archivos
    if (this.analysis.totalFiles > 10000) {
      issues.push({
        type: 'file_count',
        severity: 'high',
        description: `Proyecto con ${this.analysis.totalFiles} archivos puede causar lentitud`,
        solution: 'Implementar filtrado agresivo de archivos',
        estimatedImpact: 40
      });
    }

    // Problema: Directorio coverage grande
    if (this.analysis.directorySize.coverage) {
      const coverageSize = this.parseSize(this.analysis.directorySize.coverage);
      if (coverageSize > 1) { // > 1MB
        issues.push({
          type: 'directory_size',
          severity: 'medium',
          description: `Directorio coverage (${this.analysis.directorySize.coverage}) contiene reportes HTML innecesarios`,
          solution: 'Limpiar archivos HTML de coverage, mantener solo JSON',
          estimatedImpact: 25
        });
      }
    }

    // Problema: Múltiples directorios de build
    const buildDirs = ['dist', 'dev-dist', 'html'].filter(dir => this.analysis.directorySize[dir]);
    if (buildDirs.length > 1) {
      issues.push({
        type: 'structure',
        severity: 'medium',
        description: `Múltiples directorios de build: ${buildDirs.join(', ')}`,
        solution: 'Consolidar en un solo directorio de build',
        estimatedImpact: 15
      });
    }

    // Problema: Estructura plana en raíz
    const rootItems = fs.readdirSync(this.rootPath).length;
    if (rootItems > 20) {
      issues.push({
        type: 'structure',
        severity: 'medium',
        description: `${rootItems} elementos en directorio raíz causan desorden visual`,
        solution: 'Reorganizar archivos de configuración en subdirectorio',
        estimatedImpact: 20
      });
    }

    this.analysis.performanceIssues = issues;
  }

  /**
   * Genera recomendaciones basadas en el análisis
   */
  generateRecommendations() {
    const recommendations = [];

    // Recomendaciones basadas en problemas identificados
    for (const issue of this.analysis.performanceIssues) {
      recommendations.push(issue.solution);
    }

    // Recomendaciones adicionales
    if (this.analysis.filesByType['.html'] > 100) {
      recommendations.push('Excluir archivos HTML generados del indexado de Kiro');
    }

    if (this.analysis.filesByType['.log'] > 0) {
      recommendations.push('Limpiar archivos de log para reducir ruido');
    }

    this.analysis.recommendations = recommendations;
  }

  /**
   * Calcula el potencial de optimización
   */
  calculateOptimizationPotential() {
    const totalImpact = this.analysis.performanceIssues
      .reduce((sum, issue) => sum + issue.estimatedImpact, 0);

    return {
      estimatedImprovement: Math.min(totalImpact, 80), // Máximo 80%
      criticalIssues: this.analysis.performanceIssues.filter(i => i.severity === 'high').length,
      mediumIssues: this.analysis.performanceIssues.filter(i => i.severity === 'medium').length,
      lowIssues: this.analysis.performanceIssues.filter(i => i.severity === 'low').length
    };
  }

  /**
   * Determina si un directorio debe ser omitido del análisis
   */
  shouldSkipDirectory(dirname) {
    const skipDirs = [
      'node_modules', '.git', '.vscode', '.idea', 
      'coverage', 'dist', 'dev-dist', '.vite', '.cache'
    ];
    return skipDirs.includes(dirname) || dirname.startsWith('.');
  }

  /**
   * Obtiene el tamaño de un directorio usando du
   */
  getDirectorySize(dirPath) {
    try {
      const output = execSync(`du -sh "${dirPath}" 2>/dev/null`, { encoding: 'utf8' });
      return output.split('\t')[0].trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Convierte tamaño legible a MB para comparación
   */
  parseSize(sizeStr) {
    if (!sizeStr || sizeStr === 'unknown') return 0;
    
    const match = sizeStr.match(/^([\d.]+)([KMGT]?)B?$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    const multipliers = { '': 1/1024/1024, 'K': 1/1024, 'M': 1, 'G': 1024, 'T': 1024*1024 };
    return value * (multipliers[unit] || 0);
  }

  /**
   * Genera reporte formateado
   */
  generateReport() {
    const optimization = this.calculateOptimizationPotential();
    
    console.log('\n📊 REPORTE DE ANÁLISIS DEL PROYECTO');
    console.log('=====================================');
    
    console.log(`\n📁 Estructura:`);
    console.log(`   Total de archivos: ${this.analysis.totalFiles.toLocaleString()}`);
    console.log(`   Tipos de archivo más comunes:`);
    
    const sortedTypes = Object.entries(this.analysis.filesByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    for (const [ext, count] of sortedTypes) {
      console.log(`     ${ext}: ${count.toLocaleString()}`);
    }
    
    console.log(`\n💾 Tamaños de directorio:`);
    for (const [dir, size] of Object.entries(this.analysis.directorySize)) {
      console.log(`   ${dir}: ${size}`);
    }
    
    console.log(`\n⚠️  Problemas identificados (${this.analysis.performanceIssues.length}):`);
    for (const issue of this.analysis.performanceIssues) {
      const severity = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      console.log(`   ${severity} ${issue.description}`);
      console.log(`      Solución: ${issue.solution}`);
      console.log(`      Impacto estimado: ${issue.estimatedImpact}%\n`);
    }
    
    console.log(`\n🚀 Potencial de optimización:`);
    console.log(`   Mejora estimada: ${optimization.estimatedImprovement}%`);
    console.log(`   Problemas críticos: ${optimization.criticalIssues}`);
    console.log(`   Problemas medios: ${optimization.mediumIssues}`);
    
    console.log(`\n💡 Recomendaciones:`);
    for (let i = 0; i < this.analysis.recommendations.length; i++) {
      console.log(`   ${i + 1}. ${this.analysis.recommendations[i]}`);
    }
    
    return this.analysis;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new ProjectAnalyzer();
  analyzer.analyzeStructure();
  analyzer.generateReport();
}

export default ProjectAnalyzer;