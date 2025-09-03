/**
 * Utility functions for handling asset paths
 */

/// <reference types="vite/client" />

/**
 * Get the correct asset path based on the environment and base configuration
 * @param assetPath - The asset path relative to src/assets/data
 * @returns The full URL path for the asset
 */
export const getAssetPath = (assetPath: string): string => {
    // Remove leading slash or dot-slash if present
    const cleanPath = assetPath.replace(/^\.?\//, '');

    // In development with base path, prepend the base path
    const basePath = import.meta.env.BASE_URL || '/';

    // If the path already starts with src/, use it as is
    if (cleanPath.startsWith('src/')) {
        return `${basePath}${cleanPath}`;
    }

    // Otherwise, assume it's a filename and prepend the data directory
    return `${basePath}src/assets/data/${cleanPath}`;
};

/**
 * Get the learning modules JSON path
 * @returns The full URL path for learningModules.json
 */
export const getLearningModulesPath = (): string => {
    return getAssetPath('src/assets/data/learningModules.json');
};