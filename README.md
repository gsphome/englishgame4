# English Learning App - React Version

## 🚀 Stack Tecnológico

- **React 18** + **TypeScript 5+**
- **Vite** (Build tool + HMR)
- **Zustand** (State management)
- **TanStack Query** (Data fetching)
- **Lucide React** (Icons)
- **Tailwind CSS** (Styling)
- **Vitest** (Testing)

## 📋 Descripción

Aplicación web interactiva diseñada para mejorar las habilidades del idioma inglés a través de varios ejercicios atractivos. Cuenta con un diseño modular, carga de contenido dinámico y una interfaz fácil de usar.

## ✨ Funcionalidades

- **Ejercicios Interactivos:** Incluye completion, flashcards, matching, quizzes y sorting games
- **Diseño Modular:** Fácilmente expandible con nuevos módulos de aprendizaje
- **Contenido Dinámico:** El contenido se carga dinámicamente desde archivos JSON
- **Gestión de Usuario:** Sistema básico de perfiles y puntuación
- **Diseño Responsivo:** Construido con Tailwind CSS para una experiencia fluida
- **Seguimiento de Progreso:** Rastrea el progreso del usuario
- **PWA:** Aplicación web progresiva instalable

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/              # Componentes UI reutilizables
│   │   ├── Header.tsx
│   │   ├── MainMenu.tsx
│   │   ├── ModuleCard.tsx
│   │   └── SearchBar.tsx
│   └── learning/        # Componentes de aprendizaje
│       ├── FlashcardComponent.tsx
│       ├── QuizComponent.tsx
│       ├── CompletionComponent.tsx
│       ├── SortingComponent.tsx
│       └── MatchingComponent.tsx
├── stores/              # Zustand stores
│   ├── appStore.ts
│   └── userStore.ts
├── hooks/               # Custom hooks
│   ├── useModuleData.ts
│   └── useSearch.ts
├── types/               # TypeScript types
├── styles/              # CSS modular
│   └── components.css
└── assets/              # Datos JSON y recursos
    └── data/
```

## 🛠️ Instalación y Setup

1. **Clonar el repositorio:**
```bash
git clone <repository_url>
cd english-learning-app
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Desarrollo:**
```bash
npm run dev
```

4. **Build:**
```bash
npm run build
```

5. **Preview:**
```bash
npm run preview
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Coverage
npm run test:coverage

# Linting
npm run lint
```

## 🎯 Funcionalidades Implementadas

### ✅ Completado:
- [x] Setup base con Vite + React + TypeScript
- [x] Zustand stores (App + User)
- [x] TanStack Query para data fetching
- [x] Componentes UI modulares
- [x] Todos los componentes de aprendizaje
- [x] Sistema de búsqueda con Fuse.js
- [x] PWA configurado
- [x] CSS modular sin inline styles
- [x] Tailwind CSS compilado correctamente

## 🎨 Arquitectura CSS

### Sistema Modular BEM:
- **Componentes:** `.module-card`, `.header`, `.search`
- **Elementos:** `.module-card__title`, `.header__content`
- **Modificadores:** `.module-card--flashcard`, `.btn--primary`

### Colores por Modo:
- 🔵 **Flashcard**: Azul (`bg-blue-600`)
- 🟢 **Quiz**: Verde (`bg-green-600`)
- 🟣 **Completion**: Púrpura (`bg-purple-600`)
- 🟠 **Sorting**: Naranja (`bg-orange-600`)
- 🩷 **Matching**: Rosa (`bg-pink-600`)

## 📱 PWA

La aplicación está configurada como PWA con:
- Service Worker automático
- Cache de contenido JSON
- Instalable en dispositivos móviles
- Manifest configurado

## 🔧 Configuración

### Vite Config
- PWA plugin configurado
- Tailwind CSS integrado
- TypeScript support
- Optimizaciones de build

### Tailwind CSS
- Configuración v3 estable
- PostCSS configurado
- Clases compiladas correctamente
- Sistema de componentes modular

## 🚀 Demo

Para probar la aplicación:

1. Instalar dependencias: `npm install`
2. Ejecutar: `npm run dev`
3. Abrir: `http://localhost:5173`

## 📊 Progreso

**Estado actual:** ✅ 100% Completado

- ✅ Refactorización completa a React + TypeScript
- ✅ Arquitectura CSS modular profesional
- ✅ Todos los componentes funcionando
- ✅ Sistema de estado con Zustand
- ✅ Data fetching con TanStack Query
- ✅ PWA configurado
- ✅ Testing setup

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo `LICENSE` para más detalles.