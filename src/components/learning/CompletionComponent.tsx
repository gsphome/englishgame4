import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import type { LearningModule } from '../../types';

interface CompletionData {
  sentence: string;
  correct: string;
  explanation?: string;
  tip?: string;
}

interface CompletionComponentProps {
  module: LearningModule;
}

export const CompletionComponent: React.FC<CompletionComponentProps> = ({ module }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);

  const exercises = (module?.data || []) as CompletionData[];
  const currentExercise = exercises[currentIndex];

  // Early return if no data
  if (!exercises.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">{t('noDataAvailable') || 'No completion exercises available'}</p>
        <button
          onClick={() => setCurrentView('menu')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('mainMenu')}
        </button>
      </div>
    );
  }

  const checkAnswer = () => {
    if (showResult) return;
    
    const userAnswer = answer.toLowerCase().trim();
    const correctAnswer = currentExercise?.correct?.toLowerCase().trim() || '';
    const isCorrect = userAnswer === correctAnswer;
    
    updateSessionScore(isCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
      setShowResult(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const { sessionScore } = useAppStore.getState();
      const finalScore = Math.round((sessionScore.correct / sessionScore.total) * 100);
      updateUserScore(module.id, finalScore, timeSpent);
      setCurrentView('menu');
    }
  };

  const renderSentence = () => {
    if (!currentExercise?.sentence) return null;
    
    // Split sentence by blank marker (______)
    const parts = currentExercise.sentence.split('______');
    const elements = [];
    
    parts.forEach((part, index) => {
      // Add text part
      if (part) {
        elements.push(
          <span key={`text-${index}`} className="text-gray-900 dark:text-white">
            {part}
          </span>
        );
      }
      
      // Add input after each part except the last
      if (index < parts.length - 1) {
        const isCorrect = showResult && answer.toLowerCase().trim() === currentExercise.correct?.toLowerCase().trim();
        const isIncorrect = showResult && answer && !isCorrect;
        
        elements.push(
          <input
            key={`input-${index}`}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={showResult}
            placeholder="______"
            autoComplete="off"
            autoFocus
            className={`inline-block mx-1 px-2 py-1 min-w-[100px] text-center border-0 border-b-2 bg-transparent focus:outline-none transition-all duration-200 font-medium ${
              showResult
                ? isCorrect
                  ? 'border-green-500 text-green-700'
                  : isIncorrect
                  ? 'border-red-500 text-red-700'
                  : 'border-gray-400 text-gray-600'
                : 'border-gray-400 focus:border-blue-500 text-gray-900 dark:text-white'
            }`}
            style={{ 
              width: `${Math.max(100, (answer?.length || 6) * 10 + 40)}px`
            }}
          />
        );
      }
    });
    
    return elements;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showResult) {
        if (answer.trim()) {
          checkAnswer();
        }
      } else if (e.key === 'Enter' && showResult) {
        handleNext();
      } else if (e.key === 'Escape') {
        setCurrentView('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [answer, showResult]);

  const hasAnswer = answer.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Exercise {currentIndex + 1} of {exercises.length}</span>
          <span>{module.name}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Complete the sentence by filling in the blank:
        </h2>

        {currentExercise?.tip && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 rounded-r-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> {currentExercise.tip}
            </p>
          </div>
        )}

        <div className="text-lg leading-relaxed mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner">
          <div className="text-gray-900 dark:text-white font-medium">
            {renderSentence()}
          </div>
        </div>

        {/* Results */}
        {showResult && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 ${
            answer.toLowerCase().trim() === currentExercise?.correct?.toLowerCase().trim()
              ? 'bg-green-50 dark:bg-green-900 border-green-400'
              : 'bg-red-50 dark:bg-red-900 border-red-400'
          }`}>
            <div className="flex items-center space-x-3 mb-2">
              {answer.toLowerCase().trim() === currentExercise?.correct?.toLowerCase().trim() ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {answer.toLowerCase().trim() === currentExercise?.correct?.toLowerCase().trim() 
                  ? 'Correct!' 
                  : 'Incorrect'}
              </span>
            </div>
            {answer.toLowerCase().trim() !== currentExercise?.correct?.toLowerCase().trim() && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Correct answer: <strong>{currentExercise?.correct}</strong>
              </p>
            )}
            {currentExercise?.explanation && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {currentExercise.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={!hasAnswer}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-5 w-5" />
            <span>Check Answer</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <span>{currentIndex === exercises.length - 1 ? t('finishButton') || 'Finish' : t('nextButton')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {!showResult && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Fill the blank and press Enter or click Check Answer
        </div>
      )}

      {/* Back to menu */}
      <button
        onClick={() => setCurrentView('menu')}
        className="w-full mt-6 px-4 py-2 bg-gray-50 border-2 border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {t('mainMenu')}
      </button>
    </div>
  );
};