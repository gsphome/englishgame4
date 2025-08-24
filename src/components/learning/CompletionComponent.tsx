import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import type { LearningModule } from '../../types';

interface CompletionData {
  id: string;
  sentence: string;
  blanks: { position: number; correct: string; options: string[] }[];
}

interface CompletionComponentProps {
  module: LearningModule;
}

export const CompletionComponent: React.FC<CompletionComponentProps> = ({ module }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();

  const exercises = (module?.data || []) as CompletionData[];
  const currentExercise = exercises[currentIndex];

  // Early return if no data
  if (!exercises.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">No completion exercises available</p>
        <button
          onClick={() => setCurrentView('menu')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const handleAnswerChange = (blankIndex: number, value: string) => {
    if (showResult) return;
    setAnswers(prev => ({ ...prev, [blankIndex]: value }));
  };

  const checkAnswers = () => {
    if (showResult) return;
    
    let correct = 0;
    (currentExercise?.blanks || []).forEach((blank, index) => {
      if (answers[index] === blank.correct) {
        correct++;
      }
    });
    
    const isAllCorrect = correct === (currentExercise?.blanks?.length || 0);
    updateSessionScore(isAllCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswers({});
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
    const parts = [];
    let lastIndex = 0;

    (currentExercise?.blanks || []).forEach((blank, blankIndex) => {
      // Add text before blank
      parts.push(
        <span key={`text-${blankIndex}`}>
          {currentExercise?.sentence?.substring(lastIndex, blank.position) || ''}
        </span>
      );

      // Add blank/dropdown
      const isCorrect = showResult && answers[blankIndex] === blank.correct;
      const isIncorrect = showResult && answers[blankIndex] && answers[blankIndex] !== blank.correct;

      parts.push(
        <select
          key={`blank-${blankIndex}`}
          value={answers[blankIndex] || ''}
          onChange={(e) => handleAnswerChange(blankIndex, e.target.value)}
          disabled={showResult}
          className={`mx-1 px-2 py-1 border rounded ${
            showResult
              ? isCorrect
                ? 'border-green-500 bg-green-50'
                : isIncorrect
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
              : 'border-blue-300 focus:border-blue-500'
          }`}
        >
          <option value="">---</option>
          {(blank.options || []).map((option, optIndex) => (
            <option key={optIndex} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

      lastIndex = blank.position;
    });

    // Add remaining text
    parts.push(
      <span key="text-end">
        {currentExercise?.sentence?.substring(lastIndex) || ''}
      </span>
    );

    return parts;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showResult) {
        const allAnswered = (currentExercise?.blanks || []).every((_, index) => answers[index]);
        if (allAnswered) {
          checkAnswers();
        }
      } else if (e.key === 'Enter' && showResult) {
        handleNext();
      } else if (e.key === 'Escape') {
        setCurrentView('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [answers, showResult]);

  const allAnswered = (currentExercise?.blanks || []).every((_, index) => answers[index]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Exercise {currentIndex + 1} of {exercises.length}</span>
          <span>{module.name}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Complete the sentence by selecting the correct words:
        </h2>

        <div className="text-lg leading-relaxed mb-8 p-4 bg-gray-50 rounded-lg">
          {renderSentence()}
        </div>

        {/* Results */}
        {showResult && (
          <div className="space-y-3">
            {(currentExercise?.blanks || []).map((blank, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === blank.correct;
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  {isCorrect ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm">
                    Blank {index + 1}: 
                    <span className={isCorrect ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                      {userAnswer || 'No answer'}
                    </span>
                    {!isCorrect && (
                      <span className="text-green-600 ml-2">
                        (Correct: {blank.correct})
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!showResult ? (
          <button
            onClick={checkAnswers}
            disabled={!allAnswered}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-5 w-5" />
            <span>Check Answers</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <span>{currentIndex === exercises.length - 1 ? 'Finish' : 'Next Exercise'}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {!showResult && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Fill all blanks and press Enter or click Check Answers
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