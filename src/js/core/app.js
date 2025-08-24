import { auth } from './auth.js';
import { MESSAGES } from '../utils/i18n.js';
import { UIManager } from '../ui/UIManager.js';
import { learningManager } from './learningManager.js'; // Import learningManager module
import { settingsManager } from '../managers/settingsManager.js'; // Import settingsManager module

import { shuffleArray, getLearningModeIconSvg } from '../utils/utils.js';
import { fetchAllLearningModules, fetchAppConfig, getAppConfig, filterModulesBySettings } from '../managers/dataManager.js'; // fetchModuleData moved to learningManager

/**
 * @file Manages the main application flow, module initialization, and global state.
 * @namespace app
 */
export const app = {
    shuffleArray: shuffleArray, // Still a property of app, used by learningManager
    modal: null, // Confirmation modal reference
    menuScrollPosition: 0,
    currentView: null,
    currentModule: null, // Now updated by learningManager
    randomMode: true,
    startX: 0, // For swipe listeners
    startY: 0, // For swipe listeners
    allLearningModules: null, // Fetched from dataManager

    /**
     * Initializes the main application, setting up modals, authentication, learning modules, and event listeners.
     * @returns {Promise<void>}
     */
    async init() {
        await fetchAppConfig(); // Load app configuration
        const appConfig = getAppConfig();

        // Await settingsManager.loadSettings() here
        await settingsManager.loadSettings(); // <--- ADD THIS LINE

        // Set default language based on config or local storage
        const storedLang = localStorage.getItem('appLang');
        const initialLang = storedLang || appConfig.defaultLanguage;
        MESSAGES.setLanguage(initialLang);

        this.modal = document.getElementById('confirmation-modal');
        auth.init();
        this.allLearningModules = await fetchAllLearningModules();

        this.ui = new UIManager(auth, learningManager, this); // Initialize UI module
        learningManager.init(this, appConfig.learningSettings); // Initialize LearningManager, pass app instance and learning settings
        window.learningManager = learningManager; // Expose globally for settings updates

        // All learning module instantiation moved to learningManager.init()
        // All learningCallbacks are now handled by learningManager

        this.addKeyboardListeners(); // Add this line to initialize global keyboard listeners

        // Initial user check and rendering
        auth.user = JSON.parse(localStorage.getItem('user'));
        this.ui.renderHeader();
        if (!auth.user) {
            auth.renderLogin();
        } else {
            this.renderMenu();
        }
    },

    renderCurrentView() {
        switch (this.currentView) {
            case 'menu':
                document.body.classList.remove('module-active');
                this.renderMenu();
                break;
            case 'flashcard':
                // Delegated to learningManager.startModule
                learningManager.startModule(this.currentModule.id);
                break;
            case 'quiz':
                // Delegated to learningManager.startModule
                learningManager.startModule(this.currentModule.id);
                break;
            case 'completion':
                // Delegated to learningManager.startModule
                learningManager.startModule(this.currentModule.id);
                break;
            case 'sorting':
                // Delegated to learningManager.startModule
                learningManager.startModule(this.currentModule.id);
                break;
            case 'matching':
                // Delegated to learningManager.startModule
                learningManager.startModule(this.currentModule.id);
                break;
        }
    },

    // renderFlashcard method moved to learningManager.startModule
    // renderQuiz method moved to learningManager.startModule
    // renderCompletion method moved to learningManager.startModule
    // renderSorting method moved to learningManager.startModule
    // renderMatching method moved to learningManager.startModule

    renderMenu() {
        learningManager.removeCurrentModuleKeyboardListeners(); // Use learningManager's method
        document.body.classList.remove('module-active');
        this.currentView = 'menu';
        const sessionScoreDisplay = document.getElementById('session-score-display');
        if (sessionScoreDisplay) {
            sessionScoreDisplay.classList.add('hidden');
        }
        const appContainer = document.getElementById('app-container');

        const template = document.getElementById('main-menu-template');
        const menuContent = template.content.cloneNode(true);

        menuContent.getElementById('main-menu-title').textContent = MESSAGES.get('mainMenu');

        const moduleButtonsContainer = menuContent.getElementById('module-buttons-container');
        const colors = ['bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-teal-600', 'bg-cyan-600', 'bg-emerald-600'];

        // Filter modules based on current settings
        const filteredModules = filterModulesBySettings(this.allLearningModules, settingsManager.settings);
        
        filteredModules.forEach((module, index) => {
            const colorClass = colors[index % colors.length];
            const icon = module.icon || MESSAGES.get('defaultModuleIcon');
            const description = module.description || '';

            const buttonTemplate = document.getElementById('module-button-template');
            const button = buttonTemplate.content.cloneNode(true).querySelector('button');

            button.classList.add(colorClass);
            button.dataset.moduleId = module.id;

            if (index <= 25) {
                button.querySelector('[data-module-index]').textContent = `${String.fromCharCode(65 + index)}.`;
            }
            button.querySelector('[data-module-name]').textContent = module.name.replace(MESSAGES.get('flashcardPrefix'), '').replace(MESSAGES.get('quizPrefix'), '').replace(MESSAGES.get('completionPrefix'), '');
            button.querySelector('[data-game-mode-icon]').innerHTML = getLearningModeIconSvg(module.learningMode);

            moduleButtonsContainer.appendChild(button);
        });

        appContainer.innerHTML = '';
        appContainer.appendChild(menuContent);
        appContainer.classList.add('main-menu-active');

        const hamburgerMenu = document.getElementById('hamburger-menu');
        if (hamburgerMenu) {
            hamburgerMenu.classList.remove('hidden');
        }

        const scrollWrapper = document.getElementById('main-menu-scroll-wrapper');
        if (scrollWrapper) {
            scrollWrapper.scrollTop = this.menuScrollPosition;
        }

        document.querySelectorAll('[data-module-id]').forEach(button => {
            button.addEventListener('click', () => {
                const currentScrollWrapper = document.getElementById('main-menu-scroll-wrapper');
                if (currentScrollWrapper) {
                    this.menuScrollPosition = currentScrollWrapper.scrollTop;
                }
                const moduleId = button.dataset.moduleId;
                learningManager.startModule(moduleId); // Use learningManager's method
            });
        });
        this.ui.updateFooterVisibility(this.currentView);
    },

    getMenuMaxWidth() {
        const width = window.innerWidth;
        if (ui.isMobile()) {
            return '300px';
        }
        if (width >= 768 && width < 1024) {
            return '582px';
        }
        return '760px';
    },

    // startModule method moved to learningManager.js

    handleEscapeKeyForMainMenu() {
        const modal = document.getElementById('confirmation-modal');
        const messageElement = document.getElementById('confirmation-message');
        messageElement.textContent = MESSAGES.get('confirmLogoutMessage');
        modal.classList.remove('hidden');
    },

    addKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            const explanationModal = document.getElementById('explanation-modal');
            const sortingCompletionModal = document.getElementById('sorting-completion-modal');
            const modal = document.getElementById('confirmation-modal');
            const isMainMenuActive = document.getElementById('app-container').classList.contains('main-menu-active');
            const isAnyModalOpen = (explanationModal && !explanationModal.classList.contains('hidden')) ||
                                   (sortingCompletionModal && !sortingCompletionModal.classList.contains('hidden')) ||
                                   (!modal.classList.contains('hidden'));

            if (e.key === 'Escape' || e.key === 'Enter') {
                // Check explanation modal first (highest priority)
                const explanationModalElement = document.getElementById('explanation-modal');
                if (explanationModalElement && !explanationModalElement.classList.contains('hidden')) {
                    explanationModalElement.classList.add('hidden');
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
            
            if (e.key === 'Escape') {
                if (isMainMenuActive && !isAnyModalOpen && !document.body.classList.contains('hamburger-menu-open')) {
                    // If main menu is active and no other modals/menus are open, trigger logout
                    this.handleEscapeKeyForMainMenu();
                } else if (sortingCompletionModal && !sortingCompletionModal.classList.contains('hidden')) {
                    document.getElementById('sorting-completion-back-to-menu-btn').click();
                } else if (!modal.classList.contains('hidden')) {
                    modal.classList.add('hidden');
                } else if (document.body.classList.contains('hamburger-menu-open')) {
                    this.ui.toggleHamburgerMenu(false);
                } else if (this.currentView === 'sorting') {
                    this.renderMenu();
                } else {
                    this.renderMenu();
                }
            } else if (e.key === '.') {
                const newLang = MESSAGES.getLanguage() === 'en' ? 'es' : 'en';
                MESSAGES.setLanguage(newLang);
                localStorage.setItem('appLang', newLang);
                this.renderCurrentView();
                this.ui.updateAllTexts();
            } else if (this.currentView === 'menu') {
                const pressedKey = e.key.toUpperCase();
                const moduleButtons = document.querySelectorAll('[data-module-id]');
                moduleButtons.forEach((button, index) => {
                    if (String.fromCharCode(65 + index) === pressedKey) {
                        button.click();
                    }
                });
            }
        });
    },

    addSwipeListeners() {
        const appContainer = document.getElementById('app-container');
        const SWIPE_THRESHOLD = 50; // pixels

        appContainer.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        });

        appContainer.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const diffX = endX - this.startX;
            const diffY = endY - this.startY;

            // Determine if it's a horizontal or vertical swipe
            if (Math.abs(diffX) > Math.abs(diffY)) { // Horizontal swipe
                if (Math.abs(diffX) > SWIPE_THRESHOLD) {
                    if (diffX > 0) { // Swiped right (prev)
                        if (this.currentView === 'flashcard') {
                            learningManager.flashcardModule.prev(); // Use learningManager's module
                        }
                    } else { // Swiped left (next)
                        if (this.currentView === 'flashcard') {
                            learningManager.flashcardModule.next(); // Use learningManager's module
                        }
                    }
                }
            } else { // Vertical swipe (for flashcard flip)
                if (Math.abs(diffY) > SWIPE_THRESHOLD) {
                    if (this.currentView === 'flashcard') {
                        learningManager.flashcardModule.flip(); // Use learningManager's module
                    }
                }
            }
        });
    },

    // removeCurrentModuleKeyboardListeners method moved to learningManager.js
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

window.app = app;