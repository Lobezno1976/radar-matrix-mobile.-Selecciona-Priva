# CP-033 — walk-forward real (checkpoint 80 encuentros)

Fecha de ejecución: 2026-10-31. Estado: **BACKTEST_PRELIMINAR**, no validación predictiva ni económica.

Fuente local: `feature_store_CP032_copia_resultados_hasta_20261030.csv` (privada; no incluida en GitHub). Se seleccionaron los últimos 80 partidos con resultado de la temporada 2025/26, con corte exclusivo por fecha de partido.

Motor: CP-033 JS, 139 mercados, filtro semántico, CORE=3, SAT1–SAT3 extensiones sucesivas, minSample=20, maxCandidates=40, beamWidth=100. Contexto de entrenamiento: partidos anteriores donde el equipo local figura como local **o** el visitante figura como visitante; no es un modelo calibrado por enfrentamiento ni dos cohortes separadas.

| Etapa | Aciertos | Evaluables | Frecuencia |
|---|---:|---:|---:|
| CORE | 77 | 80 | 96,25 % |
| SAT1 | 75 | 80 | 93,75 % |
| SAT2 | 74 | 80 | 92,50 % |
| SAT3 | 73 | 80 | 91,25 % |

Ningún caso de la muestra de 80 tuvo error de construcción o liquidación. Se comparó el resultado real posterior con la combinación seleccionada exclusivamente con registros de fecha anterior. No se han inventado cuotas.

## Advertencias
- 80 partidos no equivalen a una temporada completa. El intento de procesar 380 encuentros no concluyó dentro del límite de ejecución; **no** se presentan resultados de 380.
- No hay intervalos de confianza, prueba de superioridad frente a CP-032 ni validación de rentabilidad.
- Fechas sin hora exacta: se excluyen partidos del mismo día, evitando fuga temporal pero perdiendo observaciones.
- En 24 partidos recientes de 2026/27 la liquidación fue no evaluable por estadísticas ausentes; se excluyeron del cálculo de aciertos, no se trataron como fallos.
- Pendiente contrastar las salidas por partido Python–JS, y ponderaciones 3/5/10/15/20 temporadas.

La versión canónica vigente CP033_CANONICAL_BASELINE_1 no cambia.
