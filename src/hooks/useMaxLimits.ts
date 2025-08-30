import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import type { MaxLimits } from '../stores/settingsStore';

/**
 * Hook to calculate and update maximum limits based on available data
 */
export const useMaxLimits = () => {
  const { updateMaxLimits } = useSettingsStore();

  useEffect(() => {
    const calculateMaxLimits = async (): Promise<MaxLimits> => {
      try {
        // Fetch all modules
        const modulesResponse = await fetch('./src/assets/data/learningModules.json');
        if (!modulesResponse.ok) throw new Error('Failed to fetch modules');
        const modules = await modulesResponse.json();

        const limits: MaxLimits = {
          flashcard: 0,
          quiz: 0,
          completion: 0,
          sorting: 0,
          matching: 0,
          maxCategories: 0
        };
        
        const categoriesSet = new Set<string>();

        // Calculate max for each learning mode
        for (const module of modules) {
          if (!module.dataPath) continue;

          try {
            const dataPath = module.dataPath.replace('src/assets/data/', '');
            const dataResponse = await fetch(`./src/assets/data/${dataPath}`);
            if (!dataResponse.ok) continue;
            
            const data = await dataResponse.json();
            const items = data.data || data;
            
            if (Array.isArray(items)) {
              const count = items.length;
              
              // Collect unique categories for sorting mode
              if (module.learningMode === 'sorting') {
                items.forEach((item: any) => {
                  if (item.category) {
                    categoriesSet.add(item.category);
                  }
                });
              }
              
              // Update max for each learning mode
              switch (module.learningMode) {
                case 'flashcard':
                  limits.flashcard = Math.max(limits.flashcard, count);
                  break;
                case 'quiz':
                  limits.quiz = Math.max(limits.quiz, count);
                  break;
                case 'completion':
                  limits.completion = Math.max(limits.completion, count);
                  break;
                case 'sorting':
                  limits.sorting = Math.max(limits.sorting, count);
                  break;
                case 'matching':
                  limits.matching = Math.max(limits.matching, count);
                  break;
              }
            }
          } catch (error) {
            console.warn(`Failed to load data for module ${module.id}:`, error);
          }
        }

        // Set max categories based on unique categories found
        limits.maxCategories = Math.max(2, categoriesSet.size);
        
        return limits;
      } catch (error) {
        console.error('Failed to calculate max limits:', error);
        // Return default limits if calculation fails
        return {
          flashcard: 50,
          quiz: 50,
          completion: 50,
          sorting: 50,
          matching: 50,
          maxCategories: 10
        };
      }
    };

    // Calculate and update limits on mount
    calculateMaxLimits().then(updateMaxLimits);
  }, [updateMaxLimits]);
};