// Test rápido para verificar que los toasts funcionan
// Ejecutar en la consola del navegador

// Test 1: Toast básico
console.log('🧪 Test 1: Toast básico');
import('./src/stores/toastStore.js').then(({ toast }) => {
  toast.success('Test básico', 'Este toast debería aparecer');
});

// Test 2: Toast single (como en respuestas)
setTimeout(() => {
  console.log('🧪 Test 2: Toast single');
  import('./src/stores/toastStore.js').then(({ toast }) => {
    toast.single.success('¡Correcto! 🎉', undefined, { duration: 2000 });
  });
}, 2000);

// Test 3: Toast error (como en respuestas incorrectas)
setTimeout(() => {
  console.log('🧪 Test 3: Toast error');
  import('./src/stores/toastStore.js').then(({ toast }) => {
    toast.single.error('Incorrecto', undefined, { duration: 2000 });
  });
}, 4000);