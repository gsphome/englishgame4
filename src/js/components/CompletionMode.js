// src/js/modules/CompletionModule.js

class CompletionMode {
    constructor(authInstance, messagesInstance, learningCallbacks, settings) {
        this.auth = authInstance;
        this.MESSAGES = messagesInstance;
        this.learningCallbacks = learningCallbacks; // Object containing specific game functions
        this.settings = settings; // New: Store game settings

        this.currentIndex = 0;
        this.sessionScore = { correct: 0, incorrect: 0 };
        this.history = [];
        this.moduleData = null;
        this.appContainer = null;
    }

    /**
     * Initializes the Completion module with the given module data.
     * @param {object} module - The module data containing completion exercises.
     */
    init(module) {
        this.currentIndex = 0;
        this.sessionScore = { correct: 0, incorrect: 0 };
        this.history = []; // Clear history on init
        this.moduleData = module;
        this.appContainer = document.getElementById('app-container');
        if (this.learningCallbacks.randomMode && Array.isArray(this.moduleData.data)) {
            this.moduleData.data = this.learningCallbacks.shuffleArray([...this.moduleData.data]);
        }
        // Limit the number of items based on settings
        if (this.settings && this.settings.itemCount && this.moduleData.data.length > this.settings.itemCount) {
            this.moduleData.data = this.moduleData.data.slice(0, this.settings.itemCount);
        }
        this.render();
        this.addKeyboardListeners(); // Add this line
        const sessionScoreDisplay = document.getElementById('session-score-display');
        if (sessionScoreDisplay) {
            sessionScoreDisplay.classList.remove('hidden');
        }
        this.MESSAGES.addListener(this.updateButtonText.bind(this));
        this.MESSAGES.addListener(this.updateCompletionSummaryText.bind(this));
    }

    /**
     * Updates the text content of buttons and other static elements.
     */
    updateButtonText() {
        const undoBtn = document.getElementById('undo-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const backToMenuBtn = document.getElementById('back-to-menu-completion-btn');

        if (undoBtn) undoBtn.textContent = this.MESSAGES.get('undoButton');
        if (prevBtn) prevBtn.textContent = this.MESSAGES.get('prevButton');
        if (nextBtn) nextBtn.textContent = this.MESSAGES.get('nextButton');
        if (backToMenuBtn) backToMenuBtn.textContent = this.MESSAGES.get('backToMenu');
    }

    render() {
        if (!this.moduleData || !Array.isArray(this.moduleData.data) || this.moduleData.data.length === 0) {
            console.error("Completion module data is invalid or empty.");
            this.learningCallbacks.renderMenu();
            return;
        }
        const questionData = this.moduleData.data[this.currentIndex];
        this.appContainer.classList.remove('main-menu-active');

        if (!document.getElementById('completion-container')) {
            this.appContainer.innerHTML = `
                <div id="completion-container" class="max-w-2xl mx-auto">
                    <div class="bg-white p-8 rounded-lg shadow-md">
                        <p class="text-base md:text-xl" id="completion-question"></p>
                        ${questionData.tip ? `<p class="text-lg text-gray-500 mb-4" id="completion-tip">Tip: ${questionData.tip}</p>` : ''}
                        <div id="feedback-container" class="mt-6" style="min-height: 5rem;"></div>
                    </div>
                    <div class="flex justify-between mt-4">
                        <button id="undo-btn" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded-lg md:py-2 md:px-4" ${this.learningCallbacks.isHistoryMode ? 'disabled' : ''}></button>
                        <div>
                            <button id="prev-btn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded-l md:py-2 md:px-4"></button>
                            <button id="next-btn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded-r md:py-2 md:px-4"></button>
                        </div>
                    </div>
                    <div class="mt-1">
                        <button id="back-to-menu-completion-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-lg md:py-2 md:px-4"></button>
                    </div>
                </div>
            `;

            document.getElementById('prev-btn').addEventListener('click', () => this.prev());
            document.getElementById('next-btn').addEventListener('click', () => this.handleNextAction());
            document.getElementById('undo-btn').addEventListener('click', () => this.undo());
            document.getElementById('back-to-menu-completion-btn').addEventListener('click', () => this.learningCallbacks.renderMenu());

            // const inputElement = document.getElementById('completion-input'); // Moved outside
            // setTimeout(() => {
            //     inputElement.value = ''; // Clear the input field
            //     inputElement.focus();
            // }, 0);
        }

        // Update question and input field for every render
        document.getElementById('completion-question').innerHTML = questionData.sentence.replace('______', '<input type="text" id="completion-input" class="border-b-2 border-gray-400 focus:border-blue-500 outline-none text-left w-[20px] bg-transparent" autocomplete="off" />');
        this.updateButtonText(); // Call to update button texts after rendering

        

        const completionTipElement = document.getElementById('completion-tip');
        if (questionData.tip) {
            if (completionTipElement) {
                completionTipElement.textContent = `Tip: ${questionData.tip}`;
                completionTipElement.classList.remove('hidden');
            } else {
                // If the element doesn't exist, create and insert it
                const feedbackContainer = document.getElementById('feedback-container');
                const newTipElement = document.createElement('p');
                newTipElement.id = 'completion-tip';
                newTipElement.className = 'text-lg text-gray-500 mb-4';
                newTipElement.textContent = `Tip: ${questionData.tip}`;
                feedbackContainer.parentNode.insertBefore(newTipElement, feedbackContainer);
            }
        }
        else {
            if (completionTipElement) {
                completionTipElement.classList.add('hidden');
            }
        }
        this.updateText();
    }

    handleAnswer() {
        const inputElement = document.getElementById('completion-input');
        const userAnswer = inputElement.value.trim();

        if (userAnswer === '') {
            return; // Do nothing if the input is empty or just whitespace
        }

        const questionData = this.moduleData.data[this.currentIndex];
        const isCorrect = userAnswer.toLowerCase() === questionData.correct.toLowerCase();

        if (isCorrect) {
            this.sessionScore.correct++;
            this.auth.updateGlobalScore({ correct: 1, incorrect: 0 });
            inputElement.classList.add('text-green-500');
            document.getElementById('feedback-container').innerHTML = `<p class="text-lg">Correct Answer: <strong>${questionData.correct}</strong></p><p class="text-lg">${questionData.explanation}</p>`;
            this.history.push({
                isCorrect: true,
                index: this.currentIndex,
                userAnswer: userAnswer,
                correctAnswer: questionData.correct,
                explanation: questionData.explanation
            });
        } else {
            this.sessionScore.incorrect++;
            this.auth.updateGlobalScore({ correct: 0, incorrect: 1 });
            inputElement.classList.add('text-red-500');
            document.getElementById('feedback-container').innerHTML = `<p class="text-lg">Correct Answer: <strong>${questionData.correct}</strong></p><p class="text-lg">${questionData.explanation}</p>`;
            this.history.push({
                isCorrect: false,
                index: this.currentIndex,
                userAnswer: userAnswer,
                correctAnswer: questionData.correct,
                explanation: questionData.explanation
            });
        }
        inputElement.disabled = true;
        inputElement.classList.add('answered-input'); // Add this line
        this.learningCallbacks.updateSessionScoreDisplay(this.sessionScore.correct, this.sessionScore.incorrect, this.moduleData.data.length);
    }

    undo() {
        
        const lastAction = this.history.pop();
        if (lastAction) {
            if (lastAction.isCorrect) {
                this.sessionScore.correct--;
                this.auth.updateGlobalScore({ correct: -1, incorrect: 0 });
            } else {
                this.sessionScore.incorrect--;
                this.auth.updateGlobalScore({ correct: 0, incorrect: -1 });
            }
            this.currentIndex = lastAction.index;
            this.learningCallbacks.updateSessionScoreDisplay(this.sessionScore.correct, this.sessionScore.incorrect, this.moduleData.data.length);
            this.render(); // Re-render the UI for the undone question
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.render();
        }
    }

    advanceQuestion() {
        if (this.currentIndex < this.moduleData.data.length - 1) {
            this.currentIndex++;
            this.render();
        }
        else {
            this.showFinalScore();
        }
    }

    next() {
        this.advanceQuestion();
    }

    handleNextAction() {
        const inputElement = document.getElementById('completion-input');
        if (inputElement && !inputElement.disabled) {
            this.handleAnswer();
        } else {
            this.advanceQuestion();
        }
    }

    updateCompletionSummaryText() {
        const summaryTitle = document.getElementById('completion-summary-title');
        const summaryCorrect = document.getElementById('completion-summary-correct');
        const summaryIncorrect = document.getElementById('completion-summary-incorrect');
        const backToMenuBtn = document.getElementById('completion-summary-back-to-menu-btn');

        if (summaryTitle) summaryTitle.textContent = this.MESSAGES.get('sessionScore');
        if (summaryCorrect) summaryCorrect.textContent = `${this.MESSAGES.get('correct')}: ${this.sessionScore.correct}`;
        if (summaryIncorrect) summaryIncorrect.textContent = `${this.MESSAGES.get('incorrect')}: ${this.sessionScore.incorrect}`;
        if (backToMenuBtn) backToMenuBtn.textContent = this.MESSAGES.get('backToMenu');
    }

    showFinalScore() {
        this.auth.updateGlobalScore(this.sessionScore);
        this.learningCallbacks.renderHeader();

        this.appContainer.innerHTML = `
             <div id="completion-summary-container" class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
                <h1 id="completion-summary-title" class="text-2xl font-bold mb-4"></h1>
                <p id="completion-summary-correct" class="text-xl mb-2"></p>
                <p id="completion-summary-incorrect" class="text-xl mb-4"></p>
                <div class="mt-1">
                    <button id="completion-summary-back-to-menu-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-lg md:py-2 md:px-4"></button>
                </div>
             </div>
        `;
        this.updateCompletionSummaryText(); // Call to update text after rendering HTML

        const backToMenuButton = document.getElementById('completion-summary-back-to-menu-btn');
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', () => this.learningCallbacks.renderMenu());
        }
    }

    updateText() {
        const questionData = this.moduleData.data[this.currentIndex];
        document.getElementById('completion-question').innerHTML = questionData.sentence.replace('______', '<input type="text" id="completion-input" class="border-b-2 border-gray-400 focus:border-blue-500 outline-none text-left w-[20px] bg-transparent" autocomplete="off" />');
        let inputElement = document.getElementById('completion-input'); // Re-get the element after innerHTML update

        const currentQuestionFeedback = this.lastFeedbackForCurrentQuestion(); // Get feedback for current question

        // Restore feedback if available for the current question
        if (currentQuestionFeedback) {
            const feedbackHtml = `<p class="text-lg">Correct Answer: <strong>${currentQuestionFeedback.correctAnswer}</strong></p><p class="text-lg">${currentQuestionFeedback.explanation}</p>`;
            document.getElementById('feedback-container').innerHTML = feedbackHtml;
            inputElement.value = currentQuestionFeedback.userAnswer;
            inputElement.disabled = true; // Keep disabled
            inputElement.classList.add('answered-input'); // Add this line
            if (currentQuestionFeedback.isCorrect) {
                inputElement.classList.add('text-green-500');
            } else {
                inputElement.classList.add('text-red-500');
            }
        } else {
            document.getElementById('feedback-container').innerHTML = ''; // Clear feedback if no relevant feedback is stored
            inputElement.value = ''; // Clear the input field if no feedback
            inputElement.disabled = false; // Enable if no feedback
            inputElement.classList.remove('text-green-500', 'text-red-500', 'answered-input'); // Remove colors and answered-input class if no feedback
        }
        inputElement.focus(); // Focus after setting value and state
    }

    _handleKeyboardEvent(e) {
        // Only handle keyboard events if the completion container is visible
        const completionContainer = document.getElementById('completion-container');
        if (!completionContainer || completionContainer.closest('.hidden')) {
            return;
        }

        const completionSummaryContainer = document.getElementById('completion-summary-container');
        if (completionSummaryContainer && !completionSummaryContainer.classList.contains('hidden')) {
            if (e.key === 'Enter') {
                document.querySelector('#completion-summary-container button').click(); // Click the back to menu button
            }
            return; // Exit early if summary handled
        }

        if (e.key === 'Enter') {
            this.handleNextAction();
        } else if (e.key === 'Backspace') {
            const inputElement = document.getElementById('completion-input');
            if (inputElement && document.activeElement === inputElement) {
                // Allow default backspace behavior for input field
                return;
            }
            e.preventDefault();
            this.prev();
        }
    }

    addKeyboardListeners() {
        this._boundHandleKeyboardEvent = this._handleKeyboardEvent.bind(this);
        document.addEventListener('keydown', this._boundHandleKeyboardEvent);
    }

    lastFeedbackForCurrentQuestion() {
        // Search history for feedback related to the current question index
        return this.history.find(action => action.index === this.currentIndex);
    }

    removeKeyboardListeners() {
        document.removeEventListener('keydown', this._boundHandleKeyboardEvent);
    }
}

export default CompletionMode;