# Advanced Learning App

## Description
The Advanced Learning App is an interactive web application designed to enhance English language skills through various engaging exercises. It features a modular design, dynamic content loading, and a user-friendly interface, making language learning accessible and effective.

## Features
*   **Interactive Exercises:** Includes completion, flashcards, matching, quizzes, and sorting games to practice vocabulary, grammar, and idioms.
*   **Modular Design:** Easily expandable with new learning modules and game types.
*   **Dynamic Content:** Content is loaded dynamically, allowing for flexible updates and diverse learning materials.
*   **User Authentication:** (Assuming `auth.js` implies some form of user management, even if basic)
*   **Internationalization (i18n):** Supports multiple languages for a broader user base.
*   **Responsive Design:** Built with Tailwind CSS for a seamless experience across various devices.
*   **Score Tracking:** Tracks user progress.
*   **Dark Mode:** Provides a comfortable viewing experience.

## Technologies Used
*   **Frontend:** HTML5, CSS3 (Tailwind CSS), JavaScript (ES Modules)
*   **Build/Dev Tools:**
    *   `http-server`: For serving the application locally.
    *   `ESLint`: For code linting and maintaining code quality.
    *   `Jest`: For JavaScript unit testing.
    *   `Babel`: For JavaScript transpilation.
    *   `Playwright`: (Likely for end-to-end testing, though not explicitly used in scripts, it's a dev dependency)

## Project Structure
```
.
├───index.html              # Main application entry point
├───package.json            # Project metadata and dependencies
├───src/
│   ├───assets/
│   │   ├───data/           # JSON files for game content (quizzes, flashcards, etc.)
│   │   └───images/         # Application images (e.g., logo.png)
│   ├───css/
│   │   └───app.css         # Custom CSS styles
│   └───js/
│       ├───app.js          # Main application logic
│       ├───auth.js         # Authentication related logic
│       ├───dataManager.js  # Handles data loading and management
│       ├───gameManager.js  # Manages game states and logic
│       ├───i18n.js         # Internationalization utilities
│       ├───ui.js           # User interface rendering and manipulation
│       ├───utils.js        # General utility functions
│       └───components/     # Individual game components (CompletionMode, FlashcardMode, MatchingMode, QuizMode, SortingMode, etc.)
└───... (other config files like .eslintrc.cjs, jest.config.js, etc.)
```

## Installation and Setup

To get this project up and running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd english-learning-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

To start the local development server:

```bash
npm start
```
This will typically open the application in your default web browser at `http://localhost:5500`.

## Running Tests

To execute the unit tests:

```bash
npm test
```

## Code Quality

To run the linter and check for code style issues:

```bash
npm run lint
```

## License
This project is licensed under the MIT License - see the `LICENSE` file for details.