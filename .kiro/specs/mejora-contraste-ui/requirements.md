# Requirements Document - Mejora de Contraste UI

## Introduction

Esta especificación aborda los problemas críticos de contraste y visibilidad en la interfaz de usuario, especialmente en modo oscuro. Los usuarios reportan que varios elementos no son visibles o tienen contraste insuficiente, afectando la usabilidad y accesibilidad de la aplicación.

## Requirements

### Requirement 1: Contraste de Iconos SVG

**User Story:** Como usuario, quiero que todos los iconos SVG sean claramente visibles tanto en modo claro como oscuro, para poder navegar eficientemente por la aplicación.

#### Acceptance Criteria

1. WHEN el usuario está en modo oscuro THEN todos los iconos SVG SHALL ser blancos con contraste suficiente
2. WHEN el usuario está en modo claro THEN todos los iconos SVG SHALL ser oscuros con contraste suficiente  
3. WHEN el usuario interactúa con botones THEN los iconos SHALL mantener visibilidad en estados hover y active
4. IF un icono está dentro de un componente THEN SHALL heredar correctamente el color del contenedor

### Requirement 2: Texto de Nivel de Dificultad

**User Story:** Como usuario, quiero ver claramente el nivel de dificultad en los botones del menú principal, para poder seleccionar ejercicios apropiados a mi nivel.

#### Acceptance Criteria

1. WHEN el usuario ve los botones del menú principal THEN el texto del nivel SHALL ser claramente visible
2. WHEN el usuario está en modo oscuro THEN el texto del nivel SHALL ser blanco
3. WHEN el usuario está en modo claro THEN el texto del nivel SHALL ser gris oscuro (gray-800)
4. IF hay badges de dificultad THEN SHALL tener contraste suficiente en ambos modos

### Requirement 3: Barra de Búsqueda

**User Story:** Como usuario, quiero poder ver claramente el texto que escribo en la barra de búsqueda, para poder buscar módulos eficientemente.

#### Acceptance Criteria

1. WHEN el usuario escribe en la barra de búsqueda THEN el texto SHALL ser claramente visible
2. WHEN el usuario está en modo oscuro THEN el texto del input SHALL ser blanco sobre fondo oscuro
3. WHEN el usuario ve el placeholder THEN SHALL tener contraste suficiente para ser legible
4. WHEN el usuario enfoca el input THEN SHALL tener indicadores visuales claros

### Requirement 4: Menú Hamburguesa

**User Story:** Como usuario, quiero que el menú hamburguesa sea completamente funcional y visible, para poder acceder a todas las opciones de navegación.

#### Acceptance Criteria

1. WHEN el usuario abre el menú hamburguesa THEN SHALL tener fondo apropiado para el modo actual
2. WHEN el usuario está en modo oscuro THEN el fondo del menú SHALL ser gris oscuro (gray-800)
3. WHEN el usuario ve los elementos del menú THEN el texto e iconos SHALL ser blancos en modo oscuro
4. WHEN el usuario hace hover sobre elementos THEN SHALL tener feedback visual claro

### Requirement 5: Arquitectura CSS Semántica

**User Story:** Como desarrollador, quiero que los estilos CSS sigan la arquitectura BEM-like establecida, para mantener consistencia y facilitar el mantenimiento.

#### Acceptance Criteria

1. WHEN se aplican estilos de contraste THEN SHALL usar las clases semánticas existentes
2. WHEN se crean nuevas reglas CSS THEN SHALL seguir la nomenclatura BEM-like
3. IF se usan reglas !important THEN SHALL estar justificadas y documentadas
4. WHEN se modifica CSS THEN SHALL mantener la separación por componentes