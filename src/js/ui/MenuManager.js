// src/js/ui/MenuManager.js
import { BaseComponent } from './BaseComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class MenuManager extends BaseComponent {
    constructor(app) {
        super('#menu-overlay');
        this.app = app;
        this.hamburgerMenu = document.getElementById('hamburger-menu');
        this.closeMenuBtn = document.getElementById('close-menu-btn');
        this.menuLangToggleBtn = document.getElementById('menu-lang-toggle-btn');
        this.menuLogoutBtn = document.getElementById('menu-logout-btn');
        this.menuRandomModeBtn = document.getElementById('menu-random-mode-btn');
        this.menuDarkModeToggleBtn = document.getElementById('menu-dark-mode-toggle-btn');
        this.aboutBtn = document.getElementById('menu-about-btn');
        this.menuSettingsBtn = document.getElementById('menu-settings-btn');
        this.init();
    }

    init() {
        this.setupEventListeners();
        MESSAGES.addListener(() => this.updateText());
    }

    setupEventListeners() {
        if (this.closeMenuBtn) {
            this.addListener(this.closeMenuBtn, 'click', () => this.toggleMenu(false));
        }
        if (this.element) {
            this.addListener(this.element, 'click', () => this.toggleMenu(false));
        }
        if (this.menuLangToggleBtn) {
            this.addListener(this.menuLangToggleBtn, 'click', () => this.toggleLanguage());
        }
        if (this.menuLogoutBtn) {
            this.addListener(this.menuLogoutBtn, 'click', () => this.handleLogout());
        }
        if (this.menuRandomModeBtn) {
            this.addListener(this.menuRandomModeBtn, 'click', () => this.toggleRandomMode());
        }
        if (this.menuDarkModeToggleBtn) {
            this.addListener(this.menuDarkModeToggleBtn, 'click', () => this.toggleDarkMode());
        }
    }

    toggleMenu(show) {
        document.body.classList.toggle('hamburger-menu-open', show);
    }

    toggleLanguage() {
        const newLang = MESSAGES.getLanguage() === 'en' ? 'es' : 'en';
        MESSAGES.setLanguage(newLang);
        localStorage.setItem('appLang', newLang);
        if (this.app.currentView === 'menu') {
            this.app.renderMenu();
        }
    }

    handleLogout() {
        this.toggleMenu(false);
        this.app.modalManager.showConfirmation(
            MESSAGES.get('confirmLogoutMessage'),
            () => this.app.auth.logout()
        );
    }

    toggleRandomMode() {
        this.app.randomMode = !this.app.randomMode;
        localStorage.setItem('randomMode', this.app.randomMode);
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    }

    updateText() {
        if (this.menuLangToggleBtn) {
            const currentLang = MESSAGES.getLanguage();
            this.menuLangToggleBtn.innerHTML = currentLang === 'en' ? MESSAGES.get('languageEs') : MESSAGES.get('languageEn');
        }
        if (this.menuLogoutBtn) {
            this.menuLogoutBtn.innerHTML = `${MESSAGES.get('logoutButton')}${MESSAGES.get('logoutIcon')}`;
        }
        if (this.menuDarkModeToggleBtn) {
            const isDarkMode = document.body.classList.contains('dark-mode');
            this.menuDarkModeToggleBtn.innerHTML = isDarkMode ? 
                `${MESSAGES.get('lightMode')}${MESSAGES.get('lightModeIcon')}` : 
                `${MESSAGES.get('darkMode')}${MESSAGES.get('darkModeIcon')}`;
        }
        if (this.menuRandomModeBtn) {
            this.menuRandomModeBtn.innerHTML = `${MESSAGES.get('randomMode')} ${this.app.randomMode ? MESSAGES.get('onText') : MESSAGES.get('offText')}`;
        }
        if (this.aboutBtn) {
            this.aboutBtn.innerHTML = `${MESSAGES.get('aboutButton')} ${MESSAGES.aboutIcon}`;
        }
        if (this.menuSettingsBtn) {
            this.menuSettingsBtn.innerHTML = `${MESSAGES.get('settingsButton')} ${MESSAGES.settingsIcon}`;
        }
    }
}