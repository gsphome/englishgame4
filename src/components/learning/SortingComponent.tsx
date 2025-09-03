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

const SortingComponent: React.FC<SortingComponentProps> = ({ module }) => {
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
        const { gameSettings } = useSettingsStore.getState();
        const totalWords = gameSettings.sortingMode.wordCount;
        const categoryCount = gameSettings.sortingMode.categoryCount || 3;
        const selectedCategories = shuffledCategories.slice(0, categoryCount);
        const wordsPerCategory = Math.ceil(totalWords / categoryCount);
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
        
        // Limit total words to settings value
        const finalWords = wordsForCategories.slice(0, totalWords);
        
        // Update categories to only include words that are actually available
        const updatedCategories = categories.map(category => ({
          ...category,
          items: category.items.filter(word => finalWords.includes(word))
        }));
        
        newExercise = {
          id: 'sorting-exercise',
          words: finalWords,
          categories: updatedCategories
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
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Compact header with progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{module.name}</h2>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            {exercise.words.length - availableWords.length}/{exercise.words.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${exercise.words.length > 0 ? ((exercise.words.length - availableWords.length) / exercise.words.length) * 100 : 0}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          {allWordsSorted ? 'All words sorted! Check your answers' : 'Drag and drop words into categories'}
        </p>
      </div>

      {/* Available Words */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Words</h3>
        <div className="min-h-[80px] p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, index) => (
              <div
                key={`available-${index}-${word}`}
                draggable
                onDragStart={(e) => handleDragStart(e, word)}
                className="px-2 py-1 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg cursor-move hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors select-none text-xs sm:text-sm"
              >
                {word}
              </div>
            ))}
          </div>
          {availableWords.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center">All words have been sorted!</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-1 sm:gap-4 lg:gap-6 mb-4">
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
              className={`p-1 sm:p-4 border-2 border-dashed rounded-lg min-h-[140px] sm:min-h-[200px] ${
                showResult
                  ? isCorrect
                    ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900'
                    : hasErrors
                    ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-center text-sm sm:text-base">
                {category.name}
                {showResult && (
                  <span className={`ml-2 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </h4>
              
              <div className="space-y-2">
                {userItems.map((word, index) => (
                  <div
                    key={`${category.name}-${index}-${word}`}
                    onClick={() => handleRemoveFromCategory(word, category.name)}
                    className={`px-1 py-1 sm:px-3 sm:py-2 rounded text-center cursor-pointer transition-colors text-xs sm:text-sm ${
                      showResult
                        ? category.items.includes(word)
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    {word}
                  </div>
                ))}
              </div>

              {showResult && hasErrors && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded text-xs">
                  <strong className="text-yellow-800 dark:text-yellow-200">Correct items:</strong> <span className="text-yellow-700 dark:text-yellow-300">{category.items.join(', ')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unified Control Bar */}
      <div className="flex justify-center items-center gap-3 flex-wrap mt-6">
        {!showResult ? (
          <>
            <button
              onClick={resetExercise}
              className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-sm"
              title="Reset Exercise"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={checkAnswers}
              disabled={!allWordsSorted}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Check Answers</span>
            </button>
          </>
        ) : (
          <button
            onClick={finishExercise}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <span>Finish Exercise</span>
          </button>
        )}
        
        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        
        {/* Navigation */}
        <button
          onClick={() => setCurrentView('menu')}
          className="flex items-center gap-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
        >
          ← Menu
        </button>
      </div>
    </div>
  );
};

export default SortingComponent;