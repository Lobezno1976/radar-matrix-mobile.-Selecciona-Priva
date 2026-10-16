# RADAR Matrix v6 — filtro comercial exploratorio

Cambios respecto a v5: módulo `commercial_filter.js`, carga en `index.html`, y caché PWA v6. `catalog_mobile.js`, `catalog139.json`, CP-032 y el motor original no se modifican.

El filtro explora líneas más exigentes de goles, córners y tarjetas **solo si existen dentro de los 139 mercados**. Para cada variante CORE/SAT, recorre sus patas y busca una alternativa cuyo descenso de aciertos históricos sea como máximo el 30 % relativo en cada contexto (local/visitante), sobre la cadena parcial. Muestra los cambios y la frecuencia conjunta original y alternativa en muestras holdout. No altera las selecciones canónicas. El 30 % es una hipótesis operacional provisional, no un descuento de cuota ni probabilidad calibrada. No verifica disponibilidad real en casas, por lo que NO puede llamarse selección apostable confirmada.

Limitaciones: el filtro es heurístico, dependiente del orden de las patas y del catálogo. No garantiza óptimo global ni valida EV, cuotas, disponibilidad o correlaciones. Las muestras se reconstruyen por equipo/fecha y pueden no coincidir con las del motor para casos de datos incompletos; se muestran los denominadores para detectar diferencias. Puede no proponer sustituciones. Pendiente prueba con histórico privado y navegador Android. La fuente automática y el selector de jornadas siguen sujetos a las limitaciones documentadas en v5.

Para publicar: subir `index.html`, `commercial_filter.js` y `sw.js` a la raíz del repositorio; mantener los demás archivos de v5. Recargar la página y comprobar caché v6. No se incluye el histórico privado.
