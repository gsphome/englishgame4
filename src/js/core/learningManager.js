import FlashcardModule from '../components/FlashcardMode.js';
import QuizModule from '../components/QuizMode.js';
import CompletionModule from '../components/CompletionMode.js';
import SortingModule from '../components/SortingMode.js';
import MatchingModule from '../components/MatchingMode.js';
import { fetchModuleData } from '../managers/dataManager.js';
import { MESSAGES } from '../utils/i18n.js';
import { auth } from './auth.js';
// UI methods are now handled through callbacks
import { settingsManager } from '../managers/settingsManager.js';

export const learningManager = {
    flashcardModule: null,
    quizModule: null,
    completionModule: null,
    sortingModule: null,
    matchingModule: null,
    currentModule: null, // Referencia a los datos del módulo actualmente cargado
    appInstance: null, // Referencia a la instancia principal de app
    learningSettings: null, // Store learning settings

    init(appInstance, learningSettings) {
        this.appInstance = appInstance; // Almacenar la instancia de app para callbacks
        this.learningSettings = learningSettings; // Store initial learning settings

        this.learningCallbacks = {
            renderMenu: this.appInstance.renderMenu.bind(this.appInstance), // Llamar al renderMenu de app
            showFlashcardSummary: (count) => this.appInstance.ui.showFlashcardSummary(count),
            updateSessionScoreDisplay: (correct, incorrect, total) => this.appInstance.ui.updateSessionScoreDisplay(correct, incorrect, total),
            randomMode: this.appInstance.randomMode, // Acceder a randomMode de app
            shuffleArray: this.appInstance.shuffleArray, // Acceder a shuffleArray de app
            showSortingCompletionModal: (moduleData) => this.appInstance.ui.showSortingCompletionModal(moduleData),
            showMatchingSummary: (matchedPairs, moduleData) => this.appInstance.ui.showMatchingSummary(matchedPairs, moduleData),
            renderHeader: () => this.appInstance.ui.renderHeader(),
            toggleHamburgerMenu: (show) => this.appInstance.ui.toggleHamburgerMenu(show),
            isHistoryMode: false, // Default to false
        };

        // Initialize modules with dynamic settings
        this.initializeModules();
    },

    initializeModules() {
        // Get current settings from settingsManager
        const currentSettings = settingsManager.settings.learningSettings;
        
        this.flashcardModule = new FlashcardModule(auth, MESSAGES, this.learningCallbacks, currentSettings.flashcardMode);
        this.quizModule = new QuizModule(auth, MESSAGES, this.learningCallbacks, currentSettings.quizMode);
        this.completionModule = new CompletionModule(auth, MESSAGES, this.learningCallbacks, currentSettings.completionMode);
        this.sortingModule = new SortingModule(auth, MESSAGES, this.learningCallbacks, currentSettings.sortingMode);
        this.matchingModule = new MatchingModule(auth, MESSAGES, this.learningCallbacks, currentSettings.matchingMode);
    },

    refreshModuleSettings() {
        // Re-initialize modules with updated settings
        this.initializeModules();
    },

    async startModule(moduleId, isHistoryMode = false) { // Added isHistoryMode parameter
        this.removeCurrentModuleKeyboardListeners(); // Eliminar listeners del módulo anterior
        const moduleMeta = this.appInstance.allLearningModules.find(m => m.id === moduleId);
        if (!moduleMeta) return;

        try {
            const moduleWithData = await fetchModuleData(moduleId);
            if (!moduleWithData) {
                console.error(`Failed to load data for module ${moduleId}`);
                return;
            }

            // Shuffle module data if random mode is enabled
            if (this.learningCallbacks.randomMode && moduleWithData.data && Array.isArray(moduleWithData.data)) {
                this.learningCallbacks.shuffleArray(moduleWithData.data);
            }

            this.currentModule = moduleWithData;
            this.appInstance.currentModule = moduleWithData; // Actualizar currentModule de app

            // Update learningCallbacks with the current isHistoryMode state
            this.learningCallbacks.isHistoryMode = isHistoryMode; // Set the history mode

            switch (moduleWithData.learningMode) {
                case 'flashcard':
                    this.appInstance.currentView = 'flashcard';
                    document.body.classList.add('module-active');
                    document.getElementById('app-container').classList.remove('main-menu-active');
                    document.getElementById('app-container').innerHTML = '';
                    this.flashcardModule.init(moduleWithData);
                    this.appInstance.ui.updateFooterVisibility(this.appInstance.currentView);
                    break;
                case 'quiz':
                    this.appInstance.currentView = 'quiz';
                    document.body.classList.add('module-active');
                    document.getElementById('app-container').classList.remove('main-menu-active');
                    this.quizModule.init(moduleWithData);
                    this.appInstance.ui.updateFooterVisibility(this.appInstance.currentView);
                    break;
                case 'completion':
                    this.appInstance.currentView = 'completion';
                    document.body.classList.add('module-active');
                    document.getElementById('app-container').classList.remove('main-menu-active');
                    document.getElementById('app-container').innerHTML = ''; // Add this line
                    this.completionModule.init(moduleWithData);
                    this.appInstance.ui.updateFooterVisibility(this.appInstance.currentView);
                    break;
                case 'sorting':
                    // Si ya estamos en la vista de sorting y el contenedor existe, solo actualizar texto
                    if (this.appInstance.currentView === 'sorting' && document.getElementById('sorting-container')) {
                        this.sortingModule.updateText();
                        return;
                    }
                    this.appInstance.currentView = 'sorting';
                    document.body.classList.add('module-active');
                    document.getElementById('app-container').classList.remove('main-menu-active');
                    this.sortingModule.init(moduleWithData);
                    this.appInstance.ui.updateFooterVisibility(this.appInstance.currentView);
                    break;
                case 'matching':
                    this.appInstance.currentView = 'matching';
                    document.body.classList.add('module-active');
                    document.getElementById('app-container').classList.remove('main-menu-active');
                    this.matchingModule.init(moduleWithData);
                    this.appInstance.ui.updateFooterVisibility(this.appInstance.currentView);
                    break;
            }
        } catch (error) {
            console.error('Failed to load module data:', error);
        }
    },

    removeCurrentModuleKeyboardListeners() {
        switch (this.appInstance.currentView) { // Usar appInstance.currentView
            case 'flashcard':
                if (this.flashcardModule && typeof this.flashcardModule.removeKeyboardListeners === 'function') {
                    this.flashcardModule.removeKeyboardListeners();
                }
                break;
            case 'quiz':
                if (this.quizModule && typeof this.quizModule.removeKeyboardListeners === 'function') {
                    this.quizModule.removeKeyboardListeners();
                }
                break;
            case 'completion':
                if (this.completionModule && typeof this.completionModule.removeKeyboardListeners === 'function') {
                    this.completionModule.removeKeyboardListeners();
                }
                break;
            case 'sorting':
                if (this.sortingModule && typeof this.sortingModule.removeKeyboardListeners === 'function') {
                    this.sortingModule.removeKeyboardListeners();
                }
                break;
            case 'matching':
                if (this.matchingModule && typeof this.matchingModule.removeKeyboardListeners === 'function') {
                    this.matchingModule.removeKeyboardListeners();
                }
                break;
        }
    },

    replayModule() {
        if (this.currentModule) {
            this.startModule(this.currentModule.id);
        }
    }
};