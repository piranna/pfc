#### nodeos-console-font

Por su orientación a su uso en servidores, Node.js dispone de múltiples módulos
para el desarrollo de interfaces en modo texto y para la línea de comandos,
[algunas de ellas](https://github.com/yaronn/blessed-contrib) incluso ofreciendo
funcionalidad propia de interfaces gráficas (como el renderizado de widgets o
mostrar imágenes en la consola). En muchos de los casos se hace uso de
caracteres Unicode para evitar las limitaciones de resolución que conlleva el
uso del terminal y poder dar más riqueza visual a las aplicaciones mediante el
uso de líneas, bloques, símbolos, puntos, etc. El problema está en el hecho de
que el modo de texto de las tarjetas VGA usadas en los ordenadores PC está
limitado a 256 glifos (o 512 si al usar un modo de texto se reducen los colores
a 8 en vez de 16, no así al emplear un framebuffer), por lo que dichos
caracteres especiales no pueden mostrarse en pantalla, estando por defecto
solamente disponibles los caracteres pertenecientes a la página de códigos
[CP-437](https://es.wikipedia.org/wiki/Página_de_códigos_437), la cual es la
proporcionada normalmente por la BIOS.

Para poder hacer uso en el terminal de estos caracteres, y particularmente de
los [patrones Braille](http://en.wikipedia.org/wiki/Braille_Patterns) usados
para dibujar líneas y puntos con una mayor precisión, se ha creado la fuente
[nodeos-console-font](https://github.com/NodeOS/nodeos-console-font) basada en
los caracteres de [Unifont](http://unifoundry.com/unifont.html) pero cambiando
los glifos de dichos patrones Braille por unos propios más apropiados para su
uso en el dibujo de gráficos. Para ello, se ha adaptado el script en Perl
encargado de [generarlos en UniFont](http://czyborra.com/unifont/braille.pl) a
Node.js y se ha añadido soporte para poder seleccionar entre varios tipos de
puntos a la hora de generarlos.

Después, se ha generado la fuente de pantalla basándose en las equivalencias
estándar y usando los conjuntos de caracteres requeridos en los terminales Linux
y los "útiles", junto con el conjunto de patrones braille, que se añaden al
final para que estén todos alojados en los 256 glifos del mapa de caracteres
alternativo (posiciones 256 a 511). Además, se ha añadido un conjunto de
caracteres propios incluyendo los restantes glifos de dibujado de cajas de los
terminales VT-100 y de bloques rectangulares (especialmente útil para el
dibujado suave de barras de progreso) y algunas equivalencias adicionales para
permitir la inclusión de todo el conjunto de caracteres útiles (simplificación
de flechas, cajas, comillas o símbolos de monedas). Más adelante se plantea
ampliar el conjunto de caracteres propios de NodeOS, diferenciando los que
realmente están siendo usados de los pertenecientes al conjunto de caracteres
útiles, para tener un control real de cuáles se están incluyendo y en qué
posición se alojan.

No obstante, actualmente no se está haciendo uso de esta fuente en NodeOS debido
a que, a pesar de que el kernel de Linux permite el uso de fuentes de pantalla
de 512 glifos, no soporta el que sean incluidas por defecto dentro del mismo,
requiriendo el que sean cargadas posteriormente. Esto en un sistema como NodeOS
complicaría mucho su uso puesto que hace que el usuario sea consciente de que
debe cambiar la fuente de pantalla, por lo que se ha postergado el desarrollo de
un parche para el kernel de Linux que habilite el uso de fuentes de 512 glifos
durante el arranque, ya que su código fuente indica que sí está preparado para
ello habiéndose dejado pendiente su implementación final. Sin embargo, parece
ser que [los desarrolladores no aceptan parches](http://askubuntu.com/a/23614)
para mejorar el soporte de Unicode en la consola, ya que consideran que debe ser
usada únicamente como interfaz de emergencia, por lo que puede que sea esta la
razón por la que todavía no se ha añadido dicho soporte. Ha habido algunos
[esfuerzos previos](http://www.spinics.net/lists/linux-console/msg00030.html),
pero el consenso parece ser que si se desea un mejor soporte de Unicode en la
consola de Linux, debe usarse en su lugar un emulador de terminal que haga uso
del dispositivo de framebuffer como es el caso de
[FbTerm](https://code.google.com/archive/p/fbterm). Esto tendría la ventaja
añadida de poder hacer uso del juego de caracteres Unicode completo, aunque
añade una serie de dependencias, consumo de recursos y de complicación adicional
del sistema que de otra manera no serían necesarias, por lo que sigue teniendo
sentido el uso de una fuente propia en entornos puramente de texto. No obstante,
existen algunos [parches](https://github.com/outsinre/cjktty-patch) que permiten
añadir soporte completo de Unicode en el kernel de Linux junto con una fuente
que contiene los 65536 glifos del [Plano 0](http://unicode.org/roadmaps/bmp)
(*BMP* o *Plano Básico Multilenguaje*), por lo que se ha dejado como una posible
futura mejora el incorporar dichos parches al kernel proporcionado por NodeOS.
