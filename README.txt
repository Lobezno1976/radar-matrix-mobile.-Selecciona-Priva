RADAR MATRIX v14 SHADOW — puente CORE/SAT → Cuotas

Archivos nuevos:
- radar_bridge_v14.js
- odds_shadow_v14.html

INSTALACIÓN SIN ALTERAR EL MOTOR:
1. Subir ambos archivos a la raíz del repositorio GitHub.
2. En index.html añadir JUSTO ANTES de </body> esta línea:
   <script src="./radar_bridge_v14.js?v=14"></script>
3. Guardar, abrir index.html con ?v=14, cargar el CSV privado si hace falta y ejecutar RADAR.
4. Pulsar «Enviar CORE/SAT al módulo de cuotas SHADOW».
5. En la página de cuotas, introducir las cuotas combinadas realmente observadas.

La transferencia usa sessionStorage en la misma pestaña y NO incluye el CSV privado.
La página no obtiene cuotas de Winamax ni calcula probabilidades prospectivas calibradas.
La probabilidad ajustada opcional es introducida por el usuario y se etiqueta NO VALIDADA.
El botón de transferencia captura las propuestas visibles de #results; no altera el selector.

LIMITACIONES:
- La integración requiere editar una línea de index.html. Sin ella el puente no aparece.
- La transferencia se pierde si se cierra la pestaña o se borra su sessionStorage.
- Las estadísticas se copian literalmente de la interfaz; no se recomputan.
- No se ha probado con el CSV privado del usuario ni en su Android.
- CP-032 y archivos del motor se mantienen sin modificar en este paquete.
