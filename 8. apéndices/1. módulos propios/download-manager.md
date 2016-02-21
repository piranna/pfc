#### download-manager

El código fuente de las distintas dependencias de NodeOS necesarias para su
construcción debe ser descargado y en algunos casos procesado antes de poder
usarse, como puede ser su parcheo en el caso de *Node.js* o *gcc*, o bien de su
compilación previa en el caso de las herramientas externas como `genext2fs`.
Puesto que estas tareas debían ser realizadas en varias de las capas, decidí
hacer un módulo independiente que se encargara de procesarlas de forma uniforme
en todos los casos.

[download-manager](https://github.com/piranna/download-manager) hace uso del
módulo [download](https://github.com/kevva/download) para la descarga del código
fuente de las distintas dependencias independientemente del formato en el que
sean distribuidas, comprobando si la descarga se ha realizado anteriormente para
evitar repetirla. También muestra una barra de progreso mediante el módulo
[download-status](https://github.com/kevva/download-status) y detecta cuando
está siendo ejecutado en un entorno no interactivo (como es el caso de los
servidores de integración continua) para evitar el que se impriman caracteres de
control que dificulten su revisión. Por otro lado, también hace uso del módulo
[jsdiff](../2. colaboraciones con proyectos externos/jsdiff.html) para poder
aplicar los parches del código de cada uno de los proyectos automáticamente,
reduciendo la tarea del usuario a configurar las descargas y definir los pasos a
seguir para después compilar estos.

Para usar el módulo basta con definir un array de objetos que describan las
descargas, indicando en estas la URL desde donde se descargaran y el nombre que
tendrá el directorio donde se guarde finalmente una vez descomprimida. De esta
forma, todas las dependencias se descargarán en paralelo y se instalarán y
procesarán simultáneamente. Igualmente, de forma opcional se pueden definir la
URL a un parche junto con la ruta donde este deba aplicarse y si debe omitirse
algún fragmento en la misma. Por último, también se puede definir la acción a
ejecutar cuando el código haya sido descargado y parcheado, como por ejemplo
compilarlo en el caso de las herramientas externas.

Antes de desarrollarse como un módulo independiente, la funcionalidad ofrecida
por *download-manager* estuvo implementada como un script perteneciente a
[cross-toolchain](../../../5. descripción informática/3. Implementación/1. cross-toolchain.html).
Dicho script dio varios problemas en su desarrollo (no así la versión inicial
hecha en `bash`) debido a que es necesario descargar y preparar varios
componentes, y a que en general las dependencias empleadas no estaban preparadas
para la complejidad de la tarea, orientándose a usos mas simples y teniendo en
varias ocasiones que adaptarlos a la misma o corregir diversos fallos:

* El primero de ellos fue el módulo *download*, el cual a pesar de permitir
  descargar varios archivos simultáneamente, solo podía notificar correctamente
  la descarga de uno de ellos cada vez, aparte de que no permitía indicar
  ubicaciones independientes para cada una de ellas.
* Entre las dependencias de *download*, el módulo
  [vinyl-fs](../2. colaboraciones con proyectos externos/vinyl-fs.html) no
  preservaba la fecha de modificación (`mtime`) de los archivos descargados, lo
  cual daba problemas en la compilación de algunos componentes puesto que el
  comando `make` percibía que dichos archivos habían sido modificados cuando
  realmente no había sido así.
* [tar-stream](../2. colaboraciones con proyectos externos/tar-stream.html) no
  incluía soporte para la extensión de GNU `tar`
  [@LongLink](https://github.com/mafintosh/tar-stream/issues/35), la cual
  permite el uso de rutas largas con muchos niveles de directorios para los
  archivos y que es usada en el código fuente de Node.js, GCC y Linux, por lo
  que era necesaria para poder extraerlos correctamente desde Javascript. Además
  requería de un campo `type` para identificar el formato del archivo en vez de
  usar el campo estándar `mode`, al igual que requería que se indicara la ruta
  de los links simbólicos en la propia cabecera del archivo en lugar del cuerpo
  del mismo lo cual estructuralmente es mas correcto. Esto impedía el que se
  pudiera usar la API de streams para conectar directamente la salida de
  [cpio-stream](../2. colaboraciones con proyectos externos/cpio-stream.html) a
  *tar-stream*, por lo que [decidí](https://github.com/mafintosh/tar-stream/pull/42)
  implementar dicho soporte. No obstante, los archivos `tar` generados tienen
  [problemas con los link simbólicos](https://github.com/mafintosh/tar-stream/issues/44)
  por lo que no pueden ser usados con Docker, aunque si con vagga.
* Originariamente se estaban descargando los distintos proyectos en formato
  [tar.xz](http://tukaani.org/xz) cuando fuese posible, ya que su tamaño es
  notablemente menor comparado con el formato [tar.gz](http://www.gzip.org). El
  módulo [decompress](https://github.com/kevva/decompress) no incluía soporte
  para el mismo, por lo que [sugerí](https://github.com/kevva/decompress/issues/22)
  la posibilidad de incluirlo. Debido al uso de un modulo compilado finalmente se
  implementó como un plugin [externo](https://github.com/kevva/decompress-tarxz),
  aunque por problemas en su compilación en NodeOS finalmente decidí usar en su
  lugar las dependencias en formato `tar.gz` de forma uniforme a pesar de
  requerir un mayor ancho de banda, ya que están disponibles para todos los
  componentes.
* Por último, al estar mas enfocado para su uso con fragmentos de texto pequeños,
  *jsdiff* no incluía soporte para tratar con parches que afectasen a varios
  archivos ni soportaba correctamente el formato
  [diff unificado](http://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html),
  al igual que tampoco soportaba el que los parches no coincidieran exactamente
  en las lineas indicadas en el mismo al aplicarlos, por lo que le añadí soporte
  para estas características.
