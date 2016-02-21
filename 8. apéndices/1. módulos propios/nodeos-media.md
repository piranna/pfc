#### nodeos-media

Las imágenes y logotipos originales de NodeOS sólo estaban disponibles como
imágenes en formato [PNG](http://www.w3.org/TR/PNG). Esto imposibilita el poder
crear contenidos nuevos en alta calidad como podrían ser fondos de pantalla o el
logo del sistema operativo durante el arranque, pero sobretodo el poder ser
usadas en medios impresos (como es el caso de esta memoria). Es por este motivo
por el que decidí rehacer el logotipo en un formato gráfico vectorial, en
concreto [SVG](http://www.w3.org/Graphics/SVG).

Para ello utilicé el programa [Dia](https://wiki.gnome.org/Apps/Dia) usando una
rejilla de panel de abeja como base para poder replicar el esquema hexagonal de
cubos en vista isométrica característico de los logotipos de proyectos
relacionados con Node.js y en el que el logo de NodeOS también esta basado, con
la ventaja adicional de poder usar de este modo unas medidas y proporciones
exactas. Las letras y el diamante central del logo los realice usando polilíneas
a excepción de la letra *o*, donde son dos polígonos superpuestos. También
aproveche a cambiar los colores del logotipo por otros aproximados pertenecientes
a los [colores VGA standard](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors)
de forma que el logo pueda verse correctamente en la consola, acorde a las
[guías de interfaz](https://github.com/NodeOS/NodeOS/issues/147) de NodeOS.

Después de exportar la imagen en formato *SVG* procedí a editarla en
[Inkscape](https://inkscape.org/es) para poder unir los dos polígonos que
conforman la letra *o* realizando una operación de substracción del menor al
mayor para generar el hueco central y poder aplicarle un fondo transparente,
formando un único objeto. También aproveche para poner IDs a cada uno de los
componentes para que sean mas fáciles de identificar dentro del código fuente
de la imagen SVG y a simplificar manualmente con un editor de textos la imagen
generada eliminando los bordes de los polígonos y los metadatos redundantes,
reduciendo de esta forma el tamaño final del archivo.
