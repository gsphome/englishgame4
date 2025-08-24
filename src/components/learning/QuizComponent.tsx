import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import type { LearningModule } from '../../types';

interface QuizData {
  id: string;
  question: string;
  options: string[];
  correct: number;
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
    
    const isCorrect = optionIndex === currentQuestion?.correct;
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
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          {currentQuestion?.question || 'Loading question...'}
        </h2>

        {/* Options */}
        <div className="space-y-4">
          {(currentQuestion?.options || []).map((option, index) => {
            let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
            
            if (!showResult) {
              buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
            } else {
              if (index === currentQuestion?.correct) {
                buttonClass += "border-green-500 bg-green-50 text-green-800";
              } else if (index === selectedAnswer && index !== currentQuestion?.correct) {
                buttonClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
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
                    <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                      {index + 1}
                    </span>
                    <span className="text-lg">{option}</span>
                  </div>
                  
                  {showResult && (
                    <div>
                      {index === currentQuestion?.correct && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                      {index === selectedAnswer && index !== currentQuestion?.correct && (
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
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
            <p className="text-blue-800">{currentQuestion.explanation}</p>
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
        <div className="text-center text-sm text-gray-500">
          Press 1-4 to select an answer, or click on an option
        </div>
      )}

      {/* Back to menu */}
      <button
        onClick={() => setCurrentView('menu')}
        className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Back to Menu
      </button>
    </div>
  );
};