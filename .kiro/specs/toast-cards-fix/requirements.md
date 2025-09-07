# Requirements Document

## Introduction

El sistema actual de toast cards tiene un problema con el mecanismo de delay que impide que las tarjetas aparezcan y desaparezcan correctamente cuando el usuario cambia de pantalla. Esto causa una experiencia de usuario problemática donde las notificaciones persisten cuando no deberían y no aparecen en el momento de seleccionar una respuesta correcta o incorrecta. La solución requiere eliminar el delay problemático y hacer que las tarjetas aparezcan cuando cambie de estado (en el caso de los quiz cuando se seleccione la respuesta correcta) y desaparezcan inmediatamente al cambiar de pantalla. El feedback de las respuestas aplica a los modos que tienen respuestas inmediatas a preguntas, como quiz y completion.

## Requirements

### Requirement 1

**User Story:** Como usuario, quiero que las toast cards desaparezcan inmediatamente cuando cambio de pantalla, para que no vea notificaciones obsoletas o confusas.

#### Acceptance Criteria

1. WHEN el usuario navega a una nueva pantalla THEN el sistema SHALL limpiar todas las toast cards activas inmediatamente
2. WHEN el usuario selecciona una nueva opción THEN las toast cards previas SHALL desaparecer sin delay
3. WHEN ocurre un cambio de ruta o vista THEN el sistema SHALL eliminar todas las notificaciones pendientes

### Requirement 2

**User Story:** Como usuario, quiero que el sistema de notificaciones sea predecible y no tenga comportamientos inesperados causados por delays, para tener una experiencia fluida.

#### Acceptance Criteria

1. WHEN se activa una limpieza de toasts THEN el sistema SHALL ejecutar la acción inmediatamente sin delays
2. IF existe un mecanismo de delay problemático THEN el sistema SHALL eliminarlo completamente
3. WHEN se muestra una nueva toast THEN no SHALL interferir con toasts de pantallas anteriores

### Requirement 3

**User Story:** Como desarrollador, quiero que el código del sistema de toasts sea simple y directo, para facilitar el mantenimiento y evitar bugs relacionados con timing.

#### Acceptance Criteria

1. WHEN se revise el código de toastStore THEN SHALL estar libre de delays innecesarios
2. WHEN se implemente la limpieza de toasts THEN SHALL usar métodos síncronos cuando sea posible
3. IF existen timeouts o delays THEN SHALL estar justificados y documentados claramente

### Requirement 4

**User Story:** Como usuario, quiero feedback inmediato cuando respondo preguntas en los modos quiz y completion, para que pueda entender rápidamente si mi respuesta fue correcta o incorrecta.

#### Acceptance Criteria

1. WHEN selecciono una respuesta en modo quiz THEN el sistema SHALL mostrar feedback toast inmediatamente
2. WHEN completo un espacio en blanco en modo completion THEN el sistema SHALL mostrar el resultado sin delay
3. WHEN se muestra el feedback THEN SHALL permanecer visible por una duración apropiada antes de auto-desaparecer

### Requirement 5

**User Story:** Como usuario, quiero que nunca aparezcan múltiples toast cards al mismo tiempo en la pantalla, para evitar confusión y apiñamiento visual.

#### Acceptance Criteria

1. WHEN se va a mostrar una nueva toast card THEN el sistema SHALL verificar que no haya otras toast cards activas
2. IF existe una toast card activa THEN el sistema SHALL eliminarla antes de mostrar la nueva
3. WHEN se muestra una toast card THEN SHALL ser la única visible en pantalla en ese momento

### Requirement 6

**User Story:** Como desarrollador, quiero que todos los tests relacionados con el sistema de toast sean reescritos para reflejar la nueva lógica, para asegurar que las pruebas sean precisas y confiables.

#### Acceptance Criteria

1. WHEN se identifiquen tests existentes relacionados con toast THEN SHALL ser marcados como obsoletos
2. WHEN se implemente la nueva lógica de toast THEN SHALL escribirse nuevos tests que reflejen el comportamiento actualizado
3. WHEN se ejecuten los tests THEN SHALL validar correctamente la eliminación de delays y el comportamiento de limpieza inmediata

### Requirement 7

**User Story:** Como usuario, quiero ver un mensaje de bienvenida con la cantidad de módulos cargados solo la primera vez que accedo al menú del juego, para estar informado sobre el contenido disponible sin ser molestado en visitas posteriores.

#### Acceptance Criteria

1. WHEN el usuario accede al menú del juego por primera vez THEN el sistema SHALL mostrar una toast card con la cantidad de módulos cargados
2. WHEN se muestre el mensaje de bienvenida THEN el sistema SHALL guardar en localStorage una variable que indique que ya se mostró
3. IF el usuario ya visitó el menú anteriormente THEN el sistema SHALL verificar localStorage y no mostrar el mensaje de bienvenida
4. WHEN se carguen los módulos THEN el sistema SHALL contar la cantidad total disponible para mostrar en el mensaje

### Requirement 8

**User Story:** Como desarrollador, quiero que todo el código legacy del sistema de toast sea completamente eliminado, para evitar código espagueti y confusión en futuros análisis de AI.

#### Acceptance Criteria

1. WHEN se implemente el nuevo sistema de toast THEN SHALL eliminarse completamente toda la lógica anterior de toast
2. WHEN se revise el código THEN no SHALL existir funciones, métodos o componentes obsoletos relacionados con el sistema anterior
3. IF existe código comentado o no utilizado THEN SHALL ser removido completamente del codebase
4. WHEN se complete la implementación THEN el sistema SHALL usar únicamente la nueva arquitectura sin referencias al código anterior

### Requirement 9

**User Story:** Como usuario, quiero que las toast cards tengan una interfaz compacta y eficiente, para que no ocupen demasiado espacio visual y no interfieran con mi experiencia de aprendizaje.

#### Acceptance Criteria

1. WHEN se muestre una toast card THEN SHALL ocupar el mínimo espacio visual necesario
2. WHEN se diseñe la interfaz THEN SHALL priorizar la información esencial y eliminar elementos redundantes
3. IF la toast contiene múltiples elementos THEN SHALL solo mostrar uno de manera compacta y legible
4. WHEN se implemente el diseño THEN SHALL mantener consistencia visual con el resto de la aplicación

### Requirement 10

**User Story:** Como usuario móvil, quiero que las toast cards se adapten perfectamente a mi dispositivo y no interfieran con la navegación táctil, para tener una experiencia optimizada en pantallas pequeñas.

#### Acceptance Criteria

1. WHEN accedo desde un dispositivo móvil THEN las toast cards SHALL adaptarse al ancho de pantalla disponible
2. WHEN se muestre una toast en móvil THEN SHALL posicionarse para no bloquear elementos interactivos importantes
3. IF la pantalla es menor a 640px THEN las toast cards SHALL usar un layout optimizado para móvil
4. WHEN interactúo con toasts en móvil THEN SHALL ser fácilmente tocables con áreas de toque adecuadas (mínimo 44px)
5. WHEN se muestren en diferentes orientaciones THEN SHALL mantener usabilidad tanto en portrait como landscape