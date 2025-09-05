import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import '../../styles/components/user-profile-form.css';

// Base schema for type inference
const baseProfileSchema = z.object({
  name: z.string().min(2),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  preferences: z.object({
    language: z.enum(['en', 'es']),
    dailyGoal: z.number().min(1).max(100),
    categories: z.array(z.string()).min(1),
    difficulty: z.number().min(1).max(5),
    notifications: z.boolean()
  })
});

// Create schema with dynamic error messages
const createProfileSchema = (t: (key: string, defaultValue?: string) => string) => z.object({
  name: z.string().min(2, t('profile.nameRequired', 'El nombre debe tener al menos 2 caracteres')),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  preferences: z.object({
    language: z.enum(['en', 'es']),
    dailyGoal: z.number().min(1).max(100),
    categories: z.array(z.string()).min(1, t('profile.categoriesRequired', 'Selecciona al menos una categoría')),
    difficulty: z.number().min(1).max(5),
    notifications: z.boolean()
  })
});

type ProfileFormData = z.infer<typeof baseProfileSchema>;

interface UserProfileFormProps {
  onClose: () => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ onClose }) => {
  const { user, setUser } = useUserStore();
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);

  const profileSchema = createProfileSchema(t);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: user || {
      name: '',
      level: 'beginner',
      preferences: {
        language: 'en',
        dailyGoal: 10,
        categories: [],
        difficulty: 3,
        notifications: true
      }
    }
  });

  const categories = [
    'Vocabulary', 'Grammar', 'PhrasalVerbs', 'Idioms'
  ] as const;

  const onSubmit = (data: ProfileFormData) => {
    const newUser = {
      id: user?.id || Date.now().toString(),
      ...data,
      email: user?.email,
      createdAt: user?.createdAt || new Date().toISOString(),
      preferences: {
        ...data.preferences,
        categories: data.preferences.categories as any // Temporary fix for build
      }
    };
    setUser(newUser);
    onClose();
  };

  return (
    <div className="user-profile-modal">
      <div className="user-profile-container">
        <div className="user-profile-content">
          <div className="user-profile-header">
            <div className="user-profile-title-section">
              <div className="user-profile-icon-container">
                <User className="user-profile-icon" />
              </div>
              <div>
                <h2 className="user-profile-title">
                  {t('profile.userProfile')}
                </h2>
                <p className="user-profile-subtitle">
                  {t('profile.profileSubtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="user-profile-close-btn"
              aria-label="Cerrar formulario de perfil"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="user-profile-form">
            {/* Basic Info */}
            <div className="profile-section profile-section--basic">
              <h3 className="profile-section-title profile-section-title--basic">
                <User className="profile-section-icon" />
                {t('profile.personalInfo')}
              </h3>

              <div className="profile-fields">
                <div>
                  <label className="profile-field-label">
                    {t('profile.name')} *
                  </label>
                  <input
                    {...register('name')}
                    className="profile-input profile-input--blue-focus"
                    placeholder={t('profile.enterName')}
                    aria-label={t('profile.name')}
                  />
                  {errors.name && (
                    <p className="profile-error">
                      <span className="profile-error-icon">⚠️</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="profile-field-label">
                    {t('profile.englishLevel')} *
                  </label>
                  <select
                    {...register('level')}
                    className="profile-select profile-select--blue-focus"
                    aria-label={t('profile.englishLevel')}
                  >
                    <option value="beginner">{t('profile.beginner')}</option>
                    <option value="intermediate">{t('profile.intermediate')}</option>
                    <option value="advanced">{t('profile.advanced')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="profile-section profile-section--preferences">
              <h3 className="profile-section-title profile-section-title--preferences">
                <span className="profile-section-icon">⚙️</span>
                {t('profile.learningPreferences')}
              </h3>

              <div className="profile-field-grid">
                <div>
                  <label className="profile-field-label">
                    {t('profile.interfaceLanguage')}
                  </label>
                  <select
                    {...register('preferences.language')}
                    className="profile-select profile-select--purple-focus"
                    aria-label={t('profile.interfaceLanguage')}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="profile-field-label">
                    {t('profile.dailyGoal')}
                  </label>
                  <div className="profile-relative">
                    <input
                      type="number"
                      {...register('preferences.dailyGoal', { valueAsNumber: true })}
                      min="1"
                      max="100"
                      className="profile-input profile-input--purple-focus profile-input--number"
                      aria-label={`${t('profile.dailyGoal')} (${t('dashboard.timeSpent')})`}
                    />
                    <span className="profile-input-addon">
                      min
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-spacing-sm">
                <label className="profile-field-label profile-field-label--difficulty">
                  {t('profile.difficultyLevel')}
                </label>
                <div className="profile-range-container">
                  <input
                    type="range"
                    {...register('preferences.difficulty', { valueAsNumber: true })}
                    min="1"
                    max="5"
                    className="profile-range-slider"
                    aria-label={`${t('profile.difficultyLevel')} (1-5)`}
                  />
                  <div className="profile-range-labels">
                    <span className="profile-range-label">
                      <span className="profile-range-emoji">😊</span>
                      {t('profile.easy')}
                    </span>
                    <span className="profile-range-label">
                      <span className="profile-range-emoji">🔥</span>
                      {t('profile.hard')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-spacing-sm">
                <label className="profile-field-label profile-field-label--categories">
                  {t('profile.interestedCategories')} *
                </label>
                <div className="profile-categories-container">
                  <div className="profile-categories-grid">
                    {categories.map((category) => (
                      <label key={category} className="profile-category-item">
                        <input
                          type="checkbox"
                          {...register('preferences.categories')}
                          value={category}
                          className="profile-category-checkbox"
                          aria-label={`${t('profile.interestedCategories')}: ${category}`}
                        />
                        <span className="profile-category-label">
                          {category === 'Vocabulary' && `📚 ${t('categories.vocabulary')}`}
                          {category === 'Grammar' && `📝 ${t('categories.grammar')}`}
                          {category === 'PhrasalVerbs' && `🔗 ${t('categories.phrasalverbs')}`}
                          {category === 'Idioms' && `💭 ${t('categories.idioms')}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {errors.preferences?.categories && (
                  <p className="profile-error">
                    <span className="profile-error-icon">⚠️</span>
                    {errors.preferences.categories.message}
                  </p>
                )}
              </div>

              <div className="profile-spacing-sm">
                <div className="profile-notifications-container">
                  <label className="profile-notifications-item">
                    <input
                      type="checkbox"
                      {...register('preferences.notifications')}
                      className="profile-notifications-checkbox"
                      aria-label="Habilitar notificaciones de recordatorio"
                    />
                    <div className="profile-notifications-content">
                      <span className="profile-notifications-title">
                        <span className="profile-notifications-icon">🔔</span>
                        {t('profile.enableNotifications')}
                      </span>
                      <p className="profile-notifications-description">
                        {t('profile.notificationDescription')}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
              <button
                type="button"
                onClick={onClose}
                className="profile-btn profile-btn--cancel"
                aria-label={t('common.cancel')}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="profile-btn profile-btn--save"
                aria-label={t('profile.saveProfile')}
              >
                <Save className="profile-btn-icon" />
                <span>{t('profile.saveProfile')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};