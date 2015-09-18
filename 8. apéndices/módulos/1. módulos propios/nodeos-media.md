#### nodeos-media

Las imagenes y logotipos originales de NodeOS solo estaban disponibles en
formato PNG. Esto imposibilita el poder crear contenidos nuevos como por ejemplo
fondos de pantalla o el logo del sistema operativo durante el arranque  de alta
calidad, pero tambien el poder ser usadas en medios impresos (como es el caso de
esta memoria). Es por este motivo por el que decidi rehacer el logotipo en un
formato grafico vectorial, en concreto [SVG]().

Para ello utilice el programa
[Dia]() usando una rejilla de panel de abeja como base para poder replicar el
esquema hexagonal de cubos en vista isometrica caracteristica de los
proyectos relaccionados con Node.js y en el que el logo de NodeOS tambien esta
basado, con la ventaja adicional de este modo de poder usar unas medidas y
proporciones exactas. Las letras y el diamante central del logo los realice con
polilineas a excepcion de la *o*, donde son dos poligonos superpuestos. Tambien
aproveche a cambiar los colores por otros aproximados pertenecientes a la
[paleta VGA basica]() de forma que el logo pueda verse correctamente en la
consola, acorde a las [guias de interfaz]() de NodeOS.

Despues de exportar la imagen en formato SVG procedi a editarla en [Inkscape]()
para poder unir los dos poligonos que conforman la letra *o* y poder aplicarle
un fondo transparente. Tambien aproveche para poner IDs a cada uno de los
componentes para que sean mas faciles de identificar dentro del codigo fuente
de la imagen SVG y a simplificar manualmente con un editor de textos la imagen
generada eliminando los bordes de los poligonos y los metadatos redundantes,
reduciendo de esta forma el tamaño final del archivo.
