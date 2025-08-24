import { MESSAGES } from '../utils/i18n.js';
import { app } from './app.js';
// UI methods accessed through app instance

export const auth = {
    user: null,

    init() {
        
        // Set initial language (e.g., from localStorage or default)
        const savedLang = localStorage.getItem('appLang');
        
        if (savedLang) {
            MESSAGES.setLanguage(savedLang);
        } else {
            MESSAGES.setLanguage('en'); // Default to English
        }

        this.user = JSON.parse(localStorage.getItem('user'));

        MESSAGES.addListener(() => {
            if (!this.user) {
                this.renderLogin();
            }
        });

        if (!this.user) {
            this.renderLogin();
        } else {
            // game.init(); // Removed: game.init() is now called directly in game.js after DOMContentLoaded
        }
    },

    renderLogin() {
        
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = `
            <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center relative overflow-hidden">
                <!-- Optional: Subtle background pattern/texture -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50 z-0"></div>

                <div class="relative z-10">
                    <!-- App Logo/Icon - Place your logo at assets/logo.png -->
                    <div class="mx-auto mb-4 w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 dark:from-blue-600 dark:to-purple-800 shadow-lg">
                        <img src="src/assets/images/logo.png" alt="${MESSAGES.get('appLogoAlt')}" class="w-20 h-20 rounded-full object-cover">
                    </div>

                    <h1 class="text-3xl font-extrabold text-blue-700 mb-2">${MESSAGES.get('welcomeTitle')}</h1>
                    <p class="text-gray-600 mb-6">${MESSAGES.get('welcomeSubtitle')}</p>

                    <input type="text" id="username-input" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out" placeholder="${MESSAGES.get('usernamePlaceholder')}">
                    <button id="login-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg shadow-md transform hover:scale-105 transition duration-200 ease-in-out">${MESSAGES.get('loginButton')}</button>
                </div>
            </div>
        `;
        

        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('username-input');

        loginBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (username) {
                this.login(username);
            }
        });

        usernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });

        // Set focus on the username input field
        usernameInput.focus();
    },

    login(username) {
        this.user = {
            username,
            globalScore: { correct: 0, incorrect: 0 }
        };
        localStorage.setItem('user', JSON.stringify(this.user));
        app.ui.renderHeader(); // Update header with logged-in user info
        // game.init(); // Removed: game.init() is now called directly in game.js after DOMContentLoaded
        app.renderMenu(); // Render the menu after login
    },

    _internalReloadPage() {
        location.reload();
    },

    _reloadPage(reloadFn = this._internalReloadPage) {
        reloadFn();
    },

    logout() {
        localStorage.removeItem('user');
        const hamburgerMenu = document.getElementById('hamburger-menu');
        if (hamburgerMenu) {
            hamburgerMenu.classList.add('hidden'); // Hide hamburger menu on logout
        }
        this._reloadPage();
    },

    getUser() {
        return this.user;
    },

    updateGlobalScore(sessionScore) {
        this.user.globalScore.correct += sessionScore.correct;
        this.user.globalScore.incorrect += sessionScore.incorrect;
        localStorage.setItem('user', JSON.stringify(this.user));
        app.ui.renderHeader();
    }
};