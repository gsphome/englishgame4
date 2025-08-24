import { BaseComponent } from './BaseComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class HamburgerMenuComponent extends BaseComponent {
    constructor(app) {
        super();
        this.app = app;
        this.initElements();
        this.setupListeners();
    }

    initElements() {
        this.hamburgerMenu = document.getElementById('hamburger-menu');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.closeMenuBtn = document.getElementById('close-menu-btn');
        this.menuLangToggleBtn = document.getElementById('menu-lang-toggle-btn');
        this.menuLogoutBtn = document.getElementById('menu-logout-btn');
        this.menuRandomModeBtn = document.getElementById('menu-random-mode-btn');
        this.menuDarkModeToggleBtn = document.getElementById('menu-dark-mode-toggle-btn');
        this.aboutBtn = document.getElementById('menu-about-btn');
        this.menuSettingsBtn = document.getElementById('menu-settings-btn');
    }

    setupListeners() {
        if (this.closeMenuBtn) {
            this.addListener(this.closeMenuBtn, 'click', () => this.toggle(false));
        }
        if (this.menuOverlay) {
            this.addListener(this.menuOverlay, 'click', () => this.toggle(false));
        }
        if (this.menuLangToggleBtn) {
            this.addListener(this.menuLangToggleBtn, 'click', () => this.toggleLanguage());
        }
        if (this.menuRandomModeBtn) {
            this.addListener(this.menuRandomModeBtn, 'click', () => this.toggleRandomMode());
        }
        if (this.menuDarkModeToggleBtn) {
            this.addListener(this.menuDarkModeToggleBtn, 'click', () => this.toggleDarkMode());
        }
        if (this.menuLogoutBtn) {
            this.addListener(this.menuLogoutBtn, 'click', () => this.handleLogout());
        }
        if (this.aboutBtn) {
            this.addListener(this.aboutBtn, 'click', () => this.handleAbout());
        }
        if (this.menuSettingsBtn) {
            this.addListener(this.menuSettingsBtn, 'click', () => this.handleSettings());
        }
    }

    toggle(show) {
        document.body.classList.toggle('hamburger-menu-open', show);
    }

    toggleLanguage() {
        const newLang = MESSAGES.getLanguage() === 'en' ? 'es' : 'en';
        MESSAGES.setLanguage(newLang);
        localStorage.setItem('appLang', newLang);
        this.updateText();
        if (this.app.currentView === 'menu') {
            this.app.renderMenu();
        }
    }

    toggleRandomMode() {
        this.app.randomMode = !this.app.randomMode;
        localStorage.setItem('randomMode', this.app.randomMode);
        this.updateText();
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        this.updateText();
    }

    handleLogout() {
        this.toggle(false);
        const messageElement = document.getElementById('confirmation-message');
        const modal = document.getElementById('confirmation-modal');
        if (messageElement && modal) {
            messageElement.textContent = MESSAGES.get('confirmLogoutMessage');
            modal.classList.remove('hidden');
        }
    }

    handleAbout() {
        this.toggle(false);
        // Trigger through app to use UIManager
        if (this.app && this.app.ui) {
            this.app.ui.showAboutModal();
        }
    }

    handleSettings() {
        this.toggle(false);
        // Trigger through app to use UIManager
        if (this.app && this.app.ui) {
            this.app.ui.showSettingsModal();
        }
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