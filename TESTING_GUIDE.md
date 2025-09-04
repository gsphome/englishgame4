# Testing Guide

## Scripts de Testing Disponibles

### Comandos Principales

```bash
# Ejecutar todas las pruebas una vez (CI/CD)
npm run test

# Ejecutar pruebas en modo watch (desarrollo)
npm run test:watch

# Ejecutar pruebas con coverage
npm run test:coverage

# Ejecutar pruebas con interfaz visual
npm run test:ui
```

### Configuración

- **Framework**: Vitest con jsdom
- **Testing Library**: @testing-library/react
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: v8 provider

### Estructura de Tests

```
src/
├── test/
│   ├── setup.ts          # Configuración global
│   ├── utils.tsx         # Utilidades de testing
│   └── mocks/
│       └── handlers.ts   # Handlers de MSW
├── **/*.test.ts          # Tests unitarios
└── **/*.test.tsx         # Tests de componentes
```

### Coverage Thresholds

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Comandos de Desarrollo

```bash
# Modo watch para desarrollo activo
npm run test:watch

# Coverage detallado
npm run test:coverage

# Interfaz visual para debugging
npm run test:ui
```

### CI/CD

El pipeline ejecuta automáticamente:
1. `npm run test` - Pruebas unitarias
2. `npm run test:coverage` - Coverage report
3. Upload a Codecov

### Troubleshooting

Si las pruebas se quedan "colgadas":
- Usar `npm run test` (ejecuta una vez y termina)
- Evitar `npm run test:watch` en CI/CD
- Verificar que no hay procesos zombie con `ps aux | grep vitest`