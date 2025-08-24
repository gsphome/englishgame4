import { BaseComponent } from './BaseComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class HeaderComponent extends BaseComponent {
    constructor(auth) {
        super();
        this.auth = auth;
        this.setupHamburgerListener();
    }

    setupHamburgerListener() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (hamburgerBtn) {
            this.addListener(hamburgerBtn, 'click', () => {
                document.body.classList.add('hamburger-menu-open');
            });
        }
    }

    render() {
        const user = this.auth.getUser();
        const scoreContainer = document.getElementById('score-container');
        const usernameDisplay = document.getElementById('username-display');
        const hamburgerBtn = document.getElementById('hamburger-btn');
    
        if (user) {
            this.showUserElements(scoreContainer, usernameDisplay, hamburgerBtn);
            this.renderUserInfo(user);
        } else {
            this.hideUserElements(scoreContainer, usernameDisplay, hamburgerBtn);
        }
    }

    showUserElements(scoreContainer, usernameDisplay, hamburgerBtn) {
        scoreContainer?.classList.remove('hidden');
        usernameDisplay?.classList.remove('hidden');
        hamburgerBtn?.classList.remove('hidden');
        this.setupHamburgerListener(); // Re-setup listener
    }

    hideUserElements(scoreContainer, usernameDisplay, hamburgerBtn) {
        scoreContainer?.classList.add('hidden');
        usernameDisplay?.classList.add('hidden');
        hamburgerBtn?.classList.add('hidden');
    }

    renderUserInfo(user) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const correctColor = isDarkMode ? 'text-green-400' : 'text-green-700';
        const incorrectColor = isDarkMode ? 'text-red-400' : 'text-red-700';

        const globalScoreEl = document.getElementById('global-score');
        if (globalScoreEl) {
            globalScoreEl.innerHTML = `
                <span class="text-sm font-semibold">${MESSAGES.get('globalScore')}:</span>
                <span class="ml-1 ${correctColor} font-bold">✅ ${user.globalScore.correct}</span>
                <span class="ml-1 ${incorrectColor} font-bold">❌ ${user.globalScore.incorrect}</span>
            `;
        }

        const usernameDisplayEl = document.getElementById('username-display');
        if (usernameDisplayEl) {
            usernameDisplayEl.innerHTML = `<span class="text-lg font-bold">${MESSAGES.get('userIcon')} ${user.username}</span>`;
        }
    }

    updateSessionScore(correct, incorrect, total) {
        const sessionScoreDisplay = document.getElementById('session-score-display');
        if (sessionScoreDisplay) {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const correctColor = isDarkMode ? 'text-green-400' : 'text-green-700';
            const incorrectColor = isDarkMode ? 'text-red-400' : 'text-red-700';
            const totalColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';

            sessionScoreDisplay.innerHTML = `
                <span class="text-sm font-semibold">${MESSAGES.get('sessionLabel')}:</span>
                <span class="ml-1 ${correctColor} font-bold">${MESSAGES.get('correctIcon')} ${correct}</span>
                <span class="ml-1 ${incorrectColor} font-bold">${MESSAGES.get('incorrectIcon')} ${incorrect}</span>
                <span class="ml-1 ${totalColor} font-bold">${MESSAGES.get('totalLabel')}: ${total}</span>
            `;
            sessionScoreDisplay.classList.remove('hidden');
        }
    }
}