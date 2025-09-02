import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { shuffleArray } from '../../utils/randomUtils';
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

  // Randomize questions and options once per component mount
  const randomizedQuestions = useMemo(() => {
    if (!module?.data) return [];

    const questions = module.data as QuizData[];
    const shuffledQuestions = shuffleArray(questions);

    // Randomize options for each question
    return shuffledQuestions.map(question => {
      if (!question.options || !question.correct) return question;

      const shuffledOptions = shuffleArray([...question.options]);

      return {
        ...question,
        options: shuffledOptions
      };
    });
  }, [module?.data, module?.id]);

  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { theme } = useSettingsStore();

  const isDark = theme === 'dark';
  const textColor = isDark ? 'white' : '#111827';

  const currentQuestion = randomizedQuestions[currentIndex];

  // Early return if no data
  if (!randomizedQuestions.length) {
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
    const scoreUpdate = isCorrect ? { correct: 1 } : { incorrect: 1 };

    console.log('🎯 QuizComponent - Answer selected:', {
      optionIndex,
      selectedOption: currentQuestion?.options[optionIndex],
      correctAnswer: currentQuestion?.correct,
      isCorrect,
      scoreUpdate
    });

    updateSessionScore(scoreUpdate);

    // Log the state after update
    setTimeout(() => {
      const { sessionScore } = useAppStore.getState();
      console.log('🎯 QuizComponent - Score after update:', sessionScore);
    }, 100);
  };

  const handleNext = () => {
    if (currentIndex < randomizedQuestions.length - 1) {
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
    <div className="max-w-3xl mx-auto p-3 sm:p-6">
      {/* Compact header with progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{module.name}</h2>
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {currentIndex + 1}/{randomizedQuestions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / randomizedQuestions.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {showResult ? 'Press Enter for next question' : 'Press 1-4 to select or click an option'}
        </p>
      </div>

      {/* Question */}
      <div className="quiz-question bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6" style={{ color: textColor }}>
          <div dangerouslySetInnerHTML={{ __html: currentQuestion?.sentence || 'Loading question...' }} />
        </h3>

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

      {/* Compact controls */}
      {showResult && (
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <span>{currentIndex === randomizedQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Back to menu */}
      <button
        onClick={() => setCurrentView('menu')}
        className="w-full mt-3 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
      >
        Back to Menu
      </button>
    </div>
  );
};