# RADAR Matrix v7 — reparación del calendario

**Causa corregida:** el parser de OpenFootball eliminaba `round` al transformar los encuentros. Ahora conserva `round` y permite poblar el selector.

**Cambios:** `mobile_sources.js` conserva jornada; `index.html` añade alias explícitos entre nombres completos de clubes y el CSV, y valida exactamente diez partidos únicos antes de ejecutar una jornada; `sw.js` actualiza la caché a v7.

**Sin cambios:** `catalog_mobile.js`, `catalog139.json`, `commercial_filter.js`, CP-032, histórico privado.

**Instalación:** sustituir en la raíz del repositorio `index.html`, `mobile_sources.js`, `sw.js`. No borrar histórico local. Abrir GitHub Pages con `?v=7`, pulsar `Actualizar ahora`, comprobar que J9 muestra 10/10 y ejecutar.

**Limitaciones:** la carga depende de CORS, conectividad y disponibilidad de OpenFootball. No se ha ejecutado en Samsung. El motor puede informar muestras insuficientes para equipos ascendidos y alias no cubiertos; no inventa datos. La presencia de 10 partidos no demuestra la veracidad de la fuente, solo integridad estructural.
