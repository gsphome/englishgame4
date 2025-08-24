import { useQuery } from '@tanstack/react-query';
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
  return useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => fetchModuleData(moduleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useAllModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: fetchAllModules,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3
  });
};