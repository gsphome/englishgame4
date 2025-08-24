// src/js/modules/FlashcardModule.js

class FlashcardMode {
    constructor(authInstance, messagesInstance, learningCallbacks, settings) {
        this.auth = authInstance;
        this.MESSAGES = messagesInstance;
        this.learningCallbacks = learningCallbacks; // Object containing specific game functions
        this.settings = settings; // New: Store game settings

        this.currentIndex = 0;
        this.moduleData = null;
        this.appContainer = null;
        this.isTransitioning = false;
        this.sessionScore = { correct: 0, incorrect: 0 };
    }

    /**
     * Initializes the Flashcard module with the given module data.
     * @param {object} module - The module data containing flashcards.
     */
    init(module) {
        this.currentIndex = 0;
        this.moduleData = module;
        this.appContainer = document.getElementById('app-container');
        this.isTransitioning = false;
        this.sessionScore = { correct: 0, incorrect: 0 }; // Initialize session score
        if (this.learningCallbacks.randomMode && Array.isArray(this.moduleData.data)) {
            this.moduleData.data = this.learningCallbacks.shuffleArray([...this.moduleData.data]);
        }
        // Limit the number of flashcards based on settings
        if (this.settings && this.settings.wordCount && this.moduleData.data.length > this.settings.wordCount) {
            this.moduleData.data = this.moduleData.data.slice(0, this.settings.wordCount);
        }
        this.render();
        this.addKeyboardListeners(); // Add this line
        this.MESSAGES.addListener(this.updateText.bind(this));
    }

    render() {
        if (!this.moduleData || !Array.isArray(this.moduleData.data) || this.moduleData.data.length === 0) {
            console.error("Flashcard module data is invalid or empty.");
            this.learningCallbacks.renderMenu();
            return;
        }
        const cardData = this.moduleData.data[this.currentIndex];
        this.appContainer.classList.remove('main-menu-active');

        // Check if the flashcard view is already rendered
        // Check if the flashcard view is already rendered
        if (!document.getElementById('flashcard-container')) { // Assuming a main container for flashcard view
            this.appContainer.innerHTML = `
                <div id="flashcard-container" class="max-w-2xl mx-auto">
                    <div class="flashcard h-64 w-full cursor-pointer shadow-lg rounded-xl">
                        <div class="flashcard-inner">
                            <div class="flashcard-front bg-white">
                                <p class="flashcard-en-word text-base md:text-xl" id="flashcard-front-text">${cardData.en}</p>
                                <p class="text-sm text-gray-500 md:text-lg" id="flashcard-front-ipa">${cardData.ipa}</p>
                            </div>
                            <div class="flashcard-back bg-blue-100">
                                <div>
                                    <p class="flashcard-en-word text-base md:text-xl" id="flashcard-back-en-text">${cardData.en}</p>
                                    <p class="text-sm text-gray-500 md:text-lg" id="flashcard-back-ipa">${cardData.ipa}</p>
                                    <p class="text-base font-bold md:text-xl" id="flashcard-back-text">${cardData.es}</p>
                                    <p class="mt-1 italic text-sm md:mt-2" id="flashcard-example">"${cardData.example}"</p>
                                    <p class="text-gray-500 italic" id="flashcard-example-es">"${cardData.example_es}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between mt-4">
                        <button id="prev-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-5 rounded-lg shadow-md transition duration-200 ease-in-out">
                            ${this.MESSAGES.get('prevButton')}
                        </button>
                        <button id="next-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-5 rounded-lg shadow-md transition duration-200 ease-in-out">
                            ${this.MESSAGES.get('nextButton')}
                        </button>
                    </div>
                     <button id="back-to-menu-flashcard-btn" class="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg shadow-md transition duration-200 ease-in-out">${this.MESSAGES.get('backToMenu')}</button>
                </div>
            `;
            // Event listeners should be attached here, inside this if block
            document.getElementById('prev-btn').addEventListener('click', () => this.prev());
            document.getElementById('next-btn').addEventListener('click', () => this.next());
            document.getElementById('back-to-menu-flashcard-btn').addEventListener('click', () => this.learningCallbacks.renderMenu());

            const flashcardElement = document.querySelector('.flashcard');
            if (flashcardElement) {
                flashcardElement.addEventListener('click', () => this.flip());
            }
        }
        // Update existing text content by re-rendering innerHTML of front and back
        const flashcardFront = document.querySelector('.flashcard-front');
        const flashcardBack = document.querySelector('.flashcard-back');

        if (flashcardFront) {
            flashcardFront.innerHTML = `
                <p class="flashcard-en-word text-base md:text-xl" id="flashcard-front-text">${cardData.en}</p>
                <p class="text-sm text-gray-500 md:text-lg" id="flashcard-front-ipa">${cardData.ipa}</p>
                <p class="mt-1 italic text-sm md:mt-2" id="flashcard-example">"${cardData.example}"</p>
            `;
        }

        if (flashcardBack) {
            flashcardBack.innerHTML = `
                <div>
                    <p class="flashcard-en-word text-base md:text-xl" id="flashcard-back-en-text">${cardData.en}</p>
                    <p class="text-sm text-gray-500 md:text-lg" id="flashcard-back-ipa">${cardData.ipa}</p>
                    <p class="text-base font-bold md:text-xl" id="flashcard-back-text">${cardData.es}</p>
                    <p class="mt-1 italic text-sm md:mt-2" id="flashcard-example">"${cardData.example}"</p>
                    <p class="text-gray-500 italic" id="flashcard-example-es">"${cardData.example_es}"</p>
                </div>
            `;
        }

        this.learningCallbacks.updateSessionScoreDisplay(0, 0, this.moduleData.data.length);

        // Update button texts regardless of whether the container was just created or already existed
        document.getElementById('prev-btn').textContent = this.MESSAGES.get('prevButton');
        document.getElementById('next-btn').textContent = this.MESSAGES.get('nextButton');
        document.getElementById('back-to-menu-flashcard-btn').textContent = this.MESSAGES.get('backToMenu');

        // Add card-active class after rendering or updating
        const card = this.appContainer.querySelector('.flashcard');
        if (card) {
            card.classList.add('card-active');
        }
    }

    prev() {
        if (this.isTransitioning || this.currentIndex <= 0) return;
        this.isTransitioning = true;

        const card = this.appContainer.querySelector('.flashcard');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;

        if (card) {
            if (card.classList.contains('flipped')) {
                card.classList.remove('flipped');
            }
            card.classList.add('flash-effect');
        }

        setTimeout(() => {
            if (card) card.classList.remove('flash-effect');
            this.currentIndex--;
            this.render();

            // Re-enable buttons after rendering the new card
            const newPrevBtn = document.getElementById('prev-btn');
            const newNextBtn = document.getElementById('next-btn');
            if (newPrevBtn) newPrevBtn.disabled = false;
            if (newNextBtn) newNextBtn.disabled = false;
            this.isTransitioning = false;
        }, 300); // Duration of the flash effect
    }

    next() {
        if (this.isTransitioning) return;

        if (this.currentIndex >= this.moduleData.data.length - 1) {
            this.learningCallbacks.showFlashcardSummary(this.moduleData.data.length);
            return;
        }

        this.isTransitioning = true;

        const card = this.appContainer.querySelector('.flashcard');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;

        if (card) {
            if (card.classList.contains('flipped')) {
                card.classList.remove('flipped');
            }
            card.classList.add('flash-effect');
        }

        setTimeout(() => {
            if (card) card.classList.remove('flash-effect');
            this.currentIndex++;
            this.render();

            // Re-enable buttons after rendering the new card
            const newPrevBtn = document.getElementById('prev-btn');
            const newNextBtn = document.getElementById('next-btn');
            if (newPrevBtn) newPrevBtn.disabled = false;
            if (newNextBtn) newNextBtn.disabled = false;
            this.isTransitioning = false;
        }, 300); // Duration of the flash effect
    }

    flip() {
        if (this.isTransitioning) return;
        const card = this.appContainer.querySelector('.flashcard');
        if (card) {
            card.classList.toggle('flipped');
        }
    }

    handleFlashcardAnswer(isCorrect) {
        if (isCorrect) {
            this.sessionScore.correct++;
            this.auth.updateGlobalScore({ correct: 1, incorrect: 0 });
        } else {
            this.sessionScore.incorrect++;
            this.auth.updateGlobalScore({ correct: 0, incorrect: 1 });
        }
        this.learningCallbacks.updateSessionScoreDisplay(this.sessionScore.correct, this.sessionScore.incorrect, this.moduleData.data.length);

        if (this.currentIndex >= this.moduleData.data.length - 1) {
            this.learningCallbacks.showFlashcardSummary(this.moduleData.data.length);
        } else {
            this.next();
        }
    }

    updateText() {
        const cardData = this.moduleData.data[this.currentIndex];
        const flashcardFront = document.querySelector('.flashcard-front');
        const flashcardBack = document.querySelector('.flashcard-back');

        if (flashcardFront) {
            flashcardFront.innerHTML = `
                <p class="flashcard-en-word text-base md:text-xl" id="flashcard-front-text">${cardData.en}</p>
                <p class="text-sm text-gray-500 md:text-lg" id="flashcard-front-ipa">${cardData.ipa}</p>
                <p class="mt-1 italic text-sm md:mt-2" id="flashcard-example">"${cardData.example}"</p>
            `;
        }

        if (flashcardBack) {
            flashcardBack.innerHTML = `
                <div>
                    <p class="flashcard-en-word text-base md:text-xl" id="flashcard-back-en-text">${cardData.en}</p>
                    <p class="text-sm text-gray-500 md:text-lg" id="flashcard-back-ipa">${cardData.ipa}</p>
                    <p class="text-base font-bold md:text-xl" id="flashcard-back-text">${cardData.es}</p>
                    <p class="mt-1 italic text-sm md:mt-2" id="flashcard-example">"${cardData.example}"</p>
                    <p class="text-gray-500 italic" id="flashcard-example-es">"${cardData.example_es}"</p>
                </div>
            `;
        }

        // Update button texts
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const backToMenuBtn = document.getElementById('back-to-menu-flashcard-btn');

        if (prevBtn) prevBtn.textContent = this.MESSAGES.get('prevButton');
        if (nextBtn) nextBtn.textContent = this.MESSAGES.get('nextButton');
        if (backToMenuBtn) backToMenuBtn.textContent = this.MESSAGES.get('backToMenu');
    }

    _handleKeyboardEvent(e) {
        // Only handle keyboard events if the flashcard container is visible
        const flashcardContainer = document.getElementById('flashcard-container');
        if (!flashcardContainer || flashcardContainer.closest('.hidden')) {
            return;
        }

        const flashcardSummaryContainer = document.getElementById('flashcard-summary-container');
        if (flashcardSummaryContainer && !flashcardSummaryContainer.classList.contains('hidden')) {
            if (e.key === 'Enter') {
                document.getElementById('flashcard-summary-back-to-menu-btn').click();
            }
            return; // Exit early if summary handled
        }

        if (e.key === 'Enter') {
            const card = document.querySelector('.flashcard');
            if (card) {
                if (card.classList.contains('flipped')) {
                    card.classList.remove('flipped'); // Unflip the card
                    setTimeout(() => {
                        if (this.currentIndex === this.moduleData.data.length - 1) {
                            this.learningCallbacks.showFlashcardSummary(this.moduleData.data.length);
                        } else {
                            this.next();
                        }
                    }, 150); // Small delay to allow unflip animation
                } else {
                    this.flip();
                }
            }
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.prev();
        }
    }

    addKeyboardListeners() {
        this._boundHandleKeyboardEvent = this._handleKeyboardEvent.bind(this);
        document.addEventListener('keydown', this._boundHandleKeyboardEvent);
    }

    removeKeyboardListeners() {
        document.removeEventListener('keydown', this._boundHandleKeyboardEvent);
    }
}

export default FlashcardMode;
