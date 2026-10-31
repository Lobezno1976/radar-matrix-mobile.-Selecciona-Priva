# RADAR Matrix CP-033 — contrato canónico v0.1

Estado: **desarrollo**, sin equivalencia Python–móvil validada. CP-032 permanece inalterado.

## Objetivo
Comparar todos los mercados ofertados y seleccionar CORE/SAT por frecuencia histórica robusta y valor económico verificable, evitando duplicados, implicaciones y contradicciones.

## Reglas
1. Catálogo CP-032 de 139 mercados; cada mercado debe tener ID, definición de liquidación, familia, período, ámbito y línea.
2. Fecha de corte estricta: solo partidos anteriores al encuentro objetivo. La ausencia de un dato excluye esa observación del denominador de ese mercado.
3. Frecuencias por ventanas 0/3/5/10/15/20 temporadas; los pesos deben ser explícitos, versionados y reproducibles. Usar tres temporadas solo si la equivalencia con el histórico largo está documentada.
4. Comparar todas las líneas over/under y alternativas disponibles **antes** de eliminar redundancias.
5. La redundancia incluye equivalencia, implicación lógica, contradicción y repetición de umbrales dentro de una misma familia/ámbito/período. El motor conservará la mejor alternativa admisible.
6. Para cada mercado: n válido, aciertos, frecuencia, incertidumbre/robustez, cuota observada verificable y cuota de equilibrio 1/p (si p>0).
7. Sin cuota verificada: ranking descriptivo por frecuencia y robustez; EV no disponible. Con cuota verificada: EV=p*cuota-1, explicitando que p histórica no es probabilidad prospectiva calibrada.
8. Para combinadas correlacionadas: exigir cuota conjunta verificada; no multiplicar cuotas individuales como sustituto. Evaluar acierto conjunto en la misma cohorte histórica.
9. CORE 2–4 selecciones, SAT 1–3 alternativas o extensiones cuando añadan valor. No completar patas artificialmente.
10. Módulo paridad de córners 1T × FT: exclusivamente combinadas de 2+ partidos, fuera del CORE/SAT de partido individual.
11. Mismo input canónico => misma salida Python y JS: IDs, orden, tasas, denominadores, rechazos y motivos, con tolerancia numérica fijada.
12. Si no hay datos o precios suficientes: devolver estado explícito y abstenerse de atribuir rentabilidad.
13. No modificar ni publicar CP-032 mientras CP-033 no supere pruebas históricas compartidas.

## Orden de implementación
A. Normalización y contrato de entradas/salidas.
B. Evaluador de mercado y ranking de alternativas.
C. Restricciones semánticas y constructor CORE/SAT.
D. Pesos, cuotas conjuntas, backtest walk-forward y pruebas cruzadas Python/JS.
E. Integración en móvil con selector de versión y rollback.

## Fallos heredados a cerrar
- Divergencia BASE CP-032 / CORE-SAT CP-024 / beam móvil.
- Pesos no activados por defecto y políticas divergentes.
- Comparador bidireccional desconectado del selector.
- Beam sin garantía de óptimo y poda prematura de alternativas rentables.
- Sincronización histórica sin fuente canónica única.
- Insuficiente regresión histórica Python–JS.
- Semántica de redundancias incompleta y CORE/SAT rígidos.

## Criterio de aceptación
No declarar VALIDADO hasta obtener resultados idénticos en casos de prueba compartidos y regresión histórica, con auditoría de datos faltantes, cuotas y ausencia de fuga temporal.
