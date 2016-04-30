#### nodeos-media

Las imágenes y logotipos originales de NodeOS solo estaban disponibles como
imágenes en formato [PNG](http://www.w3.org/TR/PNG). Esto imposibilitaba crear
contenidos nuevos en alta calidad como fondos de pantalla o el logo del sistema
operativo durante el arranque, pero sobre todo impide poder ser usadas en medios
impresos (como es el caso de esta memoria). Es por este motivo por el que se
rehizo el logotipo en un formato gráfico vectorial, concretamente
[SVG](http://www.w3.org/Graphics/SVG).

Para ello, se utilizó el programa [Dia](https://wiki.gnome.org/Apps/Dia) usando
una rejilla de panel de abeja como base para poder replicar el esquema hexagonal
de cubos, en vista isométrica, característico de los logotipos de proyectos
relacionados con Node.js y en el que el logo de NodeOS también está basado, con
la ventaja adicional de poder usar unas medidas y proporciones exactas. Las
letras y el diamante central del logo se realizaron usando polilíneas (a
excepción de la letra *o*, que son dos polígonos superpuestos). También se
cambiaron los colores del logotipo por otros aproximados pertenecientes a los
[colores VGA standard](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors),
de forma que el logo pueda verse correctamente en la consola, acorde a las
[guías de interfaz](https://github.com/NodeOS/NodeOS/issues/147) de NodeOS.

Después de exportar la imagen en formato *SVG*, se procedió a editarla en
[Inkscape](https://inkscape.org/es) para poder unir los dos polígonos que
conforman la letra *o*, realizando una operación de substracción del menor al
mayor para generar el hueco central y poder aplicarle un fondo transparente,
formando un único objeto. También se puso IDs a cada uno de los componentes para
que fueran más fáciles de identificar dentro del código fuente de la imagen SVG
y se simplificó manualmente, con un editor de textos, la imagen generada
eliminando los bordes de los polígonos y los metadatos redundantes, reduciendo
así el tamaño final del archivo.
