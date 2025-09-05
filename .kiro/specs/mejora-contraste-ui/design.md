# Design Document - Mejora de Contraste UI

## Overview

Este diseño implementa una solución sistemática para los problemas de contraste en la interfaz, utilizando la arquitectura CSS BEM-like existente y aplicando principios de diseño accesible. La solución se enfoca en crear reglas CSS específicas y bien estructuradas que garanticen visibilidad óptima en ambos modos (claro y oscuro).

## Architecture

### Principios de Diseño
1. **Contraste WCAG AA**: Mínimo 4.5:1 para texto normal, 3:1 para texto grande
2. **Especificidad CSS**: Usar `!important` solo cuando sea necesario para sobrescribir estilos inline
3. **Arquitectura BEM-like**: Mantener la nomenclatura semántica existente
4. **Separación por componentes**: Cada componente maneja sus propios estilos de contraste

### Estrategia de Colores
- **Modo Claro**: Texto oscuro (gray-800, gray-900) sobre fondos claros
- **Modo Oscuro**: Texto blanco (#ffffff) sobre fondos oscuros (gray-800, gray-900)
- **Estados Interactivos**: Transiciones suaves con feedback visual claro

## Components and Interfaces

### 1. Module Cards (Botones del Menú Principal)
**Archivo**: `src/styles/components/module-card.css`

**Clases Afectadas**:
- `.module-card__meta` - Nivel de dificultad
- `.module-card__icon svg` - Iconos SVG
- `.module-card__difficulty` - Badge de dificultad
- `.module-card__category` - Badge de categoría

**Implementación**:
```css
/* Nivel de dificultad - Contraste mejorado */
.module-card__meta {
  color: #1f2937 !important; /* gray-800 modo claro */
}

.dark .module-card__meta {
  color: #ffffff !important; /* blanco modo oscuro */
}

/* Iconos SVG - Herencia forzada */
.dark .module-card__icon svg {
  color: white !important;
  stroke: white !important;
}
```

### 2. Search Bar Component
**Archivo**: `src/styles/components/search-bar.css`

**Clases Afectadas**:
- `.search-bar__input` - Campo de texto
- `.search-bar__icon-svg` - Icono de búsqueda
- `.search-bar__clear-icon` - Icono de limpiar

**Implementación**:
```css
/* Input de búsqueda - Contraste máximo */
.dark .search-bar__input {
  background-color: #1f2937 !important; /* gray-800 */
  color: white !important;
  border-color: #4b5563 !important; /* gray-600 */
}

.dark .search-bar__input::placeholder {
  color: #d1d5db !important; /* gray-300 */
}
```

### 3. Header Side Menu (Menú Hamburguesa)
**Archivo**: `src/styles/components/header.css`

**Clases Afectadas**:
- `.header-side-menu` - Contenedor principal
- `.header-side-menu__item` - Elementos del menú
- `.header-side-menu__icon` - Iconos del menú
- `.header-side-menu__text` - Texto del menú

**Implementación**:
```css
/* Menú hamburguesa - Fondo apropiado */
.header-side-menu {
  background-color: white !important;
}

.dark .header-side-menu {
  background-color: #1f2937 !important; /* gray-800 */
}

/* Elementos del menú - Contraste total */
.dark .header-side-menu__icon,
.dark .header-side-menu__text {
  color: white !important;
}
```

## Data Models

### Color Tokens
```css
/* Modo Claro */
--text-primary-light: #111827;    /* gray-900 */
--text-secondary-light: #374151;  /* gray-700 */
--text-tertiary-light: #1f2937;   /* gray-800 */

/* Modo Oscuro */
--text-primary-dark: #ffffff;     /* white */
--text-secondary-dark: #f9fafb;   /* gray-50 */
--text-tertiary-dark: #ffffff;    /* white */

/* Fondos */
--bg-menu-light: #ffffff;         /* white */
--bg-menu-dark: #1f2937;          /* gray-800 */
--bg-input-dark: #1f2937;         /* gray-800 */
```

### CSS Specificity Strategy
1. **Base styles**: Usar clases Tailwind normales
2. **Override styles**: Usar `!important` solo para sobrescribir estilos inline de librerías
3. **Dark mode**: Usar `.dark` prefix con `!important` para garantizar aplicación

## Error Handling

### Fallbacks de Contraste
- Si un color no se aplica correctamente, usar valores de contraste máximo
- Implementar reglas CSS de alto contraste para usuarios con necesidades especiales
- Usar `@media (prefers-contrast: high)` para casos extremos

### Debugging de Estilos
- Usar comentarios CSS descriptivos para identificar reglas críticas
- Implementar clases de debug temporales si es necesario
- Documentar cualquier uso de `!important` con justificación

## Testing Strategy

### Pruebas Visuales
1. **Modo Claro**: Verificar contraste en todos los componentes
2. **Modo Oscuro**: Verificar visibilidad de texto e iconos
3. **Transiciones**: Verificar cambios suaves entre modos
4. **Estados Interactivos**: Verificar hover, focus, active

### Pruebas de Accesibilidad
1. **Contraste**: Usar herramientas como WebAIM Contrast Checker
2. **Navegación por teclado**: Verificar focus visible
3. **Lectores de pantalla**: Verificar que el contenido sea accesible
4. **Alto contraste**: Probar con `prefers-contrast: high`

### Pruebas de Compatibilidad
1. **Navegadores**: Chrome, Firefox, Safari, Edge
2. **Dispositivos**: Desktop, tablet, móvil
3. **Resoluciones**: Diferentes tamaños de pantalla
4. **Sistemas operativos**: macOS, Windows, iOS, Android

## Implementation Notes

### Orden de Aplicación
1. Aplicar estilos base en cada componente
2. Agregar reglas de modo oscuro con `.dark` prefix
3. Usar `!important` solo donde sea absolutamente necesario
4. Verificar que no hay conflictos entre componentes

### Mantenimiento
- Mantener la separación por archivos de componente
- Documentar cualquier regla compleja
- Usar nomenclatura BEM-like consistente
- Revisar periódicamente la especificidad CSS