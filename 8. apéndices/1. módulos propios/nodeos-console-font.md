#### nodeos-console-font

Por su orientación a su uso en servidores, Node.js dispone de multiples módulos
para el desarrollo de interfaces en modo texto y para la linea de comandos,
algunas de ellas incluso ofreciendo funcionalidad propia de interfaces gráficas
como es el renderizado de widgets o el mostrar imagenes en la consola. En muchos
de los casos se hace uso de caracteres Unicode para evitar las limitaciones de
resolución que conlleva el uso del terminal y poder dar mas riqueza visual a las
aplicaciones mediante el uso de lineas, bloques, simbolos, puntos... El problema
esta en el hecho de que el modo texto de las tarjetas VGA usadas en los
ordenadores PC esta limitado a 256 glifos (o 512 si se reducen los colores a 8
en vez de 16 al usar un modo de texto, no asi al usar un framebuffer), por lo
que dichos caracteres especiales no pueden mostrarse en pantalla, estando
solamente disponibles los caracteres pertenecientes a la página de codigos
[CP-437](https://es.wikipedia.org/wiki/Página_de_códigos_437).

Para poder hacer uso en el terminal de estos caracteres y particularmente de los
patrones Braille usados para dibujar lineas y puntos, se ha creado la fuente
[nodeos-console-font](https://github.com/NodeOS/nodeos-console-font) basada en
los caracteres de [Unifont](http://unifoundry.com/unifont.html) pero cambiando
los glifos de dichos patrones Braille por unos propios mas apropiados para su
uso en el dibujo de graficos. Para ello he adaptado el script en Perl encargado
de [generarlos en UniFont](http://czyborra.com/unifont/braille.pl) a Node.js, y
le he añadido soporte para poder seleccionar entre varios tipos de puntos a la
hora de generarlos.

Despues, he generado la fuente de pantalla basandome en las equivalencias
estandar y usando los conjuntos de caracteres requeridos en los terminales Linux
y los utiles, junto con el conjunto de patrones braille, los cuales se añaden al
final para que esten todos alojados en los 256 glifos del mapa de caracteres
alternativo. Ademas se han añadido un conjunto de caracteres propio incluyendo
los restantes glifos de dibujado de cajas de los terminales VT-100 y de bloques
rectangulares (especialmente util para el dibujado suave de barras de progreso)
y algunas equivalencias adicionales para permitir la inclusión de todo el
conjunto de caracteres utiles completo, como es la simplifcación de flechas,
cajas, comillas o simbolos de monedas. Mas adelante se plantea el ampliar el
conjunto de caracteres propio de NodeOS con los que realmente estan siendo
usados del conjunto de caracteres utiles para tener un control real de cuales se
estan incluyendo y en que posición se alojan.

No obstante, actualmente no se esta haciendo uso de esta fuente en NodeOS debido
a que a pesar de que el kernel de Linux permite el uso de fuentes de pantalla de
512 glifos no soporta el que sean incluidas por defecto dentro del mismo,
requiriendo el que sean cargadas posteriormente. Esto en un sistema como NodeOS
complica mucho su uso puesto que hace que el usuario sea consciente de que debe
de cambiar la fuente en pantalla, por lo que se ha dejado para un futuro el
desarrollar un parche para el kernel de Linux que habilite el uso de fuentes de
512 glifos durante el arranque puesto que su codigo fuente indica que si esta
preparado para ello habiendose dejado pendiente su implementación final, aunque
parece ser que los [desarrolladores no aceptan](http://askubuntu.com/a/23614)
parches para mejorar el soporte de Unicode en la consola puesto que debe de ser
usada como interfaz de emergencia por lo que puede que sea esta la razón por la
que todavia no se haya añadido dicho soporte.
