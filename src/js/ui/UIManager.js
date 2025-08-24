// Main UI Manager that coordinates all UI components
import { HeaderComponent } from './HeaderComponent.js';
import { HamburgerMenuComponent } from './HamburgerMenuComponent.js';
import { ConfirmationModalComponent } from './ConfirmationModalComponent.js';
import { LearningSummaryComponent } from './LearningSummaryComponent.js';
import { FooterComponent } from './FooterComponent.js';
import { SortingCompletionComponent } from './SortingCompletionComponent.js';
import { ExplanationModalComponent } from './ExplanationModalComponent.js';
import { AboutModalComponent } from './AboutModalComponent.js';
import { SettingsModalComponent } from './SettingsModalComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class UIManager {
    constructor(auth, learningManager, app) {
        this.auth = auth;
        this.learningManager = learningManager;
        this.app = app;
        this.components = {};
        this.init();
    }

    init() {
        // Initialize all components
        this.components.header = new HeaderComponent(this.auth);
        this.components.hamburgerMenu = new HamburgerMenuComponent(this.app);
        this.components.confirmationModal = new ConfirmationModalComponent(this.auth);
        this.components.learningSummary = new LearningSummaryComponent(this.learningManager, this.app);
        this.components.footer = new FooterComponent();
        this.components.sortingCompletion = new SortingCompletionComponent(this.learningManager, this.app);
        this.components.explanationModal = new ExplanationModalComponent();
        this.components.aboutModal = new AboutModalComponent();
        this.components.settingsModal = new SettingsModalComponent();

        // Setup i18n listeners
        this.setupI18nListeners();
        
        // Initial updates
        this.updateAllTexts();
    }

    setupI18nListeners() {
        MESSAGES.addListener(() => this.updateAllTexts());
    }

    updateAllTexts() {
        this.components.header.render();
        this.components.hamburgerMenu.updateText();
        this.components.confirmationModal.updateText();
        this.components.footer.updateText();
    }

    // Delegate methods to specific components
    renderHeader() {
        this.components.header.render();
    }

    updateSessionScoreDisplay(correct, incorrect, total) {
        this.components.header.updateSessionScore(correct, incorrect, total);
    }

    toggleHamburgerMenu(show) {
        this.components.hamburgerMenu.toggle(show);
    }

    showLogoutConfirmation() {
        this.components.confirmationModal.showLogoutConfirmation();
    }

    showFlashcardSummary(count) {
        this.components.learningSummary.showFlashcardSummary(count);
    }

    showMatchingSummary(matchedPairs, moduleData) {
        this.components.learningSummary.showMatchingSummary(matchedPairs, moduleData);
    }

    updateFooterVisibility(currentView) {
        this.components.footer.updateVisibility(currentView);
    }

    showSortingCompletionModal(moduleData) {
        this.components.sortingCompletion.show(moduleData);
    }

    showAboutModal() {
        this.components.aboutModal.show();
    }

    showSettingsModal() {
        this.components.settingsModal.show();
    }

    // Utility methods
    isMobile() {
        return window.innerWidth <= 768;
    }

    // Legacy methods for backward compatibility
    toggleModal(modalElement, show) {
        if (modalElement) {
            modalElement.classList.toggle('hidden', !show);
        }
    }

    showExplanationModal(modalElement, wordData) {
        this.components.explanationModal.show(wordData);
    }

    // Cleanup method
    destroy() {
        Object.values(this.components).forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
    }
}