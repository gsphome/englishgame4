import { BaseComponent } from './BaseComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class LearningSummaryComponent extends BaseComponent {
    constructor(learningManager, app) {
        super();
        this.learningManager = learningManager;
        this.app = app;
    }

    showExplanationModal(modalElement, wordData) {
        document.getElementById('explanation-word').textContent = wordData.word || wordData.term;
        document.getElementById('explanation-word-translation').textContent = wordData.translation_es || wordData.term_es;
        document.getElementById('explanation-example-en').textContent = `"${wordData.example || wordData.explanation}"`;
        document.getElementById('explanation-example-es').textContent = `"${wordData.example_es || wordData.explanation_es}"`;
        modalElement.classList.remove('hidden');
    }

    showFlashcardSummary(count) {
        const container = document.getElementById('flashcard-summary-container');
        if (!container) return;

        const messageElement = document.getElementById('flashcard-summary-message');
        const replayBtn = document.getElementById('flashcard-summary-replay-btn');
        const backToMenuBtn = document.getElementById('flashcard-summary-back-to-menu-btn');

        if (messageElement) {
            messageElement.textContent = MESSAGES.get('flashcardSummaryMessage', { count });
        }

        if (replayBtn) {
            replayBtn.textContent = MESSAGES.get('replayButton');
            replayBtn.onclick = () => {
                container.classList.add('hidden');
                this.learningManager.replayModule();
            };
        }

        if (backToMenuBtn) {
            backToMenuBtn.textContent = MESSAGES.get('backToMenu');
            backToMenuBtn.onclick = () => {
                container.classList.add('hidden');
                this.app.renderMenu();
            };
        }

        container.classList.remove('hidden');
    }

    showMatchingSummary(matchedPairs, moduleData) {
        let modal = document.getElementById('matching-completion-modal');
        if (!modal) {
            modal = this.createMatchingModal();
        }

        this.updateMatchingModalContent(modal, matchedPairs, moduleData);
        modal.classList.remove('hidden');
    }

    createMatchingModal() {
        const modal = this.createElement('div', 'fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50 hidden');
        modal.id = 'matching-completion-modal';
        modal.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-xl max-w-xl w-full text-center">
                <h2 id="matching-completion-title" class="text-2xl font-bold mb-4"></h2>
                <p id="matching-completion-message" class="text-xl mb-4"></p>
                <div class="mb-4 text-left max-h-60 overflow-y-auto pr-2">
                    <div class="grid grid-cols-2 gap-2 font-bold border-b-2 border-gray-300 pb-2 mb-2">
                        <span></span>
                        <span></span>
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
        this.setupMatchingModalListeners(modal);
        return modal;
    }

    setupMatchingModalListeners(modal) {
        const replayBtn = modal.querySelector('#matching-completion-replay-btn');
        const backToMenuBtn = modal.querySelector('#matching-completion-back-to-menu-btn');

        if (replayBtn) {
            this.addListener(replayBtn, 'click', () => {
                modal.classList.add('hidden');
                this.learningManager.startModule(this.app.currentModule.id);
            });
        }

        if (backToMenuBtn) {
            this.addListener(backToMenuBtn, 'click', () => {
                modal.classList.add('hidden');
                this.app.renderMenu();
            });
        }
    }

    updateMatchingModalContent(modal, matchedPairs, moduleData) {
        modal.querySelector('#matching-completion-title').textContent = MESSAGES.get('sessionScore');
        modal.querySelector('#matching-completion-message').textContent = MESSAGES.get('matchingCompletionMessage');
        modal.querySelector('#matching-completion-replay-btn').textContent = MESSAGES.get('replayButton');
        modal.querySelector('#matching-completion-back-to-menu-btn').textContent = MESSAGES.get('backToMenu');

        const grid = modal.querySelector('#matched-pairs-grid');
        grid.innerHTML = '';

        matchedPairs.forEach(pair => {
            const termData = moduleData.data.find(item => item.id === pair.termId);
            if (termData) {
                this.addMatchedPairToGrid(grid, termData);
            }
        });
    }

    addMatchedPairToGrid(grid, termData) {
        const termSpan = this.createElement('span', 'font-semibold', termData.term);
        grid.appendChild(termSpan);

        const translationContainer = this.createElement('div', 'flex items-center justify-between');
        const translationSpan = this.createElement('span', '', termData.term_es);
        translationContainer.appendChild(translationSpan);

        const explanationButton = this.createElement('button', 'explanation-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-sm justify-self-center mr-1', '&#x2139;');
        explanationButton.title = MESSAGES.get('showExplanation');
        explanationButton.ariaLabel = MESSAGES.get('showExplanation');
        
        this.addListener(explanationButton, 'click', () => {
            const explanationModal = document.getElementById('explanation-modal');
            this.showExplanationModal(explanationModal, termData);
        });

        translationContainer.appendChild(explanationButton);
        grid.appendChild(translationContainer);
    }
}