# 🧪 Test Architecture - English Learning App

## 🏗️ **Enterprise Test Structure**

```
tests/
├── unit/                    # Unit Tests - Individual component testing
│   ├── components/         
│   │   ├── ui/            # UI component tests (ModuleCard, UserProfileForm, etc.)
│   │   ├── learning/      # Learning module component tests
│   │   └── common/        # Common component tests (ErrorBoundary, etc.)
│   ├── hooks/             # Custom hook tests (useToast, useModuleData, etc.)
│   ├── stores/            # State management tests (toastStore, appStore, etc.)
│   ├── services/          # Service layer tests (API, authentication, etc.)
│   └── utils/             # Utility function tests (validation, formatting, etc.)
├── integration/            # Integration Tests - Multi-component workflows
│   ├── modules/           # Complete learning module workflows
│   ├── workflows/         # Cross-component user interactions
│   └── api/               # API integration and data flow tests
├── e2e/                   # End-to-End Tests - Complete user journeys
│   ├── learning-modules/  # Full learning experience tests
│   ├── user-flows/        # Complete user journey tests
│   └── performance/       # Performance and load testing
├── fixtures/              # Test Data - Reusable mock data
│   ├── modules/           # Learning module test data
│   ├── users/             # User profile test data
│   └── responses/         # API response mocks
├── helpers/               # Test Utilities - Shared testing tools
│   ├── test-utils.tsx     # React Testing Library utilities
│   ├── setup.ts           # Global test configuration
│   └── custom-matchers.ts # Custom Jest/Vitest matchers
└── debug/                 # Debug Tests - Diagnostic and troubleshooting
    ├── toast-debugging.test.ts      # Toast system diagnostics
    ├── debug-toast-test.js          # Manual toast testing script
    └── test-toast-cleanup.md        # Toast cleanup documentation
```

## 🎯 **Tipos de Pruebas**

### **Unit Tests** (`tests/unit/`)
- Pruebas de componentes individuales
- Pruebas de hooks personalizados
- Pruebas de funciones utilitarias
- Pruebas de stores

### **Integration Tests** (`tests/integration/`)
- Pruebas de módulos completos de aprendizaje
- Pruebas de flujos de datos entre componentes
- Pruebas de integración con APIs

### **E2E Tests** (`tests/e2e/`)
- Pruebas de flujos completos de usuario
- Pruebas de rendimiento
- Pruebas de accesibilidad

## 🚀 **Comandos de Pruebas**

```bash
# Todas las pruebas
npm test

# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración
npm run test:integration

# Solo pruebas E2E
npm run test:e2e

# Pruebas con coverage
npm run test:coverage

# Pruebas en modo watch
npm run test:watch

# Debugging de pruebas específicas
npm run test:debug
```

## 📋 **Convenciones**

### **Nomenclatura**
- `ComponentName.test.tsx` - Pruebas de componentes
- `hookName.test.ts` - Pruebas de hooks
- `serviceName.test.ts` - Pruebas de servicios
- `utilityName.test.ts` - Pruebas de utilidades

### **Estructura de Archivos**
- Cada archivo de prueba debe estar en la misma estructura que el archivo original
- Los mocks deben estar en `__mocks__/` dentro de cada directorio
- Los fixtures deben estar en `tests/fixtures/`

### **Cobertura Mínima**
- Componentes: 80%
- Hooks: 90%
- Servicios: 85%
- Utilidades: 95%