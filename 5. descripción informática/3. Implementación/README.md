## Implementación

1. [cross-toolchain](1. cross-toolchain.html)
2. [barebones](2. barebones.html)
3. [initramfs](3. initramfs.html)
4. [rootfs](4. rootfs.html)
  1. [Generación del sistema raiz](4. rootfs.html#generación-del-sistema-raiz)
5. [usersfs](5. usersfs.html)
  1. [root](5. usersfs.html#root)
  2. [nodeos](5. usersfs.html#nodeos)
6. [NodeOS](6. NodeOS.html)
El proceso de construcción esta integrado en el ciclo de vida tipico del gestor
de paquetes npm, de forma que resulte familiar a los desarrolladores de Node.js.
En este sentido, se han reutilizado las etapas tipicas de un paquete npm
correspondientes a su construccion e instalacion.

La estructura empleada en los distintos modulos en los que se divide el sistema
es la misma para todos ellos, consistente en:

* un archivo `package.json` con la configuración del modulo y de los scripts a
  ejecutar en cada una de las etapas
* un directorio con los scripts a ejecutar
* directorios para las dependencias, archivos temporales y los productos finales

Esta organización permite por un lado el no tener que descargar y parchear
varias veces el codigo fuente de las librerias y componentes del sistema ni
recrear los productos finales una vez generados simplemente comprobando si el
directorio de productos construidos ya existe, y por otro el poder eliminar los
archivos temporales facilmente en caso de que se haya producido un error durante
su construcción, ademas de facilitar el crear una estructura uniforme que
facilite el reutilizar codigo y detectar los problemas que puedan aparecer. Esto
ultimo esta potenciado por el hecho de comprobar el estado de salida de cada
comando y terminar la ejecución de los scripts con un codigo de error distinto
para cada una de ellos, de forma que se pueda identificar inequivocamente la
operación que ha fallado.

En cuanto al ciclo de vida de los modulos, las distintas etapas a ejecutar son:

* *preinstall*, encargada de descargar el codigo fuente de las distintas
  librerias y componentes desde su pagina web correspondiente y parchearlo si
  hiciera falta. En el caso de las herramientas externas independientes de la
  plataforma destino para la que se vaya a compilar el sistema (como es el
  generador de particiones FAT32 *genfatfs*) tambien se produce la compilación
  en esta etapa, ya que a priori solo deberia ejecutarse una vez.
* *build*, construcción del modulo para la plataforma deseada. En npm 3 estara
  considerado una etapa de primer nivel, pero en npm 2 es preciso invocarlo
  explicitamente desde la etapa *install* mediante ```npm run build```.
* *postinstall*, tareas a ejecutar una vez se ha construido el modulo, como por
  ejemplo tests o tareas de limpieza.

Se ha estudiado la posibilidad de usar para el proceso de generacion
[node-gyp](), el cual es el metodo oficial para generar modulos compilados. Esto
requiere el generar scripts de configuracion de [GYP](), gestor de compilacion
desarrollado por Google para el motor Javascript [v8]() y por extension usado
por Node.js. Sin embargo, GYP requiere del uso de un interprete Python 2.7
(version ya obsoleta) y ademas Google esta deprecando internamente el uso de GYP
en beneficio de [gn](). Por este motivo se estan estudiando dentro de la
comunidad de Node.js distintas alternativas (reimplementar GYP en Javascript,
utilizar makefiles, crear un nuevo gestor de configuracion en C...) sin que haya
surgido todavia una opcion adecuada, por lo que se ha decidido continuar con el
uso de scripts propios hasta que se acuerde una solucion al respecto.

Adicionalmente, entre los etapas utilizadas tambien podemos encontrar:

* *start*, ejecución de la capa actual y todas las anteriores dentro de una
  maquina virtual (por defecto QEmu).
* *test*, comprobación basica del funcionamiento del modulo.
* *unbuild*, eliminación de los archivos generados por el modulo. Debe ser
  invocado explicitamente mediante ```npm run unbuild```.

Por otra parte, la mayoria de scripts estan escritos en bash, aunque se estan
portando a Javascript para facilitar el que mas adelante el sistema pueda ser
autocontenido (generable dentro de otra instancia de NodeOS). Los principales
problemas en esta transicion corresponden a la fase de descarga de los distintos
codigos fuente, para lo cual he abierto varios issues relativos al soporte
correcto de la extraccion de archivos de gran tamaño en el proyecto de los
modulos [download](https://github.com/kevva/download/issues?q=author%3Apiranna)
y [decompress](https://github.com/kevva/decompress/issues?q=author%3Apiranna).
El resto de etapas consisten principalmente en la ejecucion de otros comandos
externos como las herramientas de configuracion como GYP o el compilador, por lo
que previamente es necesario buscar alternativas a ellos escritas en Javascript.
