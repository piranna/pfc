## Implementación

1. [cross-toolchain](1. cross-toolchain.html)
2. [barebones](2. barebones.html)
  1. [Node.js](2. barebones.html#node.js)
  2. [Linux](2. barebones.html#linux)
  3. [Comprobaciónes finales](2. barebones.html#comprobaciónes-finales)
  4. [Problemas encontrados](2. barebones.html#problemas-encontrados)
3. [initramfs](3. initramfs.html)
4. [rootfs](4. rootfs.html)
  1. [Generación del sistema raíz](4. rootfs.html#generación-del-sistema-raíz)
5. [usersfs](5. usersfs.html)
  1. [root](5. usersfs.html#root)
  2. [nodeos](5. usersfs.html#nodeos)
6. [NodeOS](6. NodeOS.html)

El proceso de construcción esta integrado en el ciclo de vida tipico del gestor
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
varias veces el código fuente de las librerias y componentes del sistema ni
recrear los productos finales una vez generados simplemente comprobando si el
directorio de productos construidos ya existe, y por otro el poder eliminar los
archivos temporales facilmente en caso de que se haya producido un error durante
su construcción. Ademas, facilita el crear una estructura uniforme que permita
reutilizar código y detectar los problemas que puedan aparecer. Esto último esta
potenciado por el hecho de comprobar el estado de salida de cada comando y
terminar la ejecución de los scripts con un código de error distinto para cada
una de ellos, de forma que se pueda identificar inequivocamente la operación que
ha fallado.

En cuanto al ciclo de vida de los módulos, las distintas etapas a ejecutar son:

* *preinstall*, encargada de descargar el código fuente de las distintas
  librerias y componentes desde su página web correspondiente y parchearlo si
  fuese necesario. En el caso de las herramientas externas independientes de la
  plataforma destino para la que se vaya a compilar el sistema (como es el
  generador de particiones VFAT *genfatfs*) también se produce la compilación en
  esta etapa, ya que a priori sólo deberia ejecutarse una única vez.
* *build*, construcción del módulo para la plataforma deseada. En `npm` 3 es
  considerado una etapa de primer nivel, pero en `npm` 2 es preciso invocarlo
  explicitamente desde la etapa *install* mediante `npm run build`.
* *postinstall*, tareas a ejecutar una vez que se ha construido el módulo, como
  por ejemplo tests o tareas de limpieza.

Al usarse versiones estables de los distintos proyectos sin modificar, el
proceso de construcción (*build*) es similar para todos ellos:

* en primer lugar se comprueba si el componente ya esta construido con
  anterioridad para esta plataforma en concreto. Generalmente esto se hace
  comprobando si existe el directorio donde se han estado construyendo los
  objetos temporales del mismo, o cuando sea posible comprobando si existen los
  productos finales ya generados. Esto es asi puesto que el proceso de
  construcción se ha diseñado de forma que todos ellos hagan uso de la variable
  `$OBJ_DIR` para indicar la ubicación de dichos objetos temporales, y en caso
  de que se produzca un fallo durante la Compilación de los mismos, poder
  eliminar dicho directorio automaticamente.
* el siguiente paso consiste en la configuración del componente. siguiendo en
  casi todos los casos el estandar `./configure`. Allá donde sea posible se
  intenta configurar de forma que después se haga una compilación out-of-tree,
  aunque en algunos casos como en el de Node.js esto no es posible, por lo que
  se procede a ejecutar una tarea de limpieza previamente. También en las
  opciones de configuración se intenta desactivar toda la funcionalidad extra
  posible (como puede ser la generación de librerias estáticas) para acelerar
  dicho proceso y para que solo notifique de los mensajes de error en lugar de
  mostrar todas las operaciones que se esten ejecutando, ademas de generar los
  componentes sin información de depuración para reducir su tamaño. En caso de
  que esto último no sea posible, dicha información de debug se elimina en un
  proceso posterior.
* despues se procede a la compilación propiamente dicha, que al igual que en el
  caso anterior, se intentan generar solamente los productos que se van a
  emplear posteriormente.
* y el último paso es la instalación de los componentes, lo cual en algunos
  casos se reduce solamente a copiar los productos generados.

Este proceso es similar en todas las distintas capas del sistema. En algunos
casos hay una etapa extra que elimina los objetos de etapas siguientes generados
en anteriores compilaciones (sobretodo en el caso de que estos dependan de los
productos generados antes como es el caso de la construcción del initram
embebido dentro del kernel de Linux, el cual requiere tener disponible el
binario de Node.js recien compilado) de forma que se fuerce a que estos sean
regenerados.

Se ha estudiado la posibilidad de usar para el proceso de generación
[node-gyp](https://github.com/nodejs/node-gyp), el cual es el metodo oficial
para generar módulos compilados en Node.js. Esto requiere el generar scripts de
configuración de [GYP](https://code.google.com/p/gyp), el gestor de compilación
desarrollado por Google para el motor Javascript
[v8](https://developers.google.com/v8) y por extensión usado por Node.js. Sin
embargo, GYP requiere del uso de un interprete [Python](https://www.python.org)
2.7 (versión ya obsoleta) y ademas Google esta deprecando internamente el uso de
GYP en beneficio de [gn](https://chromium.googlesource.com/chromium/src/tools/gn).
Por este motivo, se estan estudiando dentro de la comunidad de Node.js distintas
[alternativas](https://github.com/nodejs/node/issues/133) (reimplementar `GYP`
en Javascript, utilizar makefiles, crear un nuevo gestor de configuración
escrito en C...) sin que haya surgido todavía una opción adecuada, por lo que se
ha decidido continuar con el uso de scripts propios hasta que se acuerde una
solución al respecto.

Adicionalmente, entre las etapas utilizadas tambien podemos encontrar:

* *start*, ejecución de la capa actual y todas las anteriores dentro de una
  máquina virtual, por defecto QEmu. El script empleado es capaz de detectar el
  microprocesador para el que esta compilado y si la máquina host soporta
  virtualización a nivel de hardware (lo cual ofrece una mejor experiencia de
  usuario), al igual que permite definir el modo gráfico a usar.
* *test*, comprobación básica del funcionamiento del módulo.
* *unbuild*, eliminación de los archivos generados por el módulo. Debe ser
  invocado explicitamente mediante `npm run unbuild`.

Por otra parte, la mayoria de scripts estan escritos en `bash`, aunque se estan
portando a Javascript para facilitar el que mas adelante el sistema pueda ser
autocontenido (generable dentro de otra instancia de NodeOS). Los principales
problemas que han surgido hasta el momento en esta transición han correspondido
a la etapa de descarga de los distintos códigos fuente, para lo cual he abierto
varios issues relativos al soporte correcto de la extracción de archivos de gran
tamaño en los proyectos correspondientes a los módulos
[download](https://github.com/kevva/download/issues?q=author%3Apiranna) y
[decompress](https://github.com/kevva/decompress/issues?q=author%3Apiranna). Una
vez corregidos dichos fallos, he hecho el módulo
[download-manager](../../8. apéndices/1. módulos propios/download-manager.html)
para poder procesarlas todas de forma uniforme. El resto de etapas consisten
principalmente en la ejecución de otros comandos externos como las herramientas
de configuración de GYP o el compilador, por lo que previamente a la conversión
es necesario buscar alternativas a ellos escritas en Javascript.
