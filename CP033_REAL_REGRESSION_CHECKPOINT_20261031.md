# CP-033 — checkpoint regresión histórica 2026-10-31

## Ejecución local real (Python)
Fuente: copia local `feature_store_CP032_copia_resultados_hasta_20261030.csv`.
Corte: `2026-10-31`. Se leyeron 7.700 registros con marcador; el denominador conjunto válido fue 7.674.

Configuración: 139 mercados, minSample=20, coreSize=3, satCount=3, maxCandidates=40, beamWidth=100; filtro semántico activado.

- CORE: GAL4p5, SG1p5, TG0p5; 7.476/7.674 = 0,9741985926505082.
- SAT1: FG14p5, GAL4p5, SG1p5, TG0p5; 7.392/7.674 = 0,9632525410476935.
- SAT2: FG14p5, GAL4p5, SG1p5, SHG0p5, TG0p5; 7.299/7.674 = 0,9511336982017201.
- SAT3: CG3p5, FG14p5, GAL4p5, SG1p5, SHG0p5, TG0p5; 7.175/7.674 = 0,9349752410737555.
- Combinaciones evaluadas: 4.882; duración: 20,66 s.

**Advertencia metodológica:** son frecuencias retrospectivas agregadas, no predicciones por partido ni rentabilidad comprobada. Las cuotas conjuntas no están verificadas. La equivalencia Python–JavaScript de esta ejecución real **no se ha demostrado**.

## Bloqueos para validar
1. Construir un fixture compartido serializado de resultados históricos y ejecutarlo en ambos lenguajes; comparar IDs, n, hits, frequency y número de evaluaciones.
2. Rechazar de forma idéntica valores nulos en cada liquidación, incluida la dependencia de estadísticas de medio tiempo.
3. Walk-forward por fecha y equipo local/visitante, sin fuga de información.
4. Prueba de ternas y conjuntos de mercados (redundancia multivariante), no solo parejas.
5. Integrar cuotas conjuntas verificadas, ponderaciones versionadas y ranking económico coherente.
6. Confirmar la correspondencia de IDs del catálogo de 139 mercados entre ambos evaluadores.

Estado: **CHECKPOINT_REAL_PYTHON_ONLY**; no fusionar a main.
