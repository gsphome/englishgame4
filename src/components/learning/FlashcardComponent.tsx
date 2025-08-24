import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import type { FlashcardData, LearningModule } from '../../types';

interface FlashcardComponentProps {
  module: LearningModule;
}

export const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ module }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime] = useState(Date.now());
  
  const { setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();

  const flashcards = (module?.data || []) as FlashcardData[];
  const currentCard = flashcards[currentIndex];

  // Early return if no data
  if (!flashcards.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">No flashcards available</p>
        <button
          onClick={() => setCurrentView('menu')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // End of flashcards
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      updateUserScore(module.id, flashcards.length, timeSpent);
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
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          if (isFlipped) {
            handleNext();
          } else {
            handleFlip();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case 'Escape':
          setCurrentView('menu');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Card {currentIndex + 1} of {flashcards.length}</span>
          <span>{module.name}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div 
        className={`relative h-64 w-full cursor-pointer transition-transform duration-500 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col justify-center items-center p-6">
          <p className="text-2xl font-semibold text-gray-900 text-center mb-2">
            {currentCard?.en || 'Loading...'}
          </p>
          {currentCard?.ipa && (
            <p className="text-lg text-gray-500 text-center mb-4">
              {currentCard.ipa}
            </p>
          )}
          {currentCard?.example && (
            <p className="text-sm text-gray-600 italic text-center">
              "{currentCard.example}"
            </p>
          )}
          <p className="text-xs text-gray-400 mt-4">Click to flip</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-blue-50 rounded-xl shadow-lg border border-blue-200 flex flex-col justify-center items-center p-6">
          <p className="text-2xl font-semibold text-gray-900 text-center mb-2">
            {currentCard?.en || 'Loading...'}
          </p>
          {currentCard?.ipa && (
            <p className="text-lg text-gray-500 text-center mb-2">
              {currentCard.ipa}
            </p>
          )}
          <p className="text-2xl font-bold text-blue-900 text-center mb-4">
            {currentCard?.es || 'Loading...'}
          </p>
          {currentCard?.example && (
            <div className="text-center">
              <p className="text-sm text-gray-700 italic mb-1">
                "{currentCard.example}"
              </p>
              {currentCard.example_es && (
                <p className="text-sm text-gray-600 italic">
                  "{currentCard.example_es}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleFlip}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Flip</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <span>{currentIndex === flashcards.length - 1 ? 'Finish' : 'Next'}</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Back to menu */}
      <button
        onClick={() => setCurrentView('menu')}
        className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Back to Menu
      </button>
    </div>
  );
};