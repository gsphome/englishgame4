// src/js/ui/SummaryManager.js
import { BaseComponent } from './BaseComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class SummaryManager {
    constructor(app) {
        this.app = app;
        this.flashcardSummary = new FlashcardSummary(app);
        this.matchingSummary = new MatchingSummary(app);
        this.sortingSummary = new SortingSummary(app);
    }

    showFlashcardSummary(count) {
        this.flashcardSummary.show(count);
    }

    showMatchingSummary(matchedPairs, moduleData) {
        this.matchingSummary.show(matchedPairs, moduleData);
    }

    showSortingSummary(moduleData) {
        this.sortingSummary.show(moduleData);
    }
}

class FlashcardSummary extends BaseComponent {
    constructor(app) {
        super('#flashcard-summary-container');
        this.app = app;
        this.init();
    }

    init() {
        const replayBtn = document.getElementById('flashcard-summary-replay-btn');
        const backToMenuBtn = document.getElementById('flashcard-summary-back-to-menu-btn');

        if (replayBtn) {
            this.addListener(replayBtn, 'click', () => {
                this.hide();
                this.app.learningManager.replayModule();
            });
        }
        if (backToMenuBtn) {
            this.addListener(backToMenuBtn, 'click', () => {
                this.hide();
                this.app.renderMenu();
            });
        }
        MESSAGES.addListener(() => this.updateText());
    }

    show(count) {
        const messageElement = document.getElementById('flashcard-summary-message');
        if (messageElement) {
            messageElement.textContent = MESSAGES.get('flashcardSummaryMessage', { count });
        }
        super.show();
    }

    updateText() {
        const replayBtn = document.getElementById('flashcard-summary-replay-btn');
        const backToMenuBtn = document.getElementById('flashcard-summary-back-to-menu-btn');
        
        if (replayBtn) replayBtn.textContent = MESSAGES.get('replayButton');
        if (backToMenuBtn) backToMenuBtn.textContent = MESSAGES.get('backToMenu');
    }
}

class MatchingSummary {
    constructor(app) {
        this.app = app;
    }

    show(matchedPairs, moduleData) {
        let modal = document.getElementById('matching-completion-modal');
        if (!modal) {
            modal = this.createModal();
        }
        this.populateModal(modal, matchedPairs, moduleData);
        modal.classList.remove('hidden');
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'matching-completion-modal';
        modal.className = 'fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50 hidden';
        modal.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-xl max-w-xl w-full text-center">
                <h2 id="matching-completion-title" class="text-2xl font-bold mb-4"></h2>
                <p id="matching-completion-message" class="text-xl mb-4"></p>
                <div class="mb-4 text-left max-h-60 overflow-y-auto pr-2">
                    <div class="grid grid-cols-2 gap-2 font-bold border-b-2 border-gray-300 pb-2 mb-2">
                        <span></span><span></span>
                    </div>
                    <div id="matched-pairs-grid" class="grid grid-cols-2 gap-2"></div>
                </div>
                <div class="flex justify-center space-x-4">
                    <button id="matching-completion-replay-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"></button>
                    <button id="matching-completion-back-to-menu-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg shadow-md transition duration-200 ease-in-out"></button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.setupModalListeners(modal);
        return modal;
    }

    setupModalListeners(modal) {
        modal.querySelector('#matching-completion-replay-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
            this.app.learningManager.startModule(this.app.currentModule.id);
        });
        modal.querySelector('#matching-completion-back-to-menu-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
            this.app.renderMenu();
        });
    }

    populateModal(modal, matchedPairs, moduleData) {
        modal.querySelector('#matching-completion-title').textContent = MESSAGES.get('sessionScore');
        modal.querySelector('#matching-completion-message').textContent = MESSAGES.get('matchingCompletionMessage');
        modal.querySelector('#matching-completion-replay-btn').textContent = MESSAGES.get('replayButton');
        modal.querySelector('#matching-completion-back-to-menu-btn').textContent = MESSAGES.get('backToMenu');

        const matchedPairsGrid = modal.querySelector('#matched-pairs-grid');
        matchedPairsGrid.innerHTML = '';

        matchedPairs.forEach(pair => {
            const termData = moduleData.data.find(item => item.id === pair.termId);
            if (termData) {
                const termSpan = document.createElement('span');
                termSpan.className = 'font-semibold';
                termSpan.textContent = termData.term;
                matchedPairsGrid.appendChild(termSpan);

                const translationContainer = document.createElement('div');
                translationContainer.className = 'flex items-center justify-between';
                translationContainer.innerHTML = `
                    <span>${termData.term_es}</span>
                    <button class="explanation-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-sm">&#x2139;</button>
                `;
                matchedPairsGrid.appendChild(translationContainer);
            }
        });
    }
}

class SortingSummary extends BaseComponent {
    constructor(app) {
        super('#sorting-completion-modal');
        this.app = app;
        this.init();
    }

    init() {
        const replayBtn = document.getElementById('sorting-completion-replay-btn');
        const backToMenuBtn = document.getElementById('sorting-completion-back-to-menu-btn');

        if (replayBtn) {
            this.addListener(replayBtn, 'click', () => {
                this.hide();
                this.app.learningManager.startModule(this.app.currentModule.id);
            });
        }
        if (backToMenuBtn) {
            this.addListener(backToMenuBtn, 'click', () => {
                this.hide();
                this.app.renderMenu();
            });
        }
    }

    show(moduleData) {
        this.updateText();
        this.populateWords(moduleData);
        super.show();
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

    populateWords(moduleData) {
        const existingContainer = this.element.querySelector('#sorting-completion-words-container');
        if (existingContainer) existingContainer.remove();

        const wordsContainer = document.createElement('div');
        wordsContainer.id = 'sorting-completion-words-container';
        wordsContainer.className = 'mt-4 mb-4 text-left pr-4';

        const presentedWords = this.app.learningManager.sortingModule.words;
        const wordsToExplain = moduleData.data.filter(item => presentedWords.includes(item.word));

        wordsToExplain.forEach(item => {
            const wordItem = document.createElement('div');
            wordItem.className = 'sorting-summary-item-grid py-2 border-b border-gray-200 items-center';
            wordItem.innerHTML = `
                <span class="text-lg font-semibold">${item.word}</span>
                <span class="text-base text-gray-700 italic">${item.translation_es}</span>
                <button class="explanation-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">&#x2139;</button>
            `;
            wordsContainer.appendChild(wordItem);
        });

        this.element.querySelector('.flex.justify-center.space-x-4').before(wordsContainer);
    }
}