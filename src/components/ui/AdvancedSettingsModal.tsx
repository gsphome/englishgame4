import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import { validateNumber, validateGameSettings, sanitizeString, globalRateLimiter } from '../../utils/inputValidation';
import { logWarn } from '../../utils/logger';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'game' | 'categories'>('general');

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
    // Validate all settings before saving
    const validatedSettings = validateGameSettings(localGameSettings);

    // Apply all changes
    setTheme(localTheme);
    setLanguage(localLanguage);
    setLevel(localLevel);
    setCategories(localCategories);

    // Apply validated game settings
    Object.entries(validatedSettings).forEach(([mode, settings]) => {
      Object.entries(settings as Record<string, unknown>).forEach(([setting, value]) => {
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
    // Rate limiting for rapid changes
    if (!globalRateLimiter.isAllowed(`settings-${mode}-${setting}`)) {
      logWarn('Rate limit exceeded for settings change', { mode, setting }, 'AdvancedSettingsModal');
      return;
    }

    // Sanitize and validate input
    const sanitizedValue = sanitizeString(value, 10);
    let min = 1;
    let max = 50;

    // Special validation for categoryCount
    if (setting === 'categoryCount') {
      min = 2;
      max = 10;
    }

    const validValue = validateNumber(sanitizedValue, min, max, min);

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
    <div className="advanced-settings-modal">
      <div className="advanced-settings-modal__container">
        <div className="advanced-settings-modal__header">
          <h2 className="advanced-settings-modal__title">{t('settings')}</h2>
          <button
            onClick={onClose}
            className="advanced-settings-modal__close-btn"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation - Always Enabled */}
        <div className="advanced-settings-modal__tabs">
          <button
            onClick={() => setActiveTab('general')}
            className={`advanced-settings-modal__tab ${activeTab === 'general' ? 'advanced-settings-modal__tab--active' : ''}`}
          >
            <span className="advanced-settings-modal__tab-title">{t('generalSettings')}</span>
            <span className="advanced-settings-modal__tab-icon">🎛️</span>
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`advanced-settings-modal__tab ${activeTab === 'game' ? 'advanced-settings-modal__tab--active' : ''}`}
          >
            <span className="advanced-settings-modal__tab-title">{t('itemSettings')}</span>
            <span className="advanced-settings-modal__tab-icon">🎮</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`advanced-settings-modal__tab ${activeTab === 'categories' ? 'advanced-settings-modal__tab--active' : ''}`}
          >
            <span className="advanced-settings-modal__tab-title">{t('categorySettings')}</span>
            <span className="advanced-settings-modal__tab-icon">📚</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="advanced-settings-modal__tab-content">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="advanced-settings-modal__section">
              <div className="advanced-settings-modal__grid">
                <div className="advanced-settings-modal__field">
                  <label className="advanced-settings-modal__label">{t('theme')}</label>
                  <select
                    className="advanced-settings-modal__select"
                    value={localTheme}
                    onChange={(e) => setLocalTheme(e.target.value as 'light' | 'dark')}
                    disabled={!isEditMode}
                  >
                    <option value="light">☀️ {t('light')}</option>
                    <option value="dark">🌙 {t('dark')}</option>
                  </select>
                </div>

                <div className="advanced-settings-modal__field">
                  <label className="advanced-settings-modal__label">{t('language')}</label>
                  <select
                    className="advanced-settings-modal__select"
                    value={localLanguage}
                    onChange={(e) => setLocalLanguage(e.target.value as 'en' | 'es')}
                    disabled={!isEditMode}
                  >
                    <option value="en">🇺🇸 {t('english')}</option>
                    <option value="es">🇪🇸 {t('spanish')}</option>
                  </select>
                </div>

                <div className="advanced-settings-modal__field advanced-settings-modal__field--full">
                  <label className="advanced-settings-modal__label">{t('level')}</label>
                  <select
                    className="advanced-settings-modal__select advanced-settings-modal__select--full"
                    value={localLevel}
                    onChange={(e) => setLocalLevel(e.target.value as any)}
                    disabled={!isEditMode}
                  >
                    <option value="all">🌟 {t('all')}</option>
                    <option value="a1">🟢 {t('a1')}</option>
                    <option value="a2">🟡 {t('a2')}</option>
                    <option value="b1">🟠 {t('b1')}</option>
                    <option value="b2">🔴 {t('b2')}</option>
                    <option value="c1">🟣 {t('c1')}</option>
                    <option value="c2">⚫ {t('c2')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Game Settings Tab */}
          {activeTab === 'game' && (
            <div className="advanced-settings-modal__section">
              <div className="advanced-settings-modal__grid">
                <div className="advanced-settings-modal__field">
                  <label className="advanced-settings-modal__label">📚 {t('flashcardMode')}</label>
                  <input
                    type="number"
                    className="advanced-settings-modal__input"
                    value={localGameSettings.flashcardMode.wordCount || ''}
                    onChange={(e) => handleGameSettingChange('flashcardMode', 'wordCount', e.target.value)}
                    onBlur={() => handleInputBlur('flashcardMode', 'wordCount', localGameSettings.flashcardMode.wordCount)}
                    min="1"
                    max="50"
                    disabled={!isEditMode}
                  />
                </div>

                <div className="advanced-settings-modal__field">
                  <label className="advanced-settings-modal__label">❓ {t('quizMode')}</label>
                  <input
                    type="number"
                    className="advanced-settings-modal__input"
                    value={localGameSettings.quizMode.questionCount || ''}
                    onChange={(e) => handleGameSettingChange('quizMode', 'questionCount', e.target.value)}
                    onBlur={() => handleInputBlur('quizMode', 'questionCount', localGameSettings.quizMode.questionCount)}
                    min="1"
                    max="50"
                    disabled={!isEditMode}
                  />
                </div>

                <div className="advanced-settings-modal__field">
                  <label className="advanced-settings-modal__label">✏️ {t('completionMode')}</label>
                  <input
                    type="number"
                    className="advanced-settings-modal__input"
                    value={localGameSettings.completionMode.itemCount || ''}
                    onChange={(e) => handleGameSettingChange('completionMode', 'itemCount', e.target.value)}
                    onBlur={() => handleInputBlur('completionMode', 'itemCount', localGameSettings.completionMode.itemCount)}
                    min="1"
                    max="50"
                    disabled={!isEditMode}
                  />
                </div>

                <div className="advanced-settings-modal__field">
                  <label className="advanced-settings-modal__label">🔄 {t('sortingMode')}</label>
                  <input
                    type="number"
                    className="advanced-settings-modal__input"
                    value={localGameSettings.sortingMode.wordCount || ''}
                    onChange={(e) => handleGameSettingChange('sortingMode', 'wordCount', e.target.value)}
                    onBlur={() => handleInputBlur('sortingMode', 'wordCount', localGameSettings.sortingMode.wordCount)}
                    min="1"
                    max="50"
                    disabled={!isEditMode}
                  />
                </div>

                <div className="advanced-settings-modal__field">
                  <label className="advanced-settings-modal__label">📊 {t('sortingCategories')}</label>
                  <input
                    type="number"
                    className="advanced-settings-modal__input"
                    value={localGameSettings.sortingMode.categoryCount || ''}
                    onChange={(e) => handleGameSettingChange('sortingMode', 'categoryCount', e.target.value)}
                    onBlur={() => handleInputBlur('sortingMode', 'categoryCount', localGameSettings.sortingMode.categoryCount)}
                    min="2"
                    max="10"
                    disabled={!isEditMode}
                  />
                </div>

                <div className="advanced-settings-modal__field">
                  <label className="advanced-settings-modal__label">🔗 {t('matchingMode')}</label>
                  <input
                    type="number"
                    className="advanced-settings-modal__input"
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
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="advanced-settings-modal__section">
              <div className="advanced-settings-modal__categories">
                {allCategories.map(category => (
                  <div key={category} className="advanced-settings-modal__category-item">
                    <input
                      type="checkbox"
                      id={category}
                      checked={localCategories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      disabled={!isEditMode}
                      className="advanced-settings-modal__category-checkbox"
                    />
                    <label
                      htmlFor={category}
                      className="advanced-settings-modal__category-label"
                    >
                      {category === 'Vocabulary' && `📚 ${categoryLabels[category as keyof typeof categoryLabels]}`}
                      {category === 'Grammar' && `📝 ${categoryLabels[category as keyof typeof categoryLabels]}`}
                      {category === 'PhrasalVerbs' && `🔗 ${categoryLabels[category as keyof typeof categoryLabels]}`}
                      {category === 'Idioms' && `💭 ${categoryLabels[category as keyof typeof categoryLabels]}`}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="advanced-settings-modal__actions">
          {!isEditMode ? (
            <button
              onClick={handleEdit}
              className="advanced-settings-modal__btn advanced-settings-modal__btn--edit"
              aria-label="Edit settings"
            >
              <span className="advanced-settings-modal__btn-icon">✏️</span>
              <span className="advanced-settings-modal__btn-text">{t('edit')}</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="advanced-settings-modal__btn advanced-settings-modal__btn--cancel"
                aria-label="Cancel changes"
              >
                <span className="advanced-settings-modal__btn-icon">❌</span>
                <span className="advanced-settings-modal__btn-text">{t('cancel')}</span>
              </button>
              <button
                onClick={handleSave}
                className="advanced-settings-modal__btn advanced-settings-modal__btn--save"
                aria-label="Save settings"
              >
                <span className="advanced-settings-modal__btn-icon">💾</span>
                <span className="advanced-settings-modal__btn-text">{t('save')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};