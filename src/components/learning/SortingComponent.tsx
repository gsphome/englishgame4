import React, { useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { LearningModule } from '../../types';

interface SortingData {
  id: string;
  words: string[];
  categories: { name: string; items: string[] }[];
}

interface SortingComponentProps {
  module: LearningModule;
}

export const SortingComponent: React.FC<SortingComponentProps> = ({ module }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [sortedItems, setSortedItems] = useState<Record<string, string[]>>({});
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();

  const [exercise, setExercise] = useState<SortingData>({ id: '', words: [], categories: [] });
  

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentView('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    let newExercise: SortingData = { id: '', words: [], categories: [] };
    
    if (module?.data && Array.isArray(module.data)) {
      const firstItem = module.data[0];
      if (firstItem && 'category' in firstItem && 'word' in firstItem) {
        const uniqueCategories = [...new Set(module.data.map((item: any) => item.category))];
        const shuffledCategories = uniqueCategories.sort(() => Math.random() - 0.5);
        const selectedCategories = shuffledCategories.slice(0, 3);
        
        const { gameSettings } = useSettingsStore.getState();
        const wordsPerCategory = gameSettings.sortingMode.wordCount;
        console.log('SortingComponent - wordsPerCategory from settings:', wordsPerCategory);
        const wordsForCategories: string[] = [];
        
        const categories = selectedCategories.map(categoryId => {
          const categoryWords = (module.data || [])
            .filter((item: any) => item.category === categoryId)
            .map((item: any) => item.word)
            .slice(0, wordsPerCategory);
          
          wordsForCategories.push(...categoryWords);
          
          return {
            name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
            items: categoryWords
          };
        });
        
        newExercise = {
          id: 'sorting-exercise',
          words: wordsForCategories,
          categories
        };
      }
    }
    
    setExercise(newExercise);
    
    if (newExercise.words?.length > 0) {
      const shuffled = [...newExercise.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      
      const initialSorted: Record<string, string[]> = {};
      (newExercise.categories || []).forEach(cat => {
        initialSorted[cat.name] = [];
      });
      setSortedItems(initialSorted);
    }
  }, [module.id]);

  const handleDragStart = (e: React.DragEvent, word: string) => {
    setDraggedItem(word);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, categoryName: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Remove from available words
    setAvailableWords(prev => prev.filter(word => word !== draggedItem));
    
    // Add to category
    setSortedItems(prev => ({
      ...prev,
      [categoryName]: [...(prev[categoryName] || []), draggedItem]
    }));
    
    setDraggedItem(null);
  };

  const handleRemoveFromCategory = (word: string, categoryName: string) => {
    if (showResult) return;
    
    // Remove from category
    setSortedItems(prev => ({
      ...prev,
      [categoryName]: (prev[categoryName] || []).filter(w => w !== word)
    }));
    
    // Add back to available words
    setAvailableWords(prev => [...prev, word]);
  };

  const checkAnswers = () => {
    let correctCategories = 0;
    
    (exercise.categories || []).forEach(category => {
      const userItems = sortedItems[category.name] || [];
      const correctItems = category.items;
      
      // Check if all correct items are in user's category and no extra items
      const isCorrect = userItems.length === correctItems.length &&
                       userItems.every(item => correctItems.includes(item));
      
      if (isCorrect) {
        correctCategories++;
      }
    });
    
    const isAllCorrect = correctCategories === (exercise.categories?.length || 0);
    updateSessionScore(isAllCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);
  };

  const resetExercise = () => {
    const shuffled = [...exercise.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    
    const initialSorted: Record<string, string[]> = {};
    (exercise.categories || []).forEach(cat => {
      initialSorted[cat.name] = [];
    });
    setSortedItems(initialSorted);
    setShowResult(false);
  };

  const finishExercise = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const { sessionScore } = useAppStore.getState();
    const finalScore = sessionScore.correct > 0 ? 100 : 0;
    updateUserScore(module.id, finalScore, timeSpent);
    setCurrentView('menu');
  };

  const allWordsSorted = availableWords.length === 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{module.name}</h2>
        <p className="text-gray-600">Drag and drop words into the correct categories</p>
      </div>

      {/* Available Words */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Words</h3>
        <div className="min-h-[80px] p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, index) => (
              <div
                key={`available-${index}-${word}`}
                draggable
                onDragStart={(e) => handleDragStart(e, word)}
                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg cursor-move hover:bg-blue-200 transition-colors select-none"
              >
                {word}
              </div>
            ))}
          </div>
          {availableWords.length === 0 && (
            <p className="text-gray-500 text-center">All words have been sorted!</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {(exercise.categories || []).map((category) => {
          const userItems = sortedItems[category.name] || [];
          const isCorrect = showResult && 
            userItems.length === category.items.length &&
            userItems.every(item => category.items.includes(item));
          const hasErrors = showResult && !isCorrect;

          return (
            <div
              key={category.name}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.name)}
              className={`p-4 border-2 border-dashed rounded-lg min-h-[200px] ${
                showResult
                  ? isCorrect
                    ? 'border-green-400 bg-green-50'
                    : hasErrors
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400'
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-3 text-center">
                {category.name}
                {showResult && (
                  <span className={`ml-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </h4>
              
              <div className="space-y-2">
                {userItems.map((word, index) => (
                  <div
                    key={`${category.name}-${index}-${word}`}
                    onClick={() => handleRemoveFromCategory(word, category.name)}
                    className={`px-3 py-2 rounded-lg text-center cursor-pointer transition-colors ${
                      showResult
                        ? category.items.includes(word)
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {word}
                  </div>
                ))}
              </div>

              {showResult && hasErrors && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong>Correct items:</strong> {category.items.join(', ')}
                </div>
              )}
            </div>
          );
        })}
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
              disabled={!allWordsSorted}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-5 w-5" />
              <span>Check Answers</span>
            </button>
          </>
        ) : (
          <button
            onClick={finishExercise}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Finish Exercise
          </button>
        )}
      </div>

      {!showResult && !allWordsSorted && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Sort all words into categories to check your answers
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