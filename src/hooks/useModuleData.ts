import { useQuery } from '@tanstack/react-query';
import type { LearningModule } from '../types';

const fetchModuleData = async (moduleId: string): Promise<LearningModule> => {
  const response = await fetch(`/src/assets/data/${moduleId}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch module ${moduleId}`);
  }
  return response.json();
};

const fetchAllModules = async (): Promise<LearningModule[]> => {
  const response = await fetch('/src/assets/data/learningModules.json');
  if (!response.ok) {
    throw new Error('Failed to fetch modules list');
  }
  return response.json();
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