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
    if (checked) {
      setLocalCategories([...localCategories, category]);
    } else {
      setLocalCategories(localCategories.filter(c => c !== category));
    }
  };

  const handleGameSettingChange = (mode: string, setting: string, value: number) => {
    setLocalGameSettings({
      ...localGameSettings,
      [mode]: {
        ...localGameSettings[mode as keyof typeof localGameSettings],
        [setting]: value
      }
    });
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-96 max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold dark:text-white">{t('settings')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* General Settings */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: theme === 'dark' ? 'white' : '#6B7280' }}>
              {t('generalSettings')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 space-y-3">
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
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: theme === 'dark' ? 'white' : '#6B7280' }}>
              {t('itemSettings')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('flashcardMode')}</label>
                <input 
                  type="number"
                  className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localGameSettings.flashcardMode.wordCount}
                  onChange={(e) => handleGameSettingChange('flashcardMode', 'wordCount', parseInt(e.target.value))}
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
                  value={localGameSettings.quizMode.questionCount}
                  onChange={(e) => handleGameSettingChange('quizMode', 'questionCount', parseInt(e.target.value))}
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
                  value={localGameSettings.completionMode.itemCount}
                  onChange={(e) => handleGameSettingChange('completionMode', 'itemCount', parseInt(e.target.value))}
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
                  value={localGameSettings.sortingMode.wordCount}
                  onChange={(e) => handleGameSettingChange('sortingMode', 'wordCount', parseInt(e.target.value))}
                  min="1"
                  max="50"
                  disabled={!isEditMode}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm" style={{ color: labelColor }}>{t('matchingMode')}</label>
                <input 
                  type="number"
                  className="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-600 text-black dark:text-white"
                  value={localGameSettings.matchingMode.wordCount}
                  onChange={(e) => handleGameSettingChange('matchingMode', 'wordCount', parseInt(e.target.value))}
                  min="1"
                  max="50"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: theme === 'dark' ? 'white' : '#6B7280' }}>
              {t('categorySettings')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 space-y-2">
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
        <div className="flex justify-end space-x-2 mt-4">
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