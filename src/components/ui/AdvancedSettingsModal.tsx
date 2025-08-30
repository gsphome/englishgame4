import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    theme, language, level, categories, gameSettings,
    setTheme, setLanguage, setLevel, setCategories, setGameSetting 
  } = useSettingsStore();
  
  const { t } = useTranslation(language);
  const labelColor = '#000000'; // Negro para fondo blanco
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Local state for editing
  const [localTheme, setLocalTheme] = useState(theme);
  const [localLanguage, setLocalLanguage] = useState(language);
  const [localLevel, setLocalLevel] = useState(level);
  const [localCategories, setLocalCategories] = useState(categories);
  const [localGameSettings, setLocalGameSettings] = useState(gameSettings);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalTheme(theme);
      setLocalLanguage(language);
      setLocalLevel(level);
      setLocalCategories(categories);
      setLocalGameSettings(gameSettings);
      setIsEditMode(false);
    }
  }, [isOpen, theme, language, level, categories, gameSettings]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    // Apply all changes
    setTheme(localTheme);
    setLanguage(localLanguage);
    setLevel(localLevel);
    setCategories(localCategories);
    
    // Apply game settings
    Object.entries(localGameSettings).forEach(([mode, settings]) => {
      Object.entries(settings).forEach(([setting, value]) => {
        setGameSetting(mode as any, setting, value as number);
      });
    });
    
    setIsEditMode(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalTheme(theme);
    setLocalLanguage(language);
    setLocalLevel(level);
    setLocalCategories(categories);
    setLocalGameSettings(gameSettings);
    setIsEditMode(false);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    let newCategories;
    if (checked) {
      newCategories = [...localCategories, category];
    } else {
      newCategories = localCategories.filter(c => c !== category);
    }
    
    // UX: If no categories selected, auto-select all for consistency
    if (newCategories.length === 0) {
      newCategories = [...allCategories];
    }
    
    setLocalCategories(newCategories);
  };

  const handleGameSettingChange = (mode: string, setting: string, value: string) => {
    // Parse and validate the value
    const numValue = parseInt(value) || 0;
    const validValue = Math.max(1, Math.min(50, numValue)); // Clamp between 1-50
    
    setLocalGameSettings({
      ...localGameSettings,
      [mode]: {
        ...localGameSettings[mode as keyof typeof localGameSettings],
        [setting]: validValue
      }
    });
  };
  
  const handleInputBlur = (mode: string, setting: string, currentValue: number) => {
    // Ensure valid value on blur
    let min = 1;
    let max = 50;
    
    // Special validation for categoryCount
    if (setting === 'categoryCount') {
      min = 2;
      max = 10; // Will be updated with actual max from data
    }
    
    if (isNaN(currentValue) || currentValue < min) {
      handleGameSettingChange(mode, setting, min.toString());
    } else if (currentValue > max) {
      handleGameSettingChange(mode, setting, max.toString());
    }
  };

  if (!isOpen) return null;

  const allCategories = ['Vocabulary', 'Grammar', 'PhrasalVerbs', 'Idioms'];
  const categoryLabels = {
    'Vocabulary': t('vocabulary'),
    'Grammar': t('grammar'),
    'PhrasalVerbs': t('phrasalVerbs'),
    'Idioms': t('idioms')
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 w-80 max-w-sm mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold dark:text-white">{t('settings')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {/* General Settings */}
          <div>
            <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme === 'dark' ? 'white' : '#6B7280' }}>
              {t('generalSettings')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('theme')}</label>
                <select 
                  className="w-28 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localTheme}
                  onChange={(e) => setLocalTheme(e.target.value as 'light' | 'dark')}
                  disabled={!isEditMode}
                >
                  <option value="light">{t('light')}</option>
                  <option value="dark">{t('dark')}</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('language')}</label>
                <select 
                  className="w-28 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localLanguage}
                  onChange={(e) => setLocalLanguage(e.target.value as 'en' | 'es')}
                  disabled={!isEditMode}
                >
                  <option value="en">{t('english')}</option>
                  <option value="es">{t('spanish')}</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('level')}</label>
                <select 
                  className="w-28 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localLevel}
                  onChange={(e) => setLocalLevel(e.target.value as any)}
                  disabled={!isEditMode}
                >
                  <option value="all">{t('all')}</option>
                  <option value="a1">{t('a1')}</option>
                  <option value="a2">{t('a2')}</option>
                  <option value="b1">{t('b1')}</option>
                  <option value="b2">{t('b2')}</option>
                  <option value="c1">{t('c1')}</option>
                  <option value="c2">{t('c2')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div>
            <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme === 'dark' ? 'white' : '#6B7280' }}>
              {t('itemSettings')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('flashcardMode')}</label>
                <input 
                  type="number"
                  className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localGameSettings.flashcardMode.wordCount || ''}
                  onChange={(e) => handleGameSettingChange('flashcardMode', 'wordCount', e.target.value)}
                  onBlur={() => handleInputBlur('flashcardMode', 'wordCount', localGameSettings.flashcardMode.wordCount)}
                  min="1"
                  max="50"
                  disabled={!isEditMode}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('quizMode')}</label>
                <input 
                  type="number"
                  className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localGameSettings.quizMode.questionCount || ''}
                  onChange={(e) => handleGameSettingChange('quizMode', 'questionCount', e.target.value)}
                  onBlur={() => handleInputBlur('quizMode', 'questionCount', localGameSettings.quizMode.questionCount)}
                  min="1"
                  max="50"
                  disabled={!isEditMode}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('completionMode')}</label>
                <input 
                  type="number"
                  className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localGameSettings.completionMode.itemCount || ''}
                  onChange={(e) => handleGameSettingChange('completionMode', 'itemCount', e.target.value)}
                  onBlur={() => handleInputBlur('completionMode', 'itemCount', localGameSettings.completionMode.itemCount)}
                  min="1"
                  max="50"
                  disabled={!isEditMode}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('sortingMode')}</label>
                <input 
                  type="number"
                  className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localGameSettings.sortingMode.wordCount || ''}
                  onChange={(e) => handleGameSettingChange('sortingMode', 'wordCount', e.target.value)}
                  onBlur={() => handleInputBlur('sortingMode', 'wordCount', localGameSettings.sortingMode.wordCount)}
                  min="1"
                  max="50"
                  disabled={!isEditMode}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('sortingCategories')}</label>
                <input 
                  type="number"
                  className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localGameSettings.sortingMode.categoryCount || ''}
                  onChange={(e) => handleGameSettingChange('sortingMode', 'categoryCount', e.target.value)}
                  onBlur={() => handleInputBlur('sortingMode', 'categoryCount', localGameSettings.sortingMode.categoryCount)}
                  min="2"
                  max="10"
                  disabled={!isEditMode}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('matchingMode')}</label>
                <input 
                  type="number"
                  className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localGameSettings.matchingMode.wordCount || ''}
                  onChange={(e) => handleGameSettingChange('matchingMode', 'wordCount', e.target.value)}
                  onBlur={() => handleInputBlur('matchingMode', 'wordCount', localGameSettings.matchingMode.wordCount)}
                  min="1"
                  max="50"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme === 'dark' ? 'white' : '#6B7280' }}>
              {t('categorySettings')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 space-y-1">
              {allCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id={category}
                    checked={localCategories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    disabled={!isEditMode}
                    className="rounded"
                  />
                  <label 
                    htmlFor={category}
                    className="text-sm flex-1"
                    style={{ color: labelColor }}
                  >
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-3">
          {!isEditMode ? (
            <button 
              onClick={handleEdit}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              {t('edit')}
            </button>
          ) : (
            <>
              <button 
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                {t('save')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};