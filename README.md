# RADAR Matrix · distribución pública sin histórico

Contiene solo la interfaz, catálogo y motor JavaScript. **No incluye `historical_stats.csv`, `j9_historico.csv`, CP-032 ni pronósticos privados.** El usuario carga su CSV desde el dispositivo. No hay servidor Python.

## Instalación GitHub Pages
Subir el **contenido** de esta carpeta a la raíz de un repositorio público autorizado; Settings > Pages > Deploy from a branch > main / (root). Abrir la URL HTTPS y seleccionar Instalar aplicación / Añadir a pantalla de inicio. La publicación no se ha ejecutado desde este paquete.

## Limitaciones verificables
- El CSV privado debe seleccionarse en cada sesión.
- Se requiere conectividad y CORS permitido por cada fuente para la actualización. No se ha comprobado en un Android físico.
- El algoritmo es beam y no prueba óptimo global.
- Los mercados exigen estadísticas completas, por lo que la muestra puede ser insuficiente.
- No incluye todavía el seguimiento de jornadas de v1.9 ni los pronósticos congelados.
- El navegador puede descargar resultados públicos, pero no valida por sí mismo los derechos de redistribución de un histórico de terceros.
