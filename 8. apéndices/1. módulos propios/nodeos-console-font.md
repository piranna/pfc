#### nodeos-console-font

Por su orientación a su uso en servidores, Node.js dispone de múltiples módulos
para el desarrollo de interfaces en modo texto y para la línea de comandos,
[algunas de ellas](https://github.com/yaronn/blessed-contrib) incluso ofreciendo
funcionalidad propia de interfaces gráficas como es el renderizado de widgets o
el mostrar imágenes en la consola. En muchos de los casos se hace uso de
caracteres Unicode para evitar las limitaciones de resolución que conlleva el
uso del terminal y poder dar mas riqueza visual a las aplicaciones mediante el
uso de lineas, bloques, símbolos, puntos... El problema está en el hecho de que
el modo texto de las tarjetas VGA usadas en los ordenadores PC está limitado a
256 glifos (o 512 si se reducen los colores a 8 en vez de 16 al usar un modo de
texto, no así al usar un framebuffer), por lo que dichos caracteres especiales
no pueden mostrarse en pantalla, estando por defecto solamente disponibles los
caracteres pertenecientes a la página de códigos
[CP-437](https://es.wikipedia.org/wiki/Página_de_códigos_437).

Para poder hacer uso en el terminal de estos caracteres y particularmente de los
[patrones Braille](http://en.wikipedia.org/wiki/Braille_Patterns) usados para
dibujar líneas y puntos con una mayor precisión se ha creado la fuente
[nodeos-console-font](https://github.com/NodeOS/nodeos-console-font) basada en
los caracteres de [Unifont](http://unifoundry.com/unifont.html) pero cambiando
los glifos de dichos patrones Braille por unos propios más apropiados para su
uso en el dibujo de gráficos. Para ello, he adaptado el script en Perl encargado
de [generarlos en UniFont](http://czyborra.com/unifont/braille.pl) a Node.js y
le he añadido soporte para poder seleccionar entre varios tipos de puntos a la
hora de generarlos.

Después, he generado la fuente de pantalla basándome en las equivalencias
estándar y usando los conjuntos de caracteres requeridos en los terminales Linux
y los útiles, junto con el conjunto de patrones braille, los cuales se añaden al
final para que estén todos alojados en los 256 glifos del mapa de caracteres
alternativo. Además, se ha añadido un conjunto de caracteres propio incluyendo
los restantes glifos de dibujado de cajas de los terminales VT-100 y de bloques
rectangulares (especialmente útil para el dibujado suave de barras de progreso)
y algunas equivalencias adicionales para permitir la inclusión de todo el
conjunto de caracteres útiles completo, como es la simplificación de flechas,
cajas, comillas o símbolos de monedas. Mas adelante se plantea el ampliar el
conjunto de caracteres propio de NodeOS definiendo los que realmente están
siendo usados de los pertenecientes al conjunto de caracteres útiles para tener
un control real de cuales se están incluyendo y en que posición se alojan.

No obstante, actualmente no se está haciendo uso de esta fuente en NodeOS debido
a que a pesar de que el kernel de Linux permite el uso de fuentes de pantalla de
512 glifos no soporta el que sean incluidas por defecto dentro del mismo,
requiriendo el que sean cargadas posteriormente. Esto en un sistema como NodeOS
complicaría mucho su uso puesto que hace que el usuario sea consciente de que
debe de cambiar la fuente de pantalla, por lo que se ha dejado para un futuro el
desarrollar un parche para el kernel de Linux que habilite el uso de fuentes de
512 glifos durante el arranque puesto que su código fuente indica que sí esté
preparado para ello habiéndose dejado pendiente su implementación final, aunque
parece ser que los [desarrolladores no aceptan](http://askubuntu.com/a/23614)
parches para mejorar el soporte de Unicode en la consola puesto que consideran
que debe de ser usada únicamente como interfaz de emergencia, por lo que puede
que sea esta la razón por la que todavía no se haya añadido dicho soporte.
