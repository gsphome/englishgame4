// Script de prueba para verificar las traducciones del modal de settings
const { translations } = require('./src/utils/i18n.ts');

console.log('🧪 Verificando traducciones del modal de settings...\n');

// Claves que se usan en el modal de settings
const settingsKeys = [
  'settings.settings',
  'settings.generalSettings',
  'settings.itemSettings',
  'settings.categorySettings',
  'settings.theme',
  'settings.language',
  'settings.level',
  'settings.light',
  'settings.dark',
  'settings.english',
  'settings.spanish',
  'settings.all',
  'settings.a1',
  'settings.a2',
  'settings.b1',
  'settings.b2',
  'settings.c1',
  'settings.c2',
  'settings.flashcardMode',
  'settings.quizMode',
  'settings.completionMode',
  'settings.sortingMode',
  'settings.sortingCategories',
  'settings.matchingMode',
  'settings.vocabulary',
  'settings.grammar',
  'settings.phrasalVerbs',
  'settings.idioms',
  'settings.edit',
  'settings.cancel',
  'settings.save'
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

console.log('📋 Verificando traducciones en inglés:');
settingsKeys.forEach(key => {
  const value = getNestedValue(translations.en, key);
  console.log(`  ${key}: ${value || '❌ FALTA'}`);
});

console.log('\n📋 Verificando traducciones en español:');
settingsKeys.forEach(key => {
  const value = getNestedValue(translations.es, key);
  console.log(`  ${key}: ${value || '❌ FALTA'}`);
});

console.log('\n✅ Verificación completada!');