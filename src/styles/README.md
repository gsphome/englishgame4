# CSS Architecture Documentation

## Estructura Organizada de Estilos

Esta carpeta contiene todos los estilos del proyecto organizados siguiendo las mejores prácticas de arquitectura CSS.

### 📁 Estructura de Carpetas

```
src/styles/
├── components/                    # Estilos específicos de componentes
│   ├── index.css                 # Índice que importa todos los componentes
│   ├── header.css                # Estilos del Header
│   ├── dashboard.css             # Estilos del Dashboard
│   ├── user-profile-form.css     # Estilos del UserProfileForm
│   ├── advanced-settings-modal.css # Estilos del AdvancedSettingsModal
│   ├── main-menu.css             # Estilos del MainMenu
│   ├── module-card.css           # Estilos del ModuleCard
│   ├── search-bar.css            # Estilos del SearchBar
│   ├── score-display.css         # Estilos del ScoreDisplay
│   ├── toast.css                 # Estilos del Toast
│   └── loading-skeleton.css      # Estilos del LoadingSkeleton
├── components.css                # Archivo principal de componentes (legacy + imports)
└── README.md                    # Esta documentación
```

### 🎯 Principios de Arquitectura

#### 1. **Separación de Responsabilidades**
- Cada componente tiene su propio archivo CSS
- Los estilos están organizados por funcionalidad
- Clases semánticas que describen propósito, no apariencia

#### 2. **Nomenclatura Semántica (BEM-like)**
```css
/* Bloque */
.user-profile-modal { }

/* Elemento */
.user-profile-modal__header { }

/* Modificador */
.user-profile-modal--compact { }
```

#### 3. **Jerarquía Clara**
```css
/* Contenedor principal */
.component-name { }

/* Secciones */
.component-name__section { }

/* Elementos específicos */
.component-name__element { }

/* Estados y variantes */
.component-name--variant { }
```

### 🔧 Cómo Usar

#### Importar en Componentes
```tsx
// ✅ Correcto - Importar desde styles/components
import '../../styles/components/user-profile-form.css';

// ❌ Incorrecto - No crear CSS junto al componente
import './Component.css';
```

#### Crear Nuevos Estilos de Componente

1. **Crear archivo en `src/styles/components/`**
```bash
touch src/styles/components/new-component.css
```

2. **Usar nomenclatura semántica**
```css
/* new-component.css */
.new-component {
  @apply /* estilos base */;
}

.new-component__header {
  @apply /* estilos del header */;
}

.new-component--variant {
  @apply /* variante específica */;
}
```

3. **Agregar al índice**
```css
/* src/styles/components/index.css */
@import './new-component.css';
```

4. **Importar en el componente**
```tsx
import '../../styles/components/new-component.css';
```

### 📋 Beneficios de esta Arquitectura

#### ✅ **Mantenibilidad**
- Fácil localización de estilos
- Cambios aislados por componente
- Estructura predecible

#### ✅ **Escalabilidad**
- Fácil agregar nuevos componentes
- Reutilización de patrones
- Organización modular

#### ✅ **Performance**
- Importaciones específicas
- Tree-shaking efectivo
- Carga optimizada

#### ✅ **Colaboración**
- Estructura clara para el equipo
- Convenciones consistentes
- Documentación integrada

### 🚀 Migración de CSS Existente

Si encuentras CSS disperso en el proyecto:

1. **Identificar el componente relacionado**
2. **Mover a `src/styles/components/`**
3. **Actualizar importaciones**
4. **Eliminar archivo original**
5. **Actualizar índice si es necesario**

### 🎨 Convenciones de Clases

#### **Prefijos por Tipo**
- `component-name` - Contenedor principal
- `component-name__` - Elementos internos
- `component-name--` - Variantes/modificadores

#### **Sufijos Comunes**
- `--primary`, `--secondary` - Variantes de estilo
- `--compact`, `--expanded` - Variantes de tamaño
- `--active`, `--disabled` - Estados
- `--mobile`, `--desktop` - Responsive

### 📱 Responsive Design

Usar breakpoints consistentes:
```css
/* Mobile first */
.component { }

/* Tablet */
@media (min-width: 640px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

### 🌙 Dark Mode

Usar clases de Tailwind para consistencia:
```css
.component {
  @apply bg-white dark:bg-gray-900;
  @apply text-gray-900 dark:text-white;
}
```

### 🔍 Debugging y Herramientas

- Usar DevTools para inspeccionar clases aplicadas
- Verificar que las importaciones sean correctas
- Comprobar que Tailwind compile correctamente

---

**Nota**: Esta arquitectura sigue las mejores prácticas de CSS moderno y está optimizada para proyectos React con Tailwind CSS.