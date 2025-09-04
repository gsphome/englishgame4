import { secureJsonFetch, validateUrl } from '../utils/secureHttp';
import { getLearningModulesPath, getAssetPath } from '../utils/pathUtils';
import { logError, logDebug } from '../utils/logger';
import type { LearningModule } from '../types';

/**
 * API Service Layer - Abstracts all API calls and data fetching logic
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ModuleFilters {
  categories?: string[];
  level?: string;
  limit?: number;
}

class ApiService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generic cache management
   */
  private getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    return `${endpoint}${params ? JSON.stringify(params) : ''}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Fetch all available learning modules
   */
  async fetchModules(): Promise<ApiResponse<LearningModule[]>> {
    const cacheKey = this.getCacheKey('modules');
    const cached = this.getFromCache<LearningModule[]>(cacheKey);
    
    if (cached) {
      logDebug('Returning cached modules', { count: cached.length }, 'ApiService');
      return { data: cached, success: true };
    }

    try {
      const modulesUrl = validateUrl(getLearningModulesPath());
      const modules = await secureJsonFetch<LearningModule[]>(modulesUrl);
      
      // Enhance modules with default values
      const enhancedModules = modules.map((module: LearningModule) => ({
        ...module,
        estimatedTime: module.estimatedTime ?? 5,
        difficulty: module.difficulty ?? 3,
        tags: module.tags ?? [module.category],
      }));

      this.setCache(cacheKey, enhancedModules);
      logDebug('Fetched modules successfully', { count: enhancedModules.length }, 'ApiService');
      
      return { data: enhancedModules, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('Failed to fetch modules', { error: errorMessage }, 'ApiService');
      return { data: [], success: false, error: errorMessage };
    }
  }

  /**
   * Fetch specific module with its data
   */
  async fetchModuleData(moduleId: string): Promise<ApiResponse<LearningModule>> {
    const cacheKey = this.getCacheKey('module', { moduleId });
    const cached = this.getFromCache<LearningModule>(cacheKey);
    
    if (cached) {
      logDebug('Returning cached module data', { moduleId }, 'ApiService');
      return { data: cached, success: true };
    }

    try {
      // First get module metadata
      const modulesResponse = await this.fetchModules();
      if (!modulesResponse.success) {
        throw new Error('Failed to fetch modules list');
      }

      const moduleInfo = modulesResponse.data.find(m => m.id === moduleId);
      if (!moduleInfo) {
        throw new Error(`Module ${moduleId} not found`);
      }

      // Then get module data if dataPath exists
      let moduleData: LearningModule = { ...moduleInfo };
      
      if (moduleInfo.dataPath) {
        const dataUrl = validateUrl(getAssetPath(moduleInfo.dataPath));
        const data = await secureJsonFetch(dataUrl);
        
        moduleData = {
          ...moduleInfo,
          data: data.data || data,
          estimatedTime: data.estimatedTime || moduleInfo.estimatedTime || 5,
          difficulty: data.difficulty || moduleInfo.difficulty || 3,
          tags: data.tags || moduleInfo.tags || [moduleInfo.category],
        };
      }

      this.setCache(cacheKey, moduleData);
      logDebug('Fetched module data successfully', { moduleId }, 'ApiService');
      
      return { data: moduleData, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('Failed to fetch module data', { moduleId, error: errorMessage }, 'ApiService');
      return { data: {} as LearningModule, success: false, error: errorMessage };
    }
  }

  /**
   * Filter module data based on user settings
   */
  filterModuleData<T extends { category?: string; level?: string }>(
    data: T[],
    filters: ModuleFilters,
    moduleId: string
  ): T[] {
    if (!Array.isArray(data)) {
      logDebug('No data to filter', { moduleId }, 'ApiService');
      return [];
    }

    let filteredData = [...data];

    // Skip filtering for sorting modules (they need all data)
    if (moduleId.includes('sorting')) {
      logDebug('Skipping filters for sorting module', { moduleId }, 'ApiService');
      return filteredData.slice(0, filters.limit || filteredData.length);
    }

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      filteredData = filteredData.filter((item) => {
        const itemCategory = item.category || this.getCategoryFromId(moduleId);
        return filters.categories!.includes(itemCategory);
      });
    }

    // Filter by level
    if (filters.level && filters.level !== 'all') {
      filteredData = filteredData.filter((item) => {
        const itemLevel = item.level || 'b1';
        return itemLevel.toLowerCase() === filters.level!.toLowerCase();
      });
    }

    // Apply limit
    if (filters.limit && filters.limit > 0) {
      filteredData = filteredData.slice(0, filters.limit);
    }

    logDebug('Filtered module data', {
      moduleId,
      originalCount: data.length,
      filteredCount: filteredData.length,
      filters,
    }, 'ApiService');

    return filteredData;
  }

  /**
   * Helper to determine category from module ID
   */
  private getCategoryFromId(moduleId: string): string {
    if (moduleId.includes('grammar') || moduleId.includes('conditional') || moduleId.includes('participle')) {
      return 'Grammar';
    }
    if (moduleId.includes('phrasal')) {
      return 'PhrasalVerbs';
    }
    if (moduleId.includes('idiom')) {
      return 'Idioms';
    }
    return 'Vocabulary';
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
    logDebug('API cache cleared', undefined, 'ApiService');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export convenience functions
export const fetchModules = () => apiService.fetchModules();
export const fetchModuleData = (moduleId: string) => apiService.fetchModuleData(moduleId);
export const filterModuleData = <T extends { category?: string; level?: string }>(
  data: T[],
  filters: ModuleFilters,
  moduleId: string
) => apiService.filterModuleData(data, filters, moduleId);