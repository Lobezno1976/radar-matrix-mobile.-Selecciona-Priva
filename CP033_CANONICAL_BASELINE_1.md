# RADAR Matrix CP-033 — primer estado canonizado

**Identificador:** CP033_CANONICAL_BASELINE_1  
**Fecha:** 2026-10-31  
**Ámbito:** primera línea base reproducible, NO validación económica ni predictiva.

## Componentes congelados
- Catálogo 139 mercados (`catalog139.json`).
- Liquidación (`catalog_mobile.js: settle`).
- Filtro semántico (`cp033_semantic.js`, `cp033_semantic.py`).
- Constructor CORE/SAT (`cp033_joint.js`, `cp033_joint.py`).
- Adaptador de interfaz (`cp033_adapter.js`).
- Configuración predeterminada: minSample=20, coreSize=3, satCount=3, maxCandidates=40, beamWidth=100.
- Fecha de corte exclusiva y denominador por casos completos de cada combinación.
- Sin cuota conjunta verificada: no se calcula EV.
- CP-032 conservado como opción de reversión en el selector de motor.

## Evidencia y límites
- Barrido semántico JavaScript de 139 mercados, 9.591 parejas, 612 bloqueadas, sin excepciones.
- Pruebas sintéticas y checkpoint histórico documentados en archivos de la rama.
- Equivalencia histórica comunicada para una configuración agregada de 7.700 registros; el CSV privado no se distribuye con este repositorio y esa prueba no sustituye una batería CI reproducible.
- **El adaptador móvil por partido utiliza una cohorte contextual (local como local O visitante como visitante), distinta del histórico agregado. Sus resultados requieren validación propia.**
- El filtro semántico por parejas no prueba ausencia de implicaciones multivariantes.
- La búsqueda beam no demuestra óptimo global. Las extensiones SAT pueden resultar de frecuencia alta sin ganancia informativa marginal.
- Sin calibración, sin backtest walk-forward validado, sin cuotas conjuntas ejecutables, sin ponderación temporal final.
- No declarar el motor económicamente validado ni atribuir probabilidades futuras a sus frecuencias.

## Política de versiones
Esta línea base reemplaza CP-032 **como motor predeterminado en la interfaz web**; no elimina CP-032 ni modifica los datos privados. Nuevas mejoras se desarrollarán sobre esta base y requerirán pruebas de regresión antes de cambiar la versión canónica.

## Siguientes puertas de calidad
1. Paridad Python–JS de cohorte contextual por partido con fixtures compartidos.
2. Auditoría de semántica multivariante.
3. Walk-forward por jornada y temporada.
4. Pesos históricos versionados y valoración económica con cuotas conjuntas verificadas.
5. Prueba en Android físico y publicación/actualización PWA comprobada.
