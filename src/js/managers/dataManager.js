let appConfig = null;

/**
 * Fetches the application configuration from app-config.json.
 * @returns {Promise<object>} A promise that resolves to the application configuration object.
 */
export async function fetchAppConfig() {
    if (appConfig) {
        return appConfig; // Return cached config if already loaded
    }
    try {
        const response = await fetch('src/assets/data/app-config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        appConfig = await response.json();
        return appConfig;
    } catch (error) {
        console.error('Failed to load app configuration:', error);
        return {}; // Return empty object on error to prevent app from crashing
    }
}

/**
 * Returns the loaded application configuration.
 * @returns {object|null} The application configuration object, or null if not yet loaded.
 */
export function getAppConfig() {
    return appConfig;
}

/**
 * Fetches all learning modules from the game database JSON file.
 * @returns {Promise<Array>} A promise that resolves to an array of learning module metadata.
 */
export async function fetchAllLearningModules() {
    try {
        const response = await fetch('src/assets/data/learningModules.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to load learning modules:', error);
        return [];
    }
}

/**
 * Fetches the detailed data for a specific learning module.
 * @param {string} moduleId - The ID of the module to fetch data for.
 * @returns {Promise<object|null>} A promise that resolves to the module object with its data, or null if not found or an error occurs.
 */
export async function fetchModuleData(moduleId) {
    const allModules = await fetchAllLearningModules();
    const moduleMeta = allModules.find(m => m.id === moduleId);
    if (!moduleMeta) {
        console.error(`Module with ID ${moduleId} not found.`);
        return null;
    }

    try {
        const response = await fetch(moduleMeta.dataPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData = await response.json();

        const moduleWithData = Array.isArray(fetchedData)
            ? { ...moduleMeta, data: fetchedData }
            : { ...moduleMeta, ...fetchedData };

        return moduleWithData;
    } catch (error) {
        console.error('Failed to load module data:', error);
        return null;
    }
}

/**
 * Filters learning modules based on user settings (level and categories).
 * @param {Array} modules - Array of learning modules to filter.
 * @param {object} settings - User settings containing level and categories.
 * @returns {Array} Filtered array of modules.
 */
export function filterModulesBySettings(modules, settings) {
    if (!modules || !settings) return modules;
    
    const userLevel = settings.level;
    const selectedCategories = settings.learningSettings?.categories || [];
    
    return modules.filter(module => {
        // Filter by level
        const levelMatch = !userLevel || userLevel === 'all' || !module.level || module.level.includes(userLevel);
        
        // Filter by category
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(module.category);
        
        return levelMatch && categoryMatch;
    });
}
