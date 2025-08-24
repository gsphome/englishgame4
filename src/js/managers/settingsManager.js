
class SettingsManager {
    constructor() {
        this.settings = {};
        this.events = {};
        this.loadSettings();
    }

    async loadSettings() {
        try {
            // Load default settings from config
            const response = await fetch('src/assets/data/app-config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.settings = await response.json();
            
            // Override with user settings from localStorage
            const userSettings = localStorage.getItem('userSettings');
            if (userSettings) {
                const parsedUserSettings = JSON.parse(userSettings);
                this.mergeSettings(parsedUserSettings);
            }
            
        } catch (error) {
            console.error('Failed to load settings, using default:', error);
            // Fallback to default settings if loading fails
            this.settings = {
                "defaultLanguage": "en",
                "level": "all",
                "learningSettings": {
                    "matchingMode": {
                        "wordCount": 3
                    },
                    "sortingMode": {
                        "wordCount": 3
                    },
                    "flashcardMode": {
                        "wordCount": 10
                    },
                    "quizMode": {
                        "questionCount": 10
                    },
                    "completionMode": {
                        "itemCount": 10
                    }
                }
            };
        }
    }

    mergeSettings(userSettings) {
        // Deep merge user settings with default settings
        const merge = (target, source) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        };
        merge(this.settings, userSettings);
    }

    getSetting(keyPath) {
        let current = this.settings;
        const path = keyPath.split('.');
        for (let i = 0; i < path.length; i++) {
            if (current === null || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, path[i])) {
                return undefined; // Or throw an error, depending on desired behavior
            }
            current = current[path[i]];
        }
        return current;
    }

    setSetting(keyPath, value) {
        let current = this.settings;
        const path = keyPath.split('.');
        const lastKeyIndex = path.length - 1;

        for (let i = 0; i < lastKeyIndex; i++) {
            const key = path[i];
            if (current === null || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, key)) {
                // Create the path if it doesn't exist
                current[key] = {};
            }
            current = current[key];
        }

        if (current !== null && typeof current === 'object') {
            current[path[lastKeyIndex]] = value;
            this.emit(`setting:${keyPath}`, value);
        } else {
            console.error(`Cannot set setting at ${keyPath}: path is not an object.`);
        }
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}

export const settingsManager = new SettingsManager();
