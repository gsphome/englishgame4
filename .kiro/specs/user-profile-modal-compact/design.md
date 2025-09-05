# Documento de Diseño

## Visión General

El diseño se enfoca en optimizar el modal de perfil de usuario para eliminar la necesidad de desplazamiento vertical, especialmente en modo web. La solución implementa un diseño más compacto mediante la reorganización de elementos, reducción de espaciado y uso de técnicas de diseño responsivo avanzadas.

## Arquitectura

### Estructura del Modal Actual
- Modal de overlay con contenedor centrado
- Altura máxima del 80% del viewport (`max-h-[80vh]`)
- Scroll vertical cuando el contenido excede el espacio
- Diseño de una sola columna con secciones apiladas

### Nueva Estructura Propuesta
- Modal con altura fija optimizada para viewports estándar
- Diseño de dos columnas en pantallas medianas y grandes
- Eliminación del scroll mediante reorganización inteligente del contenido
- Uso de técnicas de espaciado compacto manteniendo la usabilidad

## Componentes y Interfaces

### 1. Contenedor Principal del Modal
**Cambios:**
- Cambiar de `max-h-[80vh]` a altura fija calculada dinámicamente
- Implementar `max-h-[600px]` para pantallas estándar
- Eliminar `overflow-y-auto` del contenedor principal
- Añadir `overflow-hidden` para prevenir scroll accidental

### 2. Layout de Dos Columnas
**Estructura:**
```
┌─────────────────────────────────────┐
│ Header (título + botón cerrar)      │
├─────────────────┬───────────────────┤
│ Columna Izq.    │ Columna Der.      │
│ - Info Personal │ - Preferencias    │
│ - Nivel         │ - Categorías      │
│                 │ - Notificaciones  │
├─────────────────┴───────────────────┤
│ Botones de Acción                   │
└─────────────────────────────────────┘
```

### 3. Optimización de Espaciado
**Reducciones aplicadas:**
- Padding del contenedor: de `p-4` a `p-3`
- Espaciado entre secciones: de `space-y-3` a `space-y-2`
- Padding interno de secciones: de `p-3` a `p-2.5`
- Márgenes de campos: de `mb-2` a `mb-1.5`

### 4. Campos de Formulario Compactos
**Optimizaciones:**
- Inputs con padding reducido: `py-1.5` en lugar de `py-2`
- Labels más compactos con `text-xs` en lugar de `text-sm`
- Checkboxes y radio buttons con espaciado mínimo
- Grid de categorías optimizado para 2x2 en lugar de 2x1

## Modelos de Datos

### Configuración de Breakpoints
```typescript
interface ModalBreakpoints {
  mobile: '< 640px';     // Una columna, altura adaptativa
  tablet: '640px-1024px'; // Dos columnas, altura fija
  desktop: '> 1024px';    // Dos columnas optimizadas
}
```

### Configuración de Espaciado
```typescript
interface CompactSpacing {
  container: {
    padding: '0.75rem';        // p-3
    maxHeight: '600px';        // max-h-[600px]
  };
  sections: {
    padding: '0.625rem';       // p-2.5
    spacing: '0.5rem';         // space-y-2
  };
  fields: {
    inputPadding: '0.375rem';  // py-1.5
    labelMargin: '0.375rem';   // mb-1.5
  };
}
```

## Manejo de Errores

### Validación Visual Compacta
- Mensajes de error inline con iconos reducidos
- Tooltips para errores en lugar de texto completo cuando sea necesario
- Indicadores visuales sutiles (bordes rojos) sin ocupar espacio adicional

### Fallbacks Responsivos
- Si el contenido aún excede la altura en pantallas muy pequeñas, implementar scroll solo en la sección de contenido
- Mantener header y footer fijos para preservar la navegación

## Estrategia de Testing

### Tests de Layout Responsivo
1. **Test de Altura Fija**: Verificar que el modal no exceda 600px en desktop
2. **Test de Dos Columnas**: Validar que el layout se reorganice correctamente en tablet+
3. **Test de Scroll Eliminado**: Confirmar que no aparece scroll vertical en resoluciones estándar
4. **Test de Usabilidad**: Verificar que todos los campos permanezcan accesibles

### Tests de Accesibilidad
1. **Navegación por Teclado**: Asegurar que el orden de tabulación sea lógico en el nuevo layout
2. **Lectores de Pantalla**: Verificar que la estructura de dos columnas sea comprensible
3. **Contraste**: Mantener ratios de contraste adecuados con el espaciado reducido

### Tests de Funcionalidad
1. **Validación de Formulario**: Confirmar que todas las validaciones funcionen con el nuevo layout
2. **Guardado de Datos**: Verificar que el flujo de guardado no se vea afectado
3. **Responsive Behavior**: Probar en diferentes tamaños de pantalla

## Implementación por Fases

### Fase 1: Estructura Base
- Implementar contenedor con altura fija
- Crear sistema de grid de dos columnas
- Aplicar espaciado compacto básico

### Fase 2: Reorganización de Contenido
- Mover campos a columnas apropiadas
- Optimizar componentes individuales (inputs, selects, checkboxes)
- Implementar grid de categorías compacto

### Fase 3: Refinamiento Responsivo
- Ajustar breakpoints y comportamiento móvil
- Implementar fallbacks para pantallas pequeñas
- Optimizar transiciones y animaciones

### Fase 4: Testing y Pulido
- Ejecutar suite completa de tests
- Ajustes finales de espaciado y alineación
- Validación de accesibilidad

## Consideraciones Técnicas

### CSS Grid vs Flexbox
- Usar CSS Grid para el layout principal de dos columnas
- Mantener Flexbox para alineación interna de componentes
- Aprovechar Tailwind CSS para implementación rápida

### Compatibilidad
- Mantener compatibilidad con navegadores modernos
- Fallbacks graceful para navegadores más antiguos
- Preservar funcionalidad en dispositivos táctiles

### Performance
- No impacto significativo en performance
- Posible mejora en rendering al eliminar scroll
- Mantener lazy loading si es aplicable