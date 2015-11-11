#### download-manager

El código fuente de las distintas dependencias de NodeOS necesarias para su
construcción debe ser descargado y en algunos casos procesado antes de poder
usarse, como puede ser su parcheo en el caso de *Node.js* o *gcc*, o bien de su
compilacion previa en el caso de las herramientas externas como `genext2fs`.
Puesto que estas tareas debian ser realizadas en distintos puntos, decidi hacer
un módulo independiente que se encargara de procesarlas de forma uniforme en
todos los casos.

[download-manager](https://github.com/piranna/download-manager) hace uso del
módulo [download](https://github.com/kevva/download) para la descarga del código
fuente de las distintas dependencias independientemente del formato en el que
sean distribuidas, y comprueba si la descarga se ha realizado anteriormente para
evitar repetirla. Ademas muestra una barra de progreso mediante el módulo
[download-status](https://github.com/kevva/download-status) y detecta cuando
esta siendo ejecutado en un entorno no interactivo (como es el caso de los
servidores de integración continua) para mostrar en su lugar unicamente las
etapas que esta ejecutando. Por otro lado tambien hace uso del módulo
[jsdiff](../2. colaboraciones con proyectos externos/jsdiff.html) para poder
aplicar los parches del codigo de cada uno de los proyectos automaticamente,
reduciendo la tarea del usuario a configurar las descargas y definir los pasos a
seguir para despues compilar estos.

Para usar el módulo basta con definir un array de objetos que describan las
descargas, indicando en estas la URL desde donde se descargaran y el nombre que
tendra el directorio donde esta se guarde finalmente una vez descomprimida. De
esta forma todas las dependencias se descargaran en paralelo y se instalaran y
procesaran simultaneamente. Igualmente, de forma opcional se pueden definir la
URL del parche a aplicar junto con la ruta donde debe aplicarse y si debe
omitirse algun fragmento en la ruta indicada dentro de las cabeceras del propio
parche (por lo que es recomendable revisarlo antes de configurar el módulo para
que se apliquen automaticamente). Por ultimo, tambien se puede definir la acción
a ejecutar cuando el codigo haya sido descargado y parcheado, como por ejemplo
compilarlo en el caso de las herramientas externas.

Antes de desarrollarse como un módulo independiente, la funcionalidad ofrecida
por *download-manager* estuvo implementada como un script perteneciente a
[cross-toolchain](../../../5. descripción informática/3. Implementación/1. cross-toolchain.html).
Dicho script dio varios problemas en su desarrollo (no asi la versión inicial
hecha en `bash`) debido a que es necesario descargar y preparar varios
componentes, y a que en general las dependencias empleados no estaban preparadas
para la complejidad de la tarea, orientandose a usos mas simples y teniendo en
varias ocasiones que adaptarlos o arreglarlos por mi mismo:

* El primero de ellos fue el módulo *download*, el cual a pesar de permitir
  descargar varios archivos simultaneamente solo podia notificar correctamente
  la descarga de uno de ellos cada vez, aparte de hacer todas las descargas en
  la misma ubicación.
* Entre las dependencias de *download*, el módulo
  [vynil-fs](../2. colaboraciones con proyectos externos/vinyl-fs.html) no
  preservaba la fecha de modificacion (`mtime`) de los archivos descargados, lo
  cual daba problemas a la hora de compilar puesto que el comando `make` pensaba
  que dichos archivos habian sido modificados.
* [tar-stream](../2. colaboraciones con proyectos externos/tar-stream.html)
* Originariamente se estaban descargando los distintos proyectos en formato
  [tar.xz](http://tukaani.org/xz) cuando fuese posible. El módulo
  [decompress](https://github.com/kevva/decompress) no incluia soporte para el
  mismo por lo que [sugeri](https://github.com/kevva/decompress/issues/22)
  incluirlo. Debido al uso de un modulo compilado se implementó como un plugin
  [externo](https://github.com/kevva/decompress-tarxz), aunque debido a
  problemas en su compilación en NodeOS finalmente decidi usar en su lugar las
  dependencias en formato `tar.gz`, que a pesar de requerir un mayor ancho de
  banda estan disponibles para todas ellas y permiten que el proceso de descarga
  sea uniforme.
* Por ultimo, al estar mas enfocado para su uso con fragmentos de texto pequeños,
  *jsdiff* no incluia soporte para tratar con parches que afectaban a varios
  archivos ni soportaba correctamente el *formato diff unificado*, al igual que
  tampoco soportaba el que los parches no coincidieran exactamente al aplicarlos,
  por lo que le añadi soporte para estas caracteristicas.
