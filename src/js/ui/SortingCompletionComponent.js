import { BaseComponent } from './BaseComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class SortingCompletionComponent extends BaseComponent {
    constructor(learningManager, app) {
        super();
        this.learningManager = learningManager;
        this.app = app;
        this.modal = document.getElementById('sorting-completion-modal');
    }

    show(moduleData) {
        if (!this.modal) return;

        const wordsContainer = this.createElement('div', 'mt-4 mb-4 text-left pr-4');
        wordsContainer.id = 'sorting-completion-words-container';

        this.updateText();
        this.setupButtonListeners();

        const existingContainer = this.modal.querySelector('#sorting-completion-words-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const presentedWords = this.learningManager.sortingModule.words;
        const wordsToExplain = moduleData.data.filter(item => presentedWords.includes(item.word));

        const categoryMap = new Map();
        this.learningManager.sortingModule.categories.forEach(cat => {
            categoryMap.set(cat.category_id, cat.category_show);
        });

        wordsToExplain.forEach(item => {
            const wordItem = this.createElement('div', 'sorting-summary-item-grid py-2 border-b border-gray-200 items-center');
            const categoryDisplayName = categoryMap.get(item.category) || 'N/A';
            wordItem.innerHTML = `
                <span class="text-sm text-gray-500 font-medium">${categoryDisplayName}</span>
                <span class="text-lg font-semibold">${item.word}</span>
                <span class="text-base text-gray-700 italic">${item.translation_es}</span>
                <button title="${MESSAGES.get('showExplanation')}" aria-label="${MESSAGES.get('showExplanation')}" class="explanation-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out text-sm justify-self-center mr-1">
                    &#x2139;
                </button>
            `;
            this.addListener(wordItem.querySelector('.explanation-btn'), 'click', () => {
                const explanationModal = document.getElementById('explanation-modal');
                this.showExplanationModal(explanationModal, item);
            });
            wordsContainer.appendChild(wordItem);
        });

        this.modal.querySelector('.flex.justify-center.space-x-4').before(wordsContainer);
        this.modal.classList.remove('hidden');
    }

    updateText() {
        const title = document.getElementById('sorting-completion-title');
        const message = document.getElementById('sorting-completion-message');
        const replayBtn = document.getElementById('sorting-completion-replay-btn');
        const backToMenuBtn = document.getElementById('sorting-completion-back-to-menu-btn');

        if (title) title.textContent = MESSAGES.get('sortingCompletionTitle');
        if (message) message.textContent = MESSAGES.get('sortingCompletionMessage');
        if (replayBtn) replayBtn.textContent = MESSAGES.get('replayButton');
        if (backToMenuBtn) backToMenuBtn.textContent = MESSAGES.get('backToMenu');
    }

    setupButtonListeners() {
        const replayBtn = document.getElementById('sorting-completion-replay-btn');
        const backToMenuBtn = document.getElementById('sorting-completion-back-to-menu-btn');

        if (replayBtn) {
            this.addListener(replayBtn, 'click', () => {
                this.modal.classList.add('hidden');
                this.learningManager.replayModule();
            });
        }

        if (backToMenuBtn) {
            this.addListener(backToMenuBtn, 'click', () => {
                this.modal.classList.add('hidden');
                this.app.renderMenu();
            });
        }
    }

    showExplanationModal(modalElement, wordData) {
        document.getElementById('explanation-word').textContent = wordData.word;
        document.getElementById('explanation-word-translation').textContent = wordData.translation_es;
        document.getElementById('explanation-example-en').textContent = `"${wordData.example}"`;
        document.getElementById('explanation-example-es').textContent = `"${wordData.example_es}"`;
        modalElement.classList.remove('hidden');
    }
}