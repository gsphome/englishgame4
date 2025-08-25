import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Check, Info, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import type { LearningModule } from '../../types';

interface MatchingComponentProps {
  module: LearningModule;
}

export const MatchingComponent: React.FC<MatchingComponentProps> = ({ module }) => {
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const currentModuleIdRef = useRef<string | null>(null);
  
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();

  // Initialize component when module changes
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showExplanation) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          setShowExplanation(false);
        }
      } else if (e.key === 'Escape') {
        setCurrentView('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showExplanation]);

  useEffect(() => {
    if (!module?.data || !module?.id) return;
    if (currentModuleIdRef.current === module.id) return;
    
    currentModuleIdRef.current = module.id;

    let pairs: { left: string; right: string }[] = [];
    
    if (module.data[0]?.pairs) {
      pairs = module.data[0].pairs;
    } else if (Array.isArray(module.data)) {
      pairs = module.data.map((item: any) => ({
        left: item.en || item.term || '',
        right: item.es || item.definition || ''
      }));
    }

    if (pairs.length > 0) {
      const terms = pairs.map((pair: { left: string; right: string }) => pair.left).sort(() => Math.random() - 0.5);
      const definitions = pairs.map((pair: { left: string; right: string }) => pair.right).sort(() => Math.random() - 0.5);
      
      setLeftItems(terms);
      setRightItems(definitions);

      setMatches({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setShowResult(false);
    }
  }, [module?.data, module?.id]);

  if (!module?.data || leftItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">Loading matching exercise...</p>
      </div>
    );
  }

  const getPairs = (): { left: string; right: string }[] => {
    if (!module.data) return [];
    if (module.data[0]?.pairs) {
      return module.data[0].pairs;
    }
    return (module.data as any[]).map((item: any) => ({
      left: item.term || '',
      right: item.definition || ''
    }));
  };

  const pairs = getPairs();

  const handleLeftClick = (item: string) => {
    if (showResult || matches[item]) return;
    
    if (selectedLeft === item) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(item);
      if (selectedRight) {
        createMatch(item, selectedRight);
      }
    }
  };

  const handleRightClick = (item: string) => {
    if (showResult || Object.values(matches).includes(item)) return;
    
    if (selectedRight === item) {
      setSelectedRight(null);
    } else {
      setSelectedRight(item);
      if (selectedLeft) {
        createMatch(selectedLeft, item);
      }
    }
  };

  const createMatch = (left: string, right: string) => {
    setMatches(prev => ({ ...prev, [left]: right }));
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const removeMatch = (leftItem: string) => {
    if (showResult) return;
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[leftItem];
      return newMatches;
    });
  };

  const checkAnswers = () => {
    let correctMatches = 0;
    
    pairs.forEach((pair: { left: string; right: string }) => {
      if (matches[pair.left] === pair.right) {
        correctMatches++;
      }
    });
    
    const isAllCorrect = correctMatches === pairs.length;
    updateSessionScore(isAllCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);
  };

  const resetExercise = () => {
    const terms = pairs.map((pair: { left: string; right: string }) => pair.left).sort(() => Math.random() - 0.5);
    const definitions = pairs.map((pair: { left: string; right: string }) => pair.right).sort(() => Math.random() - 0.5);
    
    setLeftItems(terms);
    setRightItems(definitions);
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setShowResult(false);
  };

  const finishExercise = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = pairs.filter((pair: { left: string; right: string }) => matches[pair.left] === pair.right).length;
    const finalScore = Math.round((correctCount / pairs.length) * 100);
    updateUserScore(module.id, finalScore, timeSpent);
    setCurrentView('menu');
  };

  const allMatched = Object.keys(matches).length === pairs.length;

  const getItemStatus = (item: string, isLeft: boolean) => {
    if (showResult) {
      if (isLeft) {
        const correctMatch = pairs.find((pair: { left: string; right: string }) => pair.left === item)?.right;
        const userMatch = matches[item];
        return userMatch === correctMatch ? 'correct' : 'incorrect';
      } else {
        const correctPair = pairs.find((pair: { left: string; right: string }) => pair.right === item);
        const userMatch = Object.entries(matches).find(([_, right]) => right === item);
        if (correctPair && userMatch) {
          return userMatch[0] === correctPair.left ? 'correct' : 'incorrect';
        }
        return Object.values(matches).includes(item) ? 'incorrect' : 'unmatched';
      }
    }
    return 'normal';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Matching: {module.name}</span>
          <span>{Object.keys(matches).length}/{pairs.length} matched</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(matches).length / pairs.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Click items from both columns to match them</p>
      </div>

      {/* Compact Matching Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Terms Column */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">Terms</h3>
            {leftItems.map((item, index) => {
              const isMatched = matches[item];
              const isSelected = selectedLeft === item;
              const status = getItemStatus(item, true);
              
              let className = "w-full p-3 text-sm text-left border-2 rounded-xl transition-all duration-200 font-medium ";
              
              if (showResult) {
                className += status === 'correct' 
                  ? 'border-green-400 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'border-red-400 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
              } else if (isMatched) {
                className += 'border-pink-400 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 cursor-pointer';
              } else if (isSelected) {
                className += 'border-pink-500 bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-100 shadow-md scale-105';
              } else {
                className += 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900 cursor-pointer hover:shadow-md hover:scale-102';
              }

              return (
                <button
                  key={`left-${index}`}
                  onClick={() => isMatched ? removeMatch(item) : handleLeftClick(item)}
                  className={className}
                >
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="truncate flex-1">{item}</span>
                    <div className="flex items-center space-x-1">
                      {showResult && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const termData = (module.data as any[])?.find((d: any) => d.term === item);
                            setSelectedTerm(termData);
                            setShowExplanation(true);
                          }}
                          className="flex-shrink-0 w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                          title="Show explanation"
                        >
                          <Info className="h-3 w-3" />
                        </button>
                      )}
                      {isMatched && (
                        <span className="flex-shrink-0 w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {rightItems.findIndex(def => matches[item] === def) + 1}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Definitions Column */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">Definitions</h3>
            {rightItems.map((item, index) => {
              const isMatched = Object.values(matches).includes(item);
              const isSelected = selectedRight === item;
              const status = getItemStatus(item, false);
              
              let className = "w-full p-3 text-sm text-left border-2 rounded-xl transition-all duration-200 ";
              
              if (showResult) {
                className += status === 'correct' 
                  ? 'border-green-400 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : status === 'incorrect'
                  ? 'border-red-400 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
              } else if (isMatched) {
                className += 'border-pink-400 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 opacity-60';
              } else if (isSelected) {
                className += 'border-pink-500 bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-100 shadow-md scale-105';
              } else {
                className += 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900 cursor-pointer hover:shadow-md hover:scale-102';
              }

              return (
                <button
                  key={`right-${index}`}
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched}
                  className={className}
                >
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="truncate flex-1">{item}</span>
                    {isMatched && (
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {String.fromCharCode(65 + leftItems.findIndex(term => matches[term] === item))}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="flex space-x-1">
              {Array.from({ length: pairs.length }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < Object.keys(matches).length
                      ? 'bg-pink-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              {showResult 
                ? `${pairs.filter((pair: { left: string; right: string }) => matches[pair.left] === pair.right).length}/${pairs.length} correct`
                : `${Object.keys(matches).length}/${pairs.length}`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!showResult ? (
          <>
            <button
              onClick={resetExercise}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={checkAnswers}
              disabled={!allMatched}
              className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-5 w-5" />
              <span>Check Matches</span>
            </button>
          </>
        ) : (
          <button
            onClick={finishExercise}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Finish Exercise
          </button>
        )}
      </div>

      {!showResult && !allMatched && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Match all pairs to check your answers
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && selectedTerm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedTerm.term}
                </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Definition:</h4>
                  <p className="text-gray-900 dark:text-white">{selectedTerm.definition}</p>
                </div>
                
                {selectedTerm.explanation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Explanation:</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedTerm.explanation}</p>
                  </div>
                )}
                
                {selectedTerm.term_es && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spanish:</h4>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedTerm.term_es}</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowExplanation(false)}
                className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to menu */}
      <button
        onClick={() => setCurrentView('menu')}
        className="w-full mt-6 px-4 py-2 bg-gray-50 border-2 border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Back to Menu
      </button>
    </div>
  );
};