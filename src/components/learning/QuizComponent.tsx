import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { LearningModule } from '../../types';

interface QuizData {
  sentence: string;
  idiom: string;
  options: string[];
  correct: string;
  explanation?: string;
}

interface QuizComponentProps {
  module: LearningModule;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ module }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { theme } = useSettingsStore();
  
  const isDark = theme === 'dark';
  const textColor = isDark ? 'white' : '#111827';

  const questions = (module?.data || []) as QuizData[];
  const currentQuestion = questions[currentIndex];

  // Early return if no data
  if (!questions.length) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">No quiz questions available</p>
        <button
          onClick={() => setCurrentView('menu')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const handleAnswerSelect = (optionIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
    setShowResult(true);
    
    const isCorrect = currentQuestion?.options[optionIndex] === currentQuestion?.correct;
    updateSessionScore(isCorrect ? { correct: 1 } : { incorrect: 1 });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const { sessionScore } = useAppStore.getState();
      const finalScore = Math.round((sessionScore.correct / sessionScore.total) * 100);
      updateUserScore(module.id, finalScore, timeSpent);
      setCurrentView('menu');
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4' && !showResult && currentQuestion) {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < (currentQuestion.options?.length || 0)) {
          handleAnswerSelect(optionIndex);
        }
      } else if (e.key === 'Enter' && showResult) {
        handleNext();
      } else if (e.key === 'Escape') {
        setCurrentView('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showResult, currentQuestion]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{module.name}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="quiz-question bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold mb-8" style={{ color: textColor }}>
          <div dangerouslySetInnerHTML={{ __html: currentQuestion?.sentence || 'Loading question...' }} />
        </h2>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {(currentQuestion?.options || []).map((option, index) => {
            let buttonClass = "quiz-option w-full p-3 text-left border-2 rounded-lg transition-all duration-200 ";
            
            if (!showResult) {
              buttonClass += "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:!text-white";
            } else {
              if (currentQuestion?.options[index] === currentQuestion?.correct) {
                buttonClass += "quiz-option--correct border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900 text-green-800 dark:!text-white";
              } else if (index === selectedAnswer && currentQuestion?.options[index] !== currentQuestion?.correct) {
                buttonClass += "quiz-option--incorrect border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900 text-red-800 dark:!text-white";
              } else {
                buttonClass += "quiz-option--disabled border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:!text-white";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span 
                      className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium mr-3"
                      style={{ color: textColor }}
                    >
                      {index + 1}
                    </span>
                    <span 
                      className="text-sm"
                      style={{ color: textColor }}
                    >
                      {option}
                    </span>
                  </div>
                  
                  {showResult && (
                    <div>
                      {currentQuestion?.options[index] === currentQuestion?.correct && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                      {index === selectedAnswer && currentQuestion?.options[index] !== currentQuestion?.correct && (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && currentQuestion?.explanation && (
          <div className="quiz-explanation mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h4 className="font-medium mb-2" style={{ color: textColor }}>Explanation:</h4>
            <p style={{ color: textColor }}>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {showResult && (
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>{currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {!showResult && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Press 1-4 to select an answer, or click on an option
        </div>
      )}

      {/* Back to menu */}
      <button
        onClick={() => setCurrentView('menu')}
        className="w-full mt-6 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        Back to Menu
      </button>
    </div>
  );
};