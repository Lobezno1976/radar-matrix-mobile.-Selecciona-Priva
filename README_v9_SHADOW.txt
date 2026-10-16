RMv9 SHADOW — 16/10/2026

Archivos a sustituir en GitHub (si se decide probar la versión SHADOW):
- index.html
- catalog_mobile.js
- commercial_filter.js
- sw.js

Conservar mobile_sources.js, catalog139.json y el histórico local; NO subir historical_stats.csv.

Cambios:
1. CORE se selecciona al llegar a profundidad 3 del beam; SAT1/2/3 amplían esa CORE de forma anidada. El óptimo global NO está demostrado.
2. El filtro comercial compara sobre exactamente el mismo holdout de casos completos de 139 mercados que el selector, corrigiendo denominadores inconsistentes.
3. Protección explícita frente a denominador cero en la condición de caída relativa de 30 %.
4. Caché pública v9 y rotulado SHADOW. No se modifica CP-032.

Comprobación ejecutada: sintaxis JS; prueba real con CSV histórico de 7679 registros fuente y catálogo 139; Betis–Barcelona muestra 260+66 local y 307+77 visitante, y las cuatro variantes coinciden con los denominadores y hits originales del filtro. Se ejecutó una segunda prueba sobre 10 encuentros con un normalizador de prueba reducido: 5 con selección y 5 sin muestras suficientes. Ese resultado no representa fielmente el normalizador completo de la aplicación y no se usa para certificar cobertura de J9.

Pendientes: pruebas end-to-end Android; validar alias y cobertura de equipos; evaluar sesgo de selección por casos completos de los 139 mercados; calibración prospectiva y cuotas reales; comprobar la regla comercial del 30 % frente a líneas disponibles; mantener v8 como referencia funcional.
