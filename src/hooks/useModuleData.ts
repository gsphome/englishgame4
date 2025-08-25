import { useQuery } from '@tanstack/react-query';
import { useSettingsStore } from '../stores/settingsStore';
import type { LearningModule } from '../types';

const fetchModuleData = async (moduleId: string): Promise<LearningModule> => {
  // First get module metadata
  const modulesResponse = await fetch('/src/assets/data/learningModules.json');
  if (!modulesResponse.ok) {
    throw new Error('Failed to fetch modules list');
  }
  const modules: LearningModule[] = await modulesResponse.json();
  const moduleInfo = modules.find(m => m.id === moduleId);
  
  if (!moduleInfo) {
    throw new Error(`Module ${moduleId} not found`);
  }
  
  // Then get module data
  const dataResponse = await fetch(`/src/assets/data/${moduleId}.json`);
  if (!dataResponse.ok) {
    throw new Error(`Failed to fetch module data ${moduleId}`);
  }
  const data = await dataResponse.json();
  
  return {
    ...moduleInfo,
    data: data.data || data,
    estimatedTime: data.estimatedTime || 5,
    difficulty: data.difficulty || 3,
    tags: data.tags || []
  };
};

const fetchAllModules = async (): Promise<LearningModule[]> => {
  const response = await fetch('/src/assets/data/learningModules.json');
  if (!response.ok) {
    throw new Error('Failed to fetch modules list');
  }
  const modules = await response.json();
  return modules.map((module: any) => ({
    ...module,
    estimatedTime: 5,
    difficulty: 3,
    tags: [module.category]
  }));
};

export const useModuleData = (moduleId: string) => {
  const { categories, level, gameSettings } = useSettingsStore();
  
  return useQuery({
    queryKey: ['module', moduleId, categories, level, gameSettings],
    queryFn: async () => {
      const module = await fetchModuleData(moduleId);
      
      // Filter data by categories and level
      if (module.data && Array.isArray(module.data)) {
        let filteredData = module.data;
        
        // Filter by categories
        if (categories.length > 0) {
          filteredData = filteredData.filter((item: any) => {
            const itemCategory = item.category || getCategoryFromId(moduleId);
            return categories.includes(itemCategory);
          });
        }
        
        // Filter by level
        if (level !== 'all') {
          filteredData = filteredData.filter((item: any) => {
            const itemLevel = item.level || 'b1';
            return itemLevel.toLowerCase() === level.toLowerCase();
          });
        }
        
        // Limit items based on game settings
        if (module.learningMode) {
          let limit = 10; // default
          
          switch (module.learningMode) {
            case 'flashcard':
              limit = gameSettings.flashcardMode.wordCount;
              break;
            case 'quiz':
              limit = gameSettings.quizMode.questionCount;
              break;
            case 'completion':
              limit = gameSettings.completionMode.itemCount;
              break;
            case 'sorting':
              limit = gameSettings.sortingMode.wordCount;
              break;
            case 'matching':
              limit = gameSettings.matchingMode.wordCount;
              break;
          }
          
          filteredData = filteredData.slice(0, limit);
        }
        
        module.data = filteredData;
      }
      
      return module;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useAllModules = () => {
  const { categories, level } = useSettingsStore();
  
  return useQuery({
    queryKey: ['modules', categories, level],
    queryFn: async () => {
      const modules = await fetchAllModules();
      
      // Filter modules based on settings
      return modules.filter(module => {
        // Filter by categories
        if (categories.length > 0 && module.category) {
          if (!categories.includes(module.category)) {
            return false;
          }
        }
        
        // Filter by level - module.level is an array
        if (level !== 'all' && module.level && Array.isArray(module.level)) {
          if (!module.level.includes(level)) {
            return false;
          }
        }
        
        return true;
      });
    },
    staleTime: 10 * 60 * 1000,
    retry: 3
  });
};

// Helper function to determine category from module ID
const getCategoryFromId = (moduleId: string): string => {
  if (moduleId.includes('grammar') || moduleId.includes('conditional') || moduleId.includes('participle')) return 'Grammar';
  if (moduleId.includes('phrasal')) return 'PhrasalVerbs';
  if (moduleId.includes('idiom')) return 'Idioms';
  return 'Vocabulary';
};