import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  preferences: z.object({
    language: z.enum(['en', 'es']),
    dailyGoal: z.number().min(1).max(100),
    categories: z.array(z.string()).min(1, 'Select at least one category'),
    difficulty: z.number().min(1).max(5),
    notifications: z.boolean()
  })
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  onClose: () => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ onClose }) => {
  const { user, setUser } = useUserStore();
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);
  
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
    'General English', 'Business', 'Academic', 'IELTS', 'Grammar', 
    'Vocabulary', 'Pronunciation', 'Conversation'
  ];

  const onSubmit = (data: ProfileFormData) => {
    const newUser = {
      id: user?.id || Date.now().toString(),
      ...data,
      email: user?.email,
      createdAt: user?.createdAt || new Date().toISOString()
    };
    setUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('userProfile') || 'User Profile'}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('name') || 'Name'} *
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('enterName') || 'Enter your name'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('englishLevel') || 'English Level'} *
              </label>
              <select
                {...register('level')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Preferences */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('preferences') || 'Preferences'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interface Language
                  </label>
                  <select
                    {...register('preferences.language')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Goal (minutes)
                  </label>
                  <input
                    type="number"
                    {...register('preferences.dailyGoal', { valueAsNumber: true })}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level (1-5)
                </label>
                <input
                  type="range"
                  {...register('preferences.difficulty', { valueAsNumber: true })}
                  min="1"
                  max="5"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Easy</span>
                  <span>Hard</span>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Interested Categories *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('preferences.categories')}
                        value={category}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
                {errors.preferences?.categories && (
                  <p className="mt-1 text-sm text-red-600">{errors.preferences.categories.message}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('preferences.notifications')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{t('saveProfile') || 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};