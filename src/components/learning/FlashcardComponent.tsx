import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';
import { useTranslation } from '../../utils/i18n';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import { shuffleArray } from '../../utils/randomUtils';
import type { FlashcardData, LearningModule } from '../../types';

interface FlashcardComponentProps {
  module: LearningModule;
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ module }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime] = useState(Date.now());

  const { setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { language } = useSettingsStore();
  const { addProgressEntry } = useProgressStore();
  const { t } = useTranslation(language);
  const { /* clearGameToasts */ } = useLearningCleanup();

  // Generate new random set each time component mounts
  const randomizedFlashcards = useMemo(() => {
    if (!module?.data) return [];
    const allFlashcards = module.data as FlashcardData[];
    return shuffleArray(allFlashcards);
  }, [module?.data, module?.id, startTime]);



  const currentCard = randomizedFlashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < randomizedFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // End of flashcards
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Register progress (assuming all flashcards were "correct" for completion)
      addProgressEntry({
        score: 100, // Flashcards are completion-based, so 100% for finishing
        totalQuestions: randomizedFlashcards.length,
        correctAnswers: randomizedFlashcards.length,
        moduleId: module.id,
        learningMode: 'flashcard',
        timeSpent: timeSpent,
      });

      updateUserScore(module.id, randomizedFlashcards.length, timeSpent);
      setCurrentView('menu');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Keyboard navigation
  useEffect(() => {
    if (randomizedFlashcards.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isFlipped) {
            handleNext();
          } else {
            handleFlip();
          }
          break;
        case 'Escape':
          setCurrentView('menu');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, randomizedFlashcards.length, isFlipped]);

  // Early return if no data
  if (!randomizedFlashcards.length) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6 text-center">
        <p className="text-gray-600 mb-4">{t('noDataAvailable') || 'No flashcards available'}</p>
        <button
          onClick={() => setCurrentView('menu')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('navigation.mainMenu')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Compact header with progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{module.name}</h2>
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {currentIndex + 1}/{randomizedFlashcards.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / randomizedFlashcards.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {isFlipped ? 'Press Enter/Space for next card' : 'Click card or press Enter/Space to flip'}
        </p>
      </div>

      {/* Flashcard */}
      <div
        className={`flashcard relative h-56 sm:h-64 w-full cursor-pointer ${isFlipped ? 'flipped' : ''
          }`}
        onClick={handleFlip}
      >
        <div className="flashcard-inner">
          {/* Front */}
          <div className="flashcard-front bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600">
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white text-center mb-2">
              {currentCard?.en || 'Loading...'}
            </p>
            {currentCard?.ipa && (
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-300 text-center mb-3">
                {currentCard.ipa}
              </p>
            )}
            {currentCard?.example && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic text-center px-2">
                "{currentCard.example}"
              </p>
            )}

          </div>

          {/* Back */}
          <div className="flashcard-back bg-blue-50 dark:bg-blue-900 shadow-lg border border-blue-200 dark:border-blue-700">
            <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center mb-1">
              {currentCard?.en || 'Loading...'}
            </p>
            {currentCard?.ipa && (
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 text-center mb-2">
                {currentCard.ipa}
              </p>
            )}
            <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100 text-center mb-3">
              {currentCard?.es || 'Loading...'}
            </p>
            {currentCard?.example && (
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic mb-1 px-2">
                  "{currentCard.example}"
                </p>
                {currentCard.example_es && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic px-2">
                    "{currentCard.example_es}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Control Bar */}
      <div className="flex justify-center items-center gap-3 flex-wrap mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg transition-colors shadow-sm"
          title="Previous Card (←)"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={handleFlip}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm w-[140px] justify-center"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{isFlipped ? 'Flip Back' : 'Flip'}</span>
        </button>

        <button
          onClick={handleNext}
          className="p-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors shadow-sm"
          title={currentIndex === randomizedFlashcards.length - 1 ? 'Finish' : 'Next Card (→)'}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Navigation */}
        <button
          onClick={() => setCurrentView('menu')}
          className="flex items-center gap-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          ← Menu
        </button>
      </div>
    </div>
  );
};

export default FlashcardComponent;