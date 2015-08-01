## Implementación

El proceso de construcción esta integrado en el ciclo de vida tipico del gestor
de paquetes npm, de forma que resulte familiar a los desarrolladores de Node.js.
El sistema esta organizado en capas, correspondiente cada una de ellas a un
modulo npm independiente siguiendo la filosofia de diseño modular que promueve
la comunidad de Node.js, y su division sigue el diseño de la organización
original del proyecto basada en la arquitectura de contenedores de Docker.
Dichas capas son:

* **barebones**, encargada de un arranque minimo del sistema
* **initramfs**, monta la particion con los directorios de los usuarios
* **rootfs**, genera una partición de arranque de solo-lectura con el contenido
  de las dos capas anteriores segun para que plataforma se este generando
* **usersfs**, ejemplo de partición con los directorios de los usuarios

Cada capa es autonoma en si misma pudiendo ejecutarse independientemente y se
apoya en las anteriores para ofrecer su funcionalidad. Por ejemplo, usando
*barebones* aisladamente arranca el sistema y ofrece acceso a un interprete REPL
de Node.js, similar al ofrecido por algunos microcomputadores de los años 80
como ZX Spectrum (aunque usandose Javascript en vez de BASIC como lenguaje).

### modulos

La estructura empleada en los modulos en los que se desglosa el sistema es la
misma para todos ellos, consistente en:

* un archivo ```package.json``` con la configuración del modulo y de los scripts
  a ejecutar en cada una de las etapas
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
para cada una de ellas, de forma que se pueda identificar inequivocamente la
operación que ha fallado.

En cuanto al ciclo de vida de los modulos, las distintas etapas a ejecutar son:

* *preinstall*, encargada de descargar el codigo fuente de las distintas
  librerias y componentes desde su pagina web correspondiente y parchearlo si
  hiciera falta. En el caso de las herramientas externas independientes de la
  plataforma para la que se vaya a compilar el sistema tambien se produce la
  compilación en esta etapa, ya que a priori solo deberia ejecutarse una vez.
* *install*, construcción del modulo para la plataforma deseada.
* *postinstall*, tareas a ejecutar una vez se ha construido el modulo, como
  tests o tareas de limpieza.

Adicionalmente, tambien podemos encontrar:

* *start*, ejecución de la capa actual y todas las anteriores dentro de una
  maquina virtual (por defecto QEmu).
* *test*, comprobación basica del funcionamiento del modulo.
* *uninstall*, eliminación de los archivos generados por el modulo.

Por otra parte, la mayoria de scripts estan escritos en bash, aunque se estan
portando a Javascript para facilitar la tarea de que mas adelante el sistema
pueda ser autocontenido (compilable dentro de si mismo). Una de las principales
razones por las que estoy teniendo problemas en esta transicion es en la fase de
descarga de los distintos codigos fuente, para lo cual he abierto varios issues
relativos al soporte correcto de la extraccion de archivos en el proyecto del
modulo [download](https://github.com/kevva/download/issues?q=author%3Apiranna) y
su dependencia [decompress](https://github.com/kevva/decompress/issues?q=author%3Apiranna).

Los modulos correspondientes a cada capa estan integrados dentro del codigo del
proyecto principal a pesar de estar diseñados como modulos independientes. Esto
es asi por dos razones:

1. la normativa del Concurso de Software Libre indica explicitamente que
   [solo se podra participar en un proyecto a la vez](http://www.concursosoftwarelibre.org/1415/bases),
   lo que implica que solo puede usarse un unico repositorio. Debido a la
   filosofia modular Node.js en condiciones normales se usaria un repositorio
   distinto para cada una de las capas provocando que solo se evaluase un
   repositorio "vacio" al estar toda la funcionalidad en otros proyectos
   externos, por lo que se decidio organizarlas como bundleDependencies hasta la
   finalizacion de dicho concurso.
2. npm en su estado actual tiene varias limitaciones que imposibilitan el poder
   instalar los modulos correspondientes a las distintas capas de forma
   independiente, como es la instalación de las dependencias sin un orden bien
   definido, diversos bugs en los que se instalan paquetes sin haberse instalado
   primero correctamente sus dependencias, o la instalación de dependencias en
   arbol, lo cual provocaria que se generara el cross-compiler varias veces sin
   ningun motivo.

No obstante, la intención es que finalmente las distintas capas del sistema
esten en distintos proyectos ahora que el concurso ha finalizado y que los
problemas relativos a npm se espera que esten arreglados cuando se libere npm 3,
el cual incorporara la instalación multi-etapa y usara una jerarquia plana por
defecto e incluso dividirlos para crear otros modulos nuevos, como el binario de
Node.js o kernel de Linux o incluso los usuarios de la particion de usersfs.
