import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Check } from 'lucide-react';
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
  const currentModuleIdRef = useRef<string | null>(null);
  
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();

  // Initialize component when module changes
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
      const left = pairs.map((pair: { left: string; right: string }) => pair.left).sort(() => Math.random() - 0.5);
      const right = pairs.map((pair: { left: string; right: string }) => pair.right).sort(() => Math.random() - 0.5);
      
      setLeftItems(left);
      setRightItems(right);
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
      left: item.en || item.term || '',
      right: item.es || item.definition || ''
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
    const left = pairs.map((pair: { left: string; right: string }) => pair.left).sort(() => Math.random() - 0.5);
    const right = pairs.map((pair: { left: string; right: string }) => pair.right).sort(() => Math.random() - 0.5);
    
    setLeftItems(left);
    setRightItems(right);
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{module.name}</h2>
        <p className="text-gray-600">Click items from both columns to match them</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Terms</h3>
          <div className="space-y-3">
            {leftItems.map((item, index) => {
              const isMatched = matches[item];
              const isSelected = selectedLeft === item;
              const status = getItemStatus(item, true);
              
              let className = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
              
              if (showResult) {
                className += status === 'correct' 
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-red-500 bg-red-50 text-red-800';
              } else if (isMatched) {
                className += 'border-blue-500 bg-blue-50 text-blue-800 cursor-pointer';
              } else if (isSelected) {
                className += 'border-blue-500 bg-blue-100 text-blue-900';
              } else {
                className += 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
              }

              return (
                <button
                  key={`left-${index}`}
                  onClick={() => isMatched ? removeMatch(item) : handleLeftClick(item)}
                  className={className}
                >
                  <div className="flex justify-between items-center">
                    <span>{item}</span>
                    {isMatched && (
                      <span className="text-sm text-gray-600">
                        → {matches[item]}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center - Instructions */}
        <div className="flex items-center justify-center">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">↔️</div>
            <p className="text-sm text-gray-600">
              {showResult 
                ? `${pairs.filter((pair: { left: string; right: string }) => matches[pair.left] === pair.right).length}/${pairs.length} correct`
                : `${Object.keys(matches).length}/${pairs.length} matched`
              }
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Definitions</h3>
          <div className="space-y-3">
            {rightItems.map((item, index) => {
              const isMatched = Object.values(matches).includes(item);
              const isSelected = selectedRight === item;
              const status = getItemStatus(item, false);
              
              let className = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
              
              if (showResult) {
                className += status === 'correct' 
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : status === 'incorrect'
                  ? 'border-red-500 bg-red-50 text-red-800'
                  : 'border-gray-300 bg-gray-50 text-gray-600';
              } else if (isMatched) {
                className += 'border-blue-500 bg-blue-50 text-blue-800';
              } else if (isSelected) {
                className += 'border-blue-500 bg-blue-100 text-blue-900';
              } else {
                className += 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
              }

              return (
                <button
                  key={`right-${index}`}
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched}
                  className={className}
                >
                  {item}
                </button>
              );
            })}
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