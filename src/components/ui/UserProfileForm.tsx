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
              tabIndex={13}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="user-profile-form">
            {/* Two-column grid layout for medium and large screens */}
            <div className="profile-content-grid">
              {/* Left Column - Personal Information */}
              <div className="profile-section profile-section--basic">
                <h3 className="profile-section-title profile-section-title--basic">
                  <User className="profile-section-icon" />
                  {t('profile.personalInfo')}
                </h3>

                <div className="profile-fields">
                  <div className={`profile-field-container ${errors.name ? 'profile-field-container--error' : ''}`}>
                    <label className="profile-field-label">
                      {t('profile.name')} *
                    </label>
                    <input
                      {...register('name')}
                      className={`profile-input profile-input--blue-focus ${errors.name ? 'profile-input--error' : ''}`}
                      placeholder={t('profile.enterName')}
                      aria-label={t('profile.name')}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      tabIndex={1}
                    />
                    {errors.name && (
                      <>
                        <div className="profile-error--compact" role="tooltip" aria-label={errors.name.message}>
                          !
                          <div className="profile-error-tooltip" id="name-error">
                            {errors.name.message}
                          </div>
                        </div>
                        <p className="profile-error--inline" id="name-error-text" aria-live="polite">
                          {errors.name.message}
                        </p>
                      </>
                    )}
                  </div>

                  <div className={`profile-field-container ${errors.level ? 'profile-field-container--error' : ''}`}>
                    <label className="profile-field-label">
                      {t('profile.englishLevel')} *
                    </label>
                    <select
                      {...register('level')}
                      className={`profile-select profile-select--blue-focus ${errors.level ? 'profile-select--error' : ''}`}
                      aria-label={t('profile.englishLevel')}
                      aria-invalid={errors.level ? 'true' : 'false'}
                      aria-describedby={errors.level ? 'level-error' : undefined}
                      tabIndex={2}
                    >
                      <option value="beginner">{t('profile.beginner')}</option>
                      <option value="intermediate">{t('profile.intermediate')}</option>
                      <option value="advanced">{t('profile.advanced')}</option>
                    </select>
                    {errors.level && (
                      <div className="profile-error--compact" role="tooltip" aria-label={errors.level.message}>
                        !
                        <div className="profile-error-tooltip" id="level-error">
                          {errors.level.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Learning Preferences */}
              <div className="profile-section profile-section--preferences">
                <h3 className="profile-section-title profile-section-title--preferences">
                  <span className="profile-section-icon">⚙️</span>
                  {t('profile.learningPreferences')}
                </h3>

                <div className="profile-field-grid">
                  <div className={`profile-field-item profile-field-container ${errors.preferences?.language ? 'profile-field-container--error' : ''}`}>
                    <label className="profile-field-label profile-field-label--compact">
                      {t('profile.language', 'Idioma')}
                    </label>
                    <select
                      {...register('preferences.language')}
                      className={`profile-select profile-select--purple-focus ${errors.preferences?.language ? 'profile-select--error' : ''}`}
                      aria-label={t('profile.interfaceLanguage')}
                      aria-invalid={errors.preferences?.language ? 'true' : 'false'}
                      aria-describedby={errors.preferences?.language ? 'language-error' : undefined}
                      tabIndex={3}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                    {errors.preferences?.language && (
                      <div className="profile-error--compact" role="tooltip" aria-label={errors.preferences.language.message}>
                        !
                        <div className="profile-error-tooltip" id="language-error">
                          {errors.preferences.language.message}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`profile-field-item profile-field-container ${errors.preferences?.dailyGoal ? 'profile-field-container--error' : ''}`}>
                    <label className="profile-field-label profile-field-label--compact">
                      {t('profile.dailyGoal', 'Meta Diaria')}
                    </label>
                    <div className="profile-relative">
                      <input
                        type="number"
                        {...register('preferences.dailyGoal', { valueAsNumber: true })}
                        min="1"
                        max="100"
                        className={`profile-input profile-input--purple-focus profile-input--number ${errors.preferences?.dailyGoal ? 'profile-input--error' : ''}`}
                        aria-label={`${t('profile.dailyGoal')} (${t('dashboard.timeSpent')})`}
                        aria-invalid={errors.preferences?.dailyGoal ? 'true' : 'false'}
                        aria-describedby={errors.preferences?.dailyGoal ? 'dailygoal-error' : undefined}
                        tabIndex={4}
                      />
                      <span className="profile-input-addon">
                        min
                      </span>
                    </div>
                    {errors.preferences?.dailyGoal && (
                      <div className="profile-error--compact" role="tooltip" aria-label={errors.preferences.dailyGoal.message}>
                        !
                        <div className="profile-error-tooltip" id="dailygoal-error">
                          {errors.preferences.dailyGoal.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`profile-spacing-sm profile-field-container ${errors.preferences?.difficulty ? 'profile-field-container--error' : ''}`}>
                  <label className="profile-field-label profile-field-label--difficulty profile-field-label--compact">
                    {t('profile.difficulty', 'Dificultad')}
                  </label>
                  <div className="profile-range-container">
                    <input
                      type="range"
                      {...register('preferences.difficulty', { valueAsNumber: true })}
                      min="1"
                      max="5"
                      className="profile-range-slider"
                      aria-label={`${t('profile.difficultyLevel')} (1-5)`}
                      aria-invalid={errors.preferences?.difficulty ? 'true' : 'false'}
                      aria-describedby={errors.preferences?.difficulty ? 'difficulty-error' : undefined}
                      tabIndex={5}
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
                  {errors.preferences?.difficulty && (
                    <div className="profile-error--compact" role="tooltip" aria-label={errors.preferences.difficulty.message}>
                      !
                      <div className="profile-error-tooltip" id="difficulty-error">
                        {errors.preferences.difficulty.message}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full-width sections below the grid */}
            <div className="profile-section profile-section--preferences">
              <div className={`profile-spacing-sm profile-field-container ${errors.preferences?.categories ? 'profile-field-container--error' : ''}`}>
                <label className="profile-field-label profile-field-label--categories">
                  {t('profile.interestedCategories')} *
                </label>
                <div className="profile-categories-container">
                  <div className="profile-categories-grid">
                    {categories.map((category, index) => (
                      <label key={category} className="profile-category-item">
                        <input
                          type="checkbox"
                          {...register('preferences.categories')}
                          value={category}
                          className="profile-category-checkbox"
                          aria-label={`${t('profile.interestedCategories')}: ${category}`}
                          aria-invalid={errors.preferences?.categories ? 'true' : 'false'}
                          aria-describedby={errors.preferences?.categories ? 'categories-error' : undefined}
                          tabIndex={6 + index}
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
                  <>
                    <div className="profile-error--compact" role="tooltip" aria-label={errors.preferences.categories.message}>
                      !
                      <div className="profile-error-tooltip" id="categories-error">
                        {errors.preferences.categories.message}
                      </div>
                    </div>
                    <p className="profile-error--inline" id="categories-error-text" aria-live="polite">
                      {errors.preferences.categories.message}
                    </p>
                  </>
                )}
              </div>

              <div className={`profile-spacing-sm profile-field-container ${errors.preferences?.notifications ? 'profile-field-container--error' : ''}`}>
                <div className="profile-notifications-container">
                  <label className="profile-notifications-item">
                    <input
                      type="checkbox"
                      {...register('preferences.notifications')}
                      className="profile-notifications-checkbox"
                      aria-label="Habilitar notificaciones de recordatorio"
                      aria-invalid={errors.preferences?.notifications ? 'true' : 'false'}
                      aria-describedby={errors.preferences?.notifications ? 'notifications-error' : undefined}
                      tabIndex={10}
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
                {errors.preferences?.notifications && (
                  <div className="profile-error--compact" role="tooltip" aria-label={errors.preferences.notifications.message}>
                    !
                    <div className="profile-error-tooltip" id="notifications-error">
                      {errors.preferences.notifications.message}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
              <button
                type="button"
                onClick={onClose}
                className="profile-btn profile-btn--cancel"
                aria-label={t('common.cancel')}
                tabIndex={12}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="profile-btn profile-btn--save"
                aria-label={t('profile.saveProfile')}
                tabIndex={11}
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