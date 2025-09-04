import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t('profile.userProfile')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t('profile.profileSubtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              aria-label="Cerrar formulario de perfil"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-600 dark:text-gray-100 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                {t('profile.personalInfo')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                    {t('profile.name')} *
                  </label>
                  <input
                    {...register('name')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-300"
                    placeholder={t('profile.enterName')}
                    aria-label={t('profile.name')}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                    {t('profile.englishLevel')} *
                  </label>
                  <select
                    {...register('level')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
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
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200 dark:border-purple-600">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-purple-600 dark:text-purple-200 mb-6 flex items-center">
                <span className="mr-2">⚙️</span>
                {t('profile.learningPreferences')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                    {t('profile.interfaceLanguage')}
                  </label>
                  <select
                    {...register('preferences.language')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    aria-label={t('profile.interfaceLanguage')}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                    {t('profile.dailyGoal')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('preferences.dailyGoal', { valueAsNumber: true })}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 pr-16 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      aria-label={`${t('profile.dailyGoal')} (${t('dashboard.timeSpent')})`}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-200 font-medium">
                      min
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-3">
                  {t('profile.difficultyLevel')}
                </label>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <input
                    type="range"
                    {...register('preferences.difficulty', { valueAsNumber: true })}
                    min="1"
                    max="5"
                    className="w-full h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer slider"
                    aria-label={`${t('profile.difficultyLevel')} (1-5)`}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-100 mt-2 font-medium">
                    <span className="flex items-center">
                      <span className="mr-1">😊</span>
                      {t('profile.easy')}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">🔥</span>
                      {t('profile.hard')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-3">
                  {t('profile.interestedCategories')} *
                </label>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                        <input
                          type="checkbox"
                          {...register('preferences.categories')}
                          value={category}
                          className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-2"
                          aria-label={`${t('profile.interestedCategories')}: ${category}`}
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-white font-medium">
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
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.preferences.categories.message}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('preferences.notifications')}
                      className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-2"
                      aria-label="Habilitar notificaciones de recordatorio"
                    />
                    <div className="ml-3">
                      <span className="text-sm text-gray-700 dark:text-white font-medium flex items-center">
                        <span className="mr-2">🔔</span>
                        {t('profile.enableNotifications')}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-100 mt-1">
                        {t('profile.notificationDescription')}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium border border-gray-200 dark:border-gray-600"
                aria-label={t('common.cancel')}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label={t('profile.saveProfile')}
              >
                <Save className="h-5 w-5" />
                <span>{t('profile.saveProfile')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};