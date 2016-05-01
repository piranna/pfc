## Implementación

1. [cross-toolchain](1. cross-toolchain.html)
  1. [gcc](1. cross-toolchain.html#gcc)
  2. [Descarga de dependencias](1. cross-toolchain.html#descarga-de-dependencias)
2. [barebones](2. barebones.html)
  1. [Node.js](2. barebones.html#node.js)
  2. [Linux](2. barebones.html#linux)
  3. [Comprobaciones finales](2. barebones.html#comprobaciones-finales)
  4. [Problemas encontrados](2. barebones.html#problemas-encontrados)
3. [initramfs](3. initramfs.html)
4. [rootfs](4. rootfs.html)
  1. [Generación del sistema raíz](4. rootfs.html#generación-del-sistema-raíz)
5. [usersfs](5. usersfs.html)
  1. [Usuario root](5. usersfs.html#usuario-root)
  2. [Usuario nodeos](5. usersfs.html#usuario-nodeos)
6. [NodeOS](6. NodeOS.html)
7. [Módulos propios](7. módulos propios/index.html)
  1. [coreutils.js](7. módulos propios/coreutils.js.html)
  2. [Davius](7. módulos propios/Davius.md)
  3. [DebugFS](7. módulos propios/DebugFS.html)
  4. [download-checksum](7. módulos propios/download-checksum.html)
  5. [download-manager](7. módulos propios/download-manager.html)
  6. [ExclFS](7. módulos propios/ExclFS.html)
  7. [logon](7. módulos propios/logon.html)
  8. [nodeos-console-font](7. módulos propios/nodeos-console-font.html)
  9. [nodeos-init](7. módulos propios/nodeos-init.html)
  10. [nodeos-media](7. módulos propios/nodeos-media.html)
  11. [nodeos-mount-filesystems](7. módulos propios/nodeos-mount-filesystems.html)
    1. [Proceso de montaje de los sistemas de archivos](7. módulos propios/nodeos-mount-filesystems.html#proceso-de-montaje-de-los-sistemas-de-archivos)
    2. [Sistema de archivos raíz de cada usuario](7. módulos propios/nodeos-mount-filesystems.html#sistema-de-archivos-raíz-de-cada-usuario)
    3. [Sistema de archivos raíz del usuario *root*](7. módulos propios/nodeos-mount-filesystems.html#sistema-de-archivos-raíz-del-usuario-root)
    4. [Sistema de archivos raíz real](7. módulos propios/nodeos-mount-filesystems.html#sistema-de-archivos-raíz-real)
  12. [nodeos-mount-utils](7. módulos propios/nodeos-mount-utils.html)
  13. [usrbinenv](7. módulos propios/usrbinenv.html)
    1. [Ejecución de scripts de Node.js](7. módulos propios/usrbinenv.html#ejecución-de-scripts-de-node.js)
    2. [Ejecución de binarios externos](7. módulos propios/usrbinenv.html#ejecución-de-binarios-externos)
    3. [Ubicación del comando](7. módulos propios/usrbinenv.html#ubicación-del-comando)

El proceso de construcción esta integrado en el ciclo de vida típico del gestor
de paquetes npm, de forma que resulte familiar a los desarrolladores de Node.js.
En este sentido, se han reutilizado las etapas típicas de un paquete npm
correspondientes a su construcción e instalación.

La estructura empleada en los distintos módulos en los que se divide el sistema
es la misma para todos ellos, consistente en:

* un archivo `package.json` con la configuración del módulo y de los scripts a
  ejecutar en cada una de las etapas
* un directorio con los scripts a ejecutar
* directorios para las dependencias, archivos temporales y los productos finales

Esta organización permite por un lado el no tener que descargar y parchear
varias veces el código fuente de las librerías y componentes del sistema ni
recrear los productos finales una vez generados, simplemente comprobando si el
directorio de productos construidos ya existe, y por otro el poder eliminar los
archivos temporales fácilmente en caso de que se haya producido un error durante
su construcción. Además, facilita el crear una estructura uniforme que permita
reutilizar código y detectar los problemas que puedan aparecer. Esto último esta
potenciado por el hecho de comprobar el estado de salida de cada comando y
terminar la ejecución de los scripts con un código de error distinto para cada
uno de ellos, de forma que se pueda identificar inequívocamente la operación que
ha fallado.

En cuanto al ciclo de vida de los módulos, las distintas etapas a ejecutar son:

* *preinstall*, encargada de descargar el código fuente de las distintas
  librerías y componentes desde su página web correspondiente, y parchearlo si
  fuese necesario. En el caso de las herramientas externas independientes de la
  plataforma destino para la que se vaya a compilar el sistema (como es el
  generador de particiones VFAT *genfatfs*) también se produce la compilación en
  esta etapa, ya que a priori sólo debería ejecutarse una única vez.
* *build*, construcción del módulo para la plataforma deseada. En `npm` 3 es
  considerado una etapa de primer nivel, pero en `npm` 2 es preciso invocarlo
  explícitamente desde la etapa *install* mediante `npm run build`.
* *postinstall*, tareas a ejecutar una vez que se ha construido el módulo, como
  por ejemplo pasar tests o hacer tareas de limpieza.

Al usarse versiones estables de los distintos proyectos sin modificar, el
proceso de construcción (*build*) es similar para todos ellos:

* en primer lugar se comprueba si el componente ya esta construido con
  anterioridad para esta plataforma en concreto. Generalmente esto se hace
  comprobando si existe el directorio donde se han estado construyendo los
  objetos temporales del mismo, o cuando sea posible, comprobando si existen los
  productos finales ya generados. Esto es así porque el proceso de construcción
  se ha diseñado de forma que todos ellos hagan uso de la variable `$OBJ_DIR`
  para indicar la ubicación de dichos objetos temporales, y en caso de que se
  produzca un fallo durante la compilación de los mismos, poder eliminar dicho
  directorio automáticamente.
* el siguiente paso consiste en la configuración del componente. siguiendo en
  casi todos los casos el estándar `./configure`. Allá donde sea posible, se
  intenta configurar de forma que después se haga una compilación *out-of-tree*
  (donde los archivos compilados se escriben en un directorio distinto al del
  código fuente), aunque en algunos casos como en el de Node.js esto no es
  posible, por lo que se procede a ejecutar una tarea de limpieza previamente
  para eliminar los archivos correspondientes a una compilación anterior.
  También en las opciones de configuración se intenta desactivar toda la
  funcionalidad extra posible (como puede ser la generación de librerías
  estáticas) para acelerar dicho proceso, y para que sólo notifique de los
  mensajes de error en lugar de mostrar todas las operaciones que se estén
  ejecutando, además de generar los componentes sin información de depuración
  para reducir su tamaño. En caso de que esto último no sea posible, dicha
  información de depuración se elimina en un paso posterior.
* después se procede a la compilación propiamente dicha, donde al igual que en
  el caso anterior, se intenta que se generen sólamente los productos que se van
  a emplear posteriormente.
* y el último paso es la instalación de los componentes, lo cual en algunos
  casos se reduce sólamente a copiar los productos generados.

Este proceso es similar en todas las distintas capas del sistema. En algunos
casos hay una etapa extra que elimina los objetos de etapas siguientes generados
en anteriores compilaciones (sobre todo en el caso de que estos dependan de los
productos generados antes como es el caso de la construcción del *initram*
embebido dentro del kernel de Linux, el cual requiere tener disponible el
binario de Node.js recién compilado) de forma que se fuerce a que estos sean
regenerados.

Se ha estudiado la posibilidad de usar para el proceso de generación
[node-gyp](https://github.com/nodejs/node-gyp), que es el método oficial para
generar módulos compilados en Node.js. Esto requeriría el generar scripts de
configuración de [GYP](https://code.google.com/p/gyp), el gestor de compilación
desarrollado por Google para el motor Javascript
[v8](https://developers.google.com/v8) y por extensión usado por Node.js. Sin
embargo, GYP requiere del uso de un interprete *Python* 2.7 (versión ya
obsoleta) y además Google ha abandonado internamente el uso de GYP en beneficio
de su nuevo gestor de configuración y compilación
[gn](https://chromium.googlesource.com/chromium/src/tools/gn). Por este motivo,
se están estudiando dentro de la comunidad de Node.js distintas
[alternativas](https://github.com/nodejs/node/issues/133) (reimplementar `GYP`
en Javascript, utilizar makefiles, crear un nuevo gestor de configuración
escrito en C...) sin que haya surgido todavía una opción adecuada, por lo que se
ha decidido continuar en NodeOS con el uso de scripts propios hasta que se
acuerde una solución al respecto, o se cree su propio gestor de compilación.

Adicionalmente, entre las etapas utilizadas también podemos encontrar:

* *start*, ejecución de la capa actual y todas las anteriores dentro de una
  máquina virtual, por defecto QEmu. El script empleado es capaz de detectar el
  microprocesador para el que esta compilado y si la máquina host soporta
  virtualización a nivel de hardware (lo cual ofrece una mejor experiencia de
  usuario), al igual que permite definir el modo gráfico a usar.
* *test*, comprobación básica del funcionamiento del módulo.
* *unbuild*, eliminación de los archivos generados por el módulo. Debe ser
  invocado explícitamente mediante `npm run unbuild`.

Por otra parte, la mayoría de scripts están escritos en `bash`, aunque se están
portando a Javascript para facilitar el que mas adelante el sistema pueda ser
autocontenido (generable dentro de otra instancia de NodeOS). Los principales
problemas que han surgido hasta el momento en esta transición han correspondido
a la etapa de descarga del código fuente de los distintos proyectos, para lo
cual se han abierto varios issues relativos al soporte correcto de la extracción
de archivos de gran tamaño en los proyectos correspondientes a los módulos
[download](https://github.com/kevva/download/issues?q=author%3Apiranna) y
[decompress](https://github.com/kevva/decompress/issues?q=author%3Apiranna). Una
vez corregidos dichos fallos, se ha desarrollado el módulo
[download-manager](7. módulos propios/download-manager.html)
para poder procesarlas todas de forma uniforme. El resto de etapas consisten
principalmente en la ejecución de otros comandos externos como las herramientas
de configuración de GYP o el compilador, por lo que previamente a la conversión
para que NodeOS sea auto-contenido, es necesario buscar alternativas a ellos
escritas en Javascript.

Se ha prestado especial atención a que el proceso de generación no requiera de
permisos de administrador en ninguna de sus etapas, lo cual incluye la
generación de las imágenes de disco haciendo que no sea necesario su montaje, y
también las correspondientes a Docker, ya que su proceso de generación estándar
los requiere. Para ello se han generado archivos `cpio` y `tar` a partir de
archivos describiendo su contenido en vez de usar archivos reales evitando de
este modo problemas de permisos. Por otro lado, se hace uso de los comandos
`genfatfs` y `genext2fs` para crear directamente las imágenes de disco sin
necesidad de montarlas previamente, y también del gestor de arranque SyxLinux,
el cual esta preparado para trabajar con ellas explícitamente a diferencia de
`GRUB`, que está orientado a su uso con discos duros y particiones reales. La
razón de hacerlo de esta manera es para poder compilar y generar los archivos
del sistema operativo usando las herramientas estándar de Node.js y npm, ya que
ejecutarlos con permisos de administrador provoca algunos problemas con la
instalación de dependencias, por los que se aconseja que siempre se ejecuten con
usuarios normales.
