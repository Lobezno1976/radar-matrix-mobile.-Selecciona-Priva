# CP-033 FUSION — primera auditoría retrospectiva (80 encuentros)

Estado: **EXPERIMENTAL**, no canonizado ni integrado en la aplicación.

## Metodología
Se emparejaron los 80 tickets CORE de CP-033 y PBASE_V2 por fecha, local y visitante. Se liquidaron de nuevo sus IDs sobre el CSV privado `feature_store_CP032_copia_resultados_hasta_20261030.csv`. La unión conserva todos los IDs distintos; la fusión filtrada conserva las tres patas CORE y añade patas PBASE_V2 solo si no infringen el filtro semántico actual.

| Estrategia | Aciertos | Frecuencia |
|---|---:|---:|
| CORE CP-033 | 77/80 | 96,25 % |
| PBASE_V2 | 78/80 | 97,50 % |
| Unión sin repetidos | 77/80 | 96,25 % |
| Fusión filtrada | 77/80 | 96,25 % |

Distribución de mercados compartidos: 0 en 1 encuentro, 1 en 14, 2 en 55, 3 en 10.
La fusión filtrada contiene 3 patas en 11 encuentros, 4 en 56, 5 en 12 y 6 en 1.
Se incorporó al menos una pata en 69/80; 3 encuentros rechazaron una alternativa por política semántica.
**Importante:** el filtro actual también excluye líneas complementarias del mismo eje (ejemplo: faltas +14,5 y faltas -39,5), aunque puedan ser simultáneamente ciertas. No etiquetar esas exclusiones como contradicciones lógicas.

## Interpretación
La fusión no mejora el acierto observado frente a CP-033; tampoco supera PBASE_V2. Añadir patas sin reducir aciertos en esta muestra puede elevar la cuota, pero no existe verificación de cotizaciones conjuntas ejecutables ni de disponibilidad comercial. La correlación puede eliminar el incremento de precio.

## Pendiente
1. Comprobar cuotas conjuntas reales y si las nuevas patas se ofertan.
2. Comparar cuota de equilibrio por estrategia y retorno bajo las mismas condiciones.
3. Recalcular la fusión en ventanas walk-forward con selección fijada antes del partido.
4. Evaluar implicaciones multivariantes y permitir pares over/under compatibles si aportan valor económico.
5. Contrastar con selector CP-032 móvil, no confundirlo con PBASE_V2.

No se altera `CP033_CANONICAL_BASELINE_1`.
