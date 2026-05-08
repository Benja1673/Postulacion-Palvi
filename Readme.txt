B2B SaaS Executive Dashboard — Palvi Technical Challenge
Este proyecto es una aplicación web de reporte ejecutivo diseñada para que un Jefe de Ventas identifique, en menos de 5 minutos, dónde priorizar sus esfuerzos diarios basándose en métricas de tráfico, ventas y soporte.

Decisiones Técnicas
Stack (Next.js + TypeScript + Tailwind CSS): Elegí Next.js por su velocidad de configuración inicial y robustez. TypeScript fue fundamental para tipar la estructura del archivo metrics.json, asegurando que la navegación entre los datasets (A, B, C, D) sea segura y libre de errores de referencia.

Visualización de Datos (Tremor + Recharts): Utilicé Tremor para los KPIs principales debido a su diseño orientado a dashboards de negocios. Para el funnel y las tendencias, usé Recharts por su flexibilidad para manejar datos temporales y valores nulos, permitiendo una visualización limpia de los 365 días.

Abstracción de Métricas (Lógica de Dirección): Implementé un componente dinámico que consume la propiedad direction (higher_is_better / lower_is_better) de la metadata. Esto evita "hardcodear" la lógica de éxito; la UI decide automáticamente si un aumento es una alerta (rojo) o un logro (verde).

Tratamiento de Datos: Los promedios se calculan sobre una ventana deslizante de 7 días. Esto filtra el "ruido" de días de baja actividad (fines de semana) y ofrece al Jefe de Ventas una visión de tendencia más real que un simple dato puntual.

Manejo de Valores Nulos: La lógica de la aplicación detecta campos null (comunes en métricas de tiempo de respuesta o ciclos de venta en días sin actividad) y los gestiona mediante fallbacks o ignorándolos en el cálculo de promedios para no sesgar los KPIs

Segunda Iteración
Si tuviera más tiempo, priorizaría las siguientes mejoras:

Predicción de Cierre (Forecasting): Utilizaría la métrica avg_deal_cycle_days combinada con los deals_created actuales para proyectar cuántas ventas se cerrarán en el mes. Esto ayudaría al Jefe de Ventas a saber si llegará a la meta antes de que termine el periodo.

Sistema de Notificaciones/Alertas Push: Implementaría alertas basadas en umbrales configurables (ej: si avg_response_time_min supera los 30 minutos, enviar una alerta inmediata), transformando el dashboard de una herramienta de consulta en una herramienta proactiva.

Filtros de Segmentación Temporal: Aunque el reporte actual es de "hoy", añadiría la capacidad de comparar trimestres (QoQ) para identificar estacionalidad en el comportamiento de los datasets.

Optimización de Carga: Para archivos JSON más pesados, implementaría una estrategia de Data Crunching en el servidor o mediante Web Workers para no bloquear el hilo principal del navegador al procesar series de tiempo extensas.