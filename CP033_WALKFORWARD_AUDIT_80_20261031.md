# CP-033 — Auditoría estadística de 80 partidos (31/10/2026)

**Estado:** diagnóstico sobre el checkpoint walk-forward, sin alterar el motor canonizado.

Se revisó el archivo de resultados individuales `CP033_WALKFORWARD_REAL_20261031.json` (80 encuentros, 2026-04-10 a 2026-05-24). Las frecuencias y los recuentos coinciden con el resumen publicado.

| Nivel | Aciertos | Frecuencia | IC Wilson 95 % orientativo | Cuota decimal de equilibrio observacional |
|---|---:|---:|---:|---:|
| CORE | 77/80 | 96,25 % | 89,55–98,72 % | 1,0390 |
| SAT1 | 75/80 | 93,75 % | 86,19–97,30 % | 1,0667 |
| SAT2 | 74/80 | 92,50 % | 84,59–96,52 % | 1,0811 |
| SAT3 | 73/80 | 91,25 % | 83,02–95,70 % | 1,0959 |

**Observaciones:**
- `SG1p5` aparece en 77/80 CORE y 80/80 SAT2 y SAT3. La concentración de selecciones en líneas de alta frecuencia exige verificar disponibilidad y precios.
- Los 80 encuentros cubren un tramo de una sola temporada, no toda LaLiga ni varias temporadas independientes.
- El intervalo Wilson binomial ignora correlación entre partidos, mercados y fechas. Es una medida descriptiva aproximada, no prueba de calibración.
- Las cuotas de equilibrio se calculan a partir de frecuencia realizada: **no** son cuotas ejecutables, ni prueba de edge, ni recomendación.
- No se dispone de precios conjuntos verificados ni de una comparación emparejada ejecutada contra CP-032; no se afirma superioridad.
- El resultado del walk-forward no elimina las limitaciones de semántica multivariante, datos ausentes y disponibilidad comercial.

**Siguiente puerta de calidad:** ejecutar comparación emparejada CP-032/CP-033 por partido sobre las mismas fechas y mismos mercados liquidables, conservando por separado el estado NO_OFERTADO y NO_EVALUABLE.
