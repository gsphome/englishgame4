// src/js/modules/SortingModule.js

class SortingMode {
    constructor(authInstance, messagesInstance, learningCallbacks, settings) {
        this.auth = authInstance;
        this.MESSAGES = messagesInstance;
        this.learningCallbacks = learningCallbacks; // Object containing specific game functions
        this.settings = settings; // New: Store game settings

        this.moduleData = null;
        this.appContainer = null;
        this.words = [];
        this.categories = [];
        this.userAnswers = {}; // Stores the current category for each word
        this.originalWordPositions = {}; // To track initial positions for Undo/Reset
        this.sessionScore = { correct: 0, incorrect: 0 };
        this.history = []; // To store actions for undo functionality
        this.draggedElementId = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.currentDraggedElement = null;
        this.currentGhostElement = null;
        this.feedbackActive = false;
        this.wordFeedbackStatus = {}; // Initialize word feedback status
        this.maxCategoriesToRender = 3; // Global variable to limit categories
    }

    /**
     * Initializes the Sorting module with the given module data.
     * @param {object} module - The module data containing sorting exercises.
     */
    init(module) {
        this.moduleData = module;
        this.appContainer = document.getElementById('app-container');
        // Determine the categories that will actually be rendered
        // this.categories now stores objects { category_id, category_show }
        this.categories = this.learningCallbacks.shuffleArray([...module.categories]).slice(0, this.maxCategoriesToRender);
        this.userAnswers = {};
        this.originalWordPositions = {};
        this.sessionScore = { correct: 0, incorrect: 0 };
        this.history = [];
        this.feedbackActive = false;
        this.wordFeedbackStatus = {}; // Initialize word feedback status
        this.clearFeedback(); // Clear any previous feedback colors

        // Group words by category_id from the original module data
        const wordsByCategory = {};
        module.data.forEach(item => {
            if (!wordsByCategory[item.category]) {
                wordsByCategory[item.category] = [];
            }
            wordsByCategory[item.category].push(item.word);
        });

        let allWordsFromSelectedCategories = [];

        // Collect all words that belong to the *selected* categories (using category_id)
        this.categories.forEach(categoryObj => {
            if (wordsByCategory[categoryObj.category_id]) {
                allWordsFromSelectedCategories = allWordsFromSelectedCategories.concat(wordsByCategory[categoryObj.category_id]);
            }
        });

        // Shuffle all words from the selected categories
        allWordsFromSelectedCategories = this.learningCallbacks.shuffleArray(allWordsFromSelectedCategories);

        // Select a subset of these words for the game
        // Ensure at least one word from each *displayed* category if possible, then fill up to a total
        const wordsPerCategory = {};
        this.categories.forEach(categoryObj => wordsPerCategory[categoryObj.category_id] = []);

        // Distribute words to ensure representation from each category (using category_id)
        module.data.forEach(item => {
            // Check if the item's category_id is among the selected categories
            if (this.categories.some(cat => cat.category_id === item.category)) {
                wordsPerCategory[item.category].push(item.word);
            }
        });

        // Select one word from each category, if available (using category_id)
        let selectedWords = [];
        this.categories.forEach(categoryObj => {
            if (wordsPerCategory[categoryObj.category_id].length > 0) {
                const word = wordsPerCategory[categoryObj.category_id].shift(); // Take one word
                selectedWords.push(word);
            }
        });

        // Fill the rest up to `this.settings.wordCount` words from the remaining words in selected categories
        let remainingWords = [];
        for (const categoryId in wordsPerCategory) { // Iterate over category_ids
            remainingWords = remainingWords.concat(wordsPerCategory[categoryId]);
        }
        remainingWords = this.learningCallbacks.shuffleArray(remainingWords); // Shuffle remaining words

        let i = 0;
        while (selectedWords.length < this.settings.wordCount && i < remainingWords.length) {
            const wordToAdd = remainingWords[i];
            if (!selectedWords.includes(wordToAdd)) { // Avoid duplicates
                selectedWords.push(wordToAdd);
            }
            i++;
        }

        this.words = this.learningCallbacks.shuffleArray(selectedWords); // Final shuffle of the words to be displayed
        this.renderInitialView();
        this.render(); // Call the new render method after initial view is set up
        this.addKeyboardListeners();
        this.MESSAGES.addListener(this.updateText.bind(this));

        this.userAnswers = {};
        this.originalWordPositions = {};
        this.sessionScore = { correct: 0, incorrect: 0 };
        this.history = [];
        this.feedbackActive = false;
        this.wordFeedbackStatus = {}; // Initialize word feedback status
        this.clearFeedback(); // Clear any previous feedback colors
    }

    renderInitialView() {
        this.appContainer.classList.remove('main-menu-active');
        this.appContainer.innerHTML = `
            <div id="sorting-container" class="max-w-2xl mx-auto p-4">

                <div id="word-bank" class="bg-white p-4 rounded-lg shadow-md mb-6 min-h-[100px] border-2 border-gray-300 flex flex-wrap justify-center items-center">
                    <!-- Words will be rendered here -->
                </div>

                <div id="categories-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <!-- Categories will be rendered here -->
                </div>

                <div class="flex justify-between mt-4">
                        <button id="undo-btn" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg"></button>
                        <button id="check-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"></button>
                    </div>
                    <div class="mt-1">
                        <button id="back-to-menu-sorting-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"></button>
                    </div>

                </div>
            `;

        this.renderWords();
        this.renderCategories();
        this.addEventListeners();
        this.learningCallbacks.updateSessionScoreDisplay(this.sessionScore.correct, this.sessionScore.incorrect, this.words.length);
        this.updateText(); // Call updateText after rendering HTML
    }

    checkAnswers() {
        this.sessionScore = { correct: 0, incorrect: 0 };
        let allCorrect = true;

        this.words.forEach(word => {
            const wordElem = document.getElementById('word-' + word.replace(/\s+/g, '-').toLowerCase());
            if (!wordElem) return; // Word might not be rendered yet or missing

            const currentCategoryElement = wordElem.parentElement;
            const currentCategoryId = currentCategoryElement ? currentCategoryElement.id.replace('category-', '') : 'word-bank';

            // Find the correct category for the current word from the original module data
            const originalWordData = this.moduleData.data.find(item => item.word === word);
            const correctCategory = originalWordData ? originalWordData.category : null;

            // Remove previous feedback classes
            wordElem.classList.remove('bg-green-500', 'bg-red-500', 'text-white');

            if (currentCategoryId === correctCategory) {
                this.sessionScore.correct++;
                this.wordFeedbackStatus[word] = true; // Store as correct
                wordElem.classList.add('bg-green-500', 'text-white');
            } else {
                this.sessionScore.incorrect++;
                this.wordFeedbackStatus[word] = false; // Store as incorrect
                wordElem.classList.add('bg-red-500', 'text-white');
                allCorrect = false;
            }
        });

        if (allCorrect && this.sessionScore.correct === this.words.length) {
            this.learningCallbacks.showSortingCompletionModal(this.moduleData);
        }
        this.auth.updateGlobalScore(this.sessionScore); // Update global score on every check
        this.feedbackActive = true;
        this.learningCallbacks.updateSessionScoreDisplay(this.sessionScore.correct, this.sessionScore.incorrect, this.words.length);
    }

    undo() {
        if (this.feedbackActive) {
            this.clearFeedback();
            this.feedbackActive = false;
            return;
        }

        if (this.history.length > 0) {
            const lastAction = this.history.pop();
            const wordElem = document.getElementById(lastAction.wordId);
            const previousParent = document.getElementById(lastAction.from);

            if (wordElem && previousParent) {
                previousParent.appendChild(wordElem);
                this.clearFeedback(); // Clear feedback on undo

                // Do not revert scores on undo, as per new logic.
                // Scores are only updated when a new answer is submitted.
                // if (lastAction.isCorrectMove) {
                //     this.sessionScore.correct--;
                //     auth.updateGlobalScore({ correct: -1, incorrect: 0 });
                // } else {
                //     this.sessionScore.incorrect--;
                //     auth.updateGlobalScore({ correct: 0, incorrect: -1 });
                // }
                this.learningCallbacks.updateSessionScoreDisplay(this.sessionScore.correct, this.sessionScore.incorrect, this.words.length);
            }
        }
    }

    clearFeedback() {
        document.querySelectorAll('.word').forEach(wordElem => {
            wordElem.classList.remove('bg-green-500', 'bg-red-500', 'text-white');
            wordElem.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-800', 'dark:text-black');
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    allowDrop(ev) {
        ev.preventDefault();
    }

    drag(ev) {
        this.draggedElementId = ev.target.id;
    }

    drop(ev) {
        ev.preventDefault();
        const wordId = this.draggedElementId;
        if (!wordId) return;

        const wordElem = document.getElementById(wordId);
        let target = ev.target;

        // Find the actual category or word-bank element
        while (target && !target.id.startsWith('category-') && target.id !== 'word-bank') {
            target = target.parentElement;
        }

        if (target && (target.id.startsWith('category-') || target.id === 'word-bank')) {
            const oldParentId = wordElem.parentElement.id;
            const newParentId = target.id;

            if (oldParentId !== newParentId) {
                // Record the action for undo
                // Determine if the move is correct or incorrect for scoring
                const word = wordElem.dataset.word;
                const originalWordData = this.moduleData.data.find(item => item.word === word);
                const correctCategory = originalWordData ? originalWordData.category : null;
                const isCorrectMove = (newParentId === 'word-bank' && correctCategory === null) || (newParentId === `category-${correctCategory}`);

                this.history.push({
                    wordId: wordId,
                    from: oldParentId,
                    to: newParentId,
                    isCorrectMove: isCorrectMove // Store correctness of the move
                });
                target.appendChild(wordElem);
                this.userAnswers[wordElem.dataset.word] = newParentId === 'word-bank' ? '' : newParentId.replace('category-', '');
                this.clearFeedback(); // Clear feedback on new move
            }
        }
        this.draggedElementId = null; // Reset the dragged element ID
    }

    getDropTarget(x, y) {
        const wordBank = document.getElementById('word-bank');
        const categories = document.querySelectorAll('.category');
        const potentialTargets = [wordBank, ...Array.from(categories)];

        for (const target of potentialTargets) {
            const rect = target.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return target;
            }
        }
        return null;
    }

    handleTouchStart(e, wordElem) {
        if (e.touches) { // Check if it's a touch event
            e.preventDefault(); // Prevent scrolling
            this.currentDraggedElement = wordElem;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;

            // Create a ghost element for visual feedback
            this.currentGhostElement = wordElem.cloneNode(true);
            this.currentGhostElement.style.position = 'absolute';
            this.currentGhostElement.style.width = wordElem.offsetWidth + 'px';
            this.currentGhostElement.style.height = wordElem.offsetHeight + 'px';
            this.currentGhostElement.style.pointerEvents = 'none'; // Make it non-interactive
            this.currentGhostElement.style.opacity = '0.7';
            this.currentGhostElement.style.zIndex = '1000';
            this.currentGhostElement.style.left = (wordElem.getBoundingClientRect().left + window.scrollX) + 'px';
            this.currentGhostElement.style.top = (wordElem.getBoundingClientRect().top + window.scrollY) + 'px';
            document.body.appendChild(this.currentGhostElement);

            // Hide the original element temporarily
            wordElem.style.opacity = '0';

            document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { once: true });
        }
    }

    handleTouchMove(e) {
        if (this.currentGhostElement) {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            this.currentGhostElement.style.left = (touch.clientX + window.scrollX - this.currentGhostElement.offsetWidth / 2) + 'px';
            this.currentGhostElement.style.top = (touch.clientY + window.scrollY - this.currentGhostElement.offsetHeight / 2) + 'px';
        }
    }

    handleTouchEnd(e) {
        if (this.currentGhostElement) {
            const touch = e.changedTouches[0];
            const dropTarget = this.getDropTarget(touch.clientX, touch.clientY);

            if (dropTarget && (dropTarget.id.startsWith('category-') || dropTarget.id === 'word-bank')) {
                const oldParentId = this.currentDraggedElement.parentElement.id;
                const newParentId = dropTarget.id;

                if (oldParentId !== newParentId) {
                    // Determine if the move is correct or incorrect for scoring
                    const word = this.currentDraggedElement.dataset.word;
                    const originalWordData = this.moduleData.data.find(item => item.word === word);
                    const correctCategory = originalWordData ? originalWordData.category : null;
                    const isCorrectMove = (newParentId === 'word-bank' && correctCategory === null) || (newParentId === `category-${correctCategory}`);

                    this.history.push({
                        wordId: this.currentDraggedElement.id,
                        from: oldParentId,
                        to: newParentId,
                        isCorrectMove: isCorrectMove // Store correctness of the move
                    });
                    dropTarget.appendChild(this.currentDraggedElement);
                    this.userAnswers[this.currentDraggedElement.dataset.word] = newParentId;
                    this.clearFeedback();
                    this.render(); // Re-render to update positions
                }
            }

            // Restore original element's visibility
            this.currentDraggedElement.style.opacity = '1';

            // Clean up ghost element and event listeners
            document.body.removeChild(this.currentGhostElement);
            this.currentGhostElement = null;
            this.currentDraggedElement = null;
            document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        }
    }

    renderWords() {
        const wordBank = document.getElementById('word-bank');
        wordBank.innerHTML = ''; // Clear existing words
        this.words.forEach(word => {
            const wordElem = document.createElement('div');
            wordElem.id = 'word-' + word.replace(/\s+/g, '-').toLowerCase();
            wordElem.className = 'word bg-gray-100 hover:bg-gray-200 text-gray-800 dark:text-black font-semibold py-2 px-4 rounded-lg shadow-sm cursor-grab m-2';
            wordElem.setAttribute('draggable', true);
            wordElem.textContent = word;
            wordElem.dataset.word = word; // Store original word for easy lookup
            wordElem.addEventListener('dragstart', (e) => this.drag(e));
            wordElem.addEventListener('touchstart', (e) => this.handleTouchStart(e, wordElem));
            wordBank.appendChild(wordElem);
        });
    }

    renderCategories() {
        const categoriesContainer = document.getElementById('categories-container');
        categoriesContainer.innerHTML = ''; // Clear existing categories
        // Shuffle categories and then take the first 'maxCategoriesToRender'
        const categoriesToRender = this.learningCallbacks.shuffleArray([...this.categories]).slice(0, this.maxCategoriesToRender);
        categoriesToRender.forEach(categoryObj => { // Changed 'category' to 'categoryObj'
            const categoryElem = document.createElement('div');
            categoryElem.id = 'category-' + categoryObj.category_id; // Use category_id for ID
            categoryElem.className = 'category bg-white p-4 rounded-lg shadow-md min-h-[120px] border-2 border-gray-300 flex flex-col items-center';
            categoryElem.innerHTML = `<h3 class="text-l font-bold mb-2 capitalize">${categoryObj.category_show}</h3>`; // Use category_show for display
            categoryElem.addEventListener('drop', (e) => this.drop(e));
            categoryElem.addEventListener('dragover', (e) => this.allowDrop(e));
            categoriesContainer.appendChild(categoryElem);
        });
    }

    addEventListeners() {
        document.getElementById('check-btn').addEventListener('click', () => this.checkAnswers());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('back-to-menu-sorting-btn').addEventListener('click', () => this.learningCallbacks.renderMenu());

        // Add event listeners for word-bank
        const wordBank = document.getElementById('word-bank');
        if (wordBank) {
            wordBank.addEventListener('drop', (e) => this.drop(e));
            wordBank.addEventListener('dragover', (e) => this.allowDrop(e));
        }
    }

    render() {
        // Move words to their current assigned containers
        this.words.forEach(word => {
            const wordId = 'word-' + word.replace(/\s+/g, '-').toLowerCase();
            const wordElem = document.getElementById(wordId);
            if (wordElem) {
                const currentCategory = this.userAnswers[word] || 'word-bank';
                const targetContainer = document.getElementById(currentCategory.startsWith('category-') ? currentCategory : 'word-bank');
                if (targetContainer) {
                    targetContainer.appendChild(wordElem);
                } else {
                    document.getElementById('word-bank').appendChild(wordElem); // Fallback
                }

                // Re-apply colors if feedback is active
                if (this.feedbackActive) {
                    wordElem.classList.remove('bg-green-500', 'bg-red-500', 'text-white'); // Clear existing colors first
                    const isCorrect = this.wordFeedbackStatus[word];
                    if (isCorrect === true) {
                        wordElem.classList.add('bg-green-500', 'text-white');
                    } else if (isCorrect === false) {
                        wordElem.classList.add('bg-red-500', 'text-white');
                    }
                }
            }
        });
        this.updateText(); // Update texts and scores after re-rendering words
    }

    updateText() {
        // Update button texts
        const undoBtn = document.getElementById('undo-btn');
        const checkBtn = document.getElementById('check-btn');
        const backToMenuSortingBtn = document.getElementById('back-to-menu-sorting-btn');

        if (undoBtn) undoBtn.textContent = this.MESSAGES.get('undoButton');
        if (checkBtn) checkBtn.textContent = this.MESSAGES.get('checkButton');
        if (backToMenuSortingBtn) backToMenuSortingBtn.textContent = this.MESSAGES.get('backToMenu');

        // Update score display if visible
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            // Re-render score based on current sessionScore
            if (this.sessionScore.correct === this.words.length && this.words.length > 0) {
                scoreDisplay.textContent = `${this.MESSAGES.get('allCorrectMessage')}`;
            } else {
                scoreDisplay.textContent = '';
            }
        }

        // Update category titles
        this.categories.forEach(categoryObj => { // Changed 'category' to 'categoryObj'
            const categoryElem = document.getElementById('category-' + categoryObj.category_id); // Use category_id for ID
            if (categoryElem) {
                const h3 = categoryElem.querySelector('h3');
                if (h3) {
                    h3.textContent = categoryObj.category_show; // Use category_show for display
                }
            }
        });
    }

    _handleKeyboardEvent(e) {
        // Only handle keyboard events if the sorting container is visible
        const sortingContainer = document.getElementById('sorting-container');
        if (!sortingContainer || sortingContainer.closest('.hidden')) {
            return;
        }

        const explanationModal = document.getElementById('explanation-modal');
        if (explanationModal && !explanationModal.classList.contains('hidden')) {
            if (e.key === 'Enter' || e.key === 'Escape') {
                document.getElementById('close-explanation-modal-btn').click();
            }
            return; // Consume event if explanation modal is handled
        }

        const sortingCompletionModal = document.getElementById('sorting-completion-modal');
        if (sortingCompletionModal && !sortingCompletionModal.classList.contains('hidden')) {
            if (e.key === 'Enter' || e.key === 'Escape') {
                document.getElementById('sorting-completion-back-to-menu-btn').click();
            }
            return; // Consume event if sorting completion modal is handled
        }

        if (e.key === 'Enter') {
            this.checkAnswers();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.undo();
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

export default SortingMode;