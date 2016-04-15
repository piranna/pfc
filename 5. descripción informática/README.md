# Descripción informática

1. [Especificación](1. Especificación.html)
  1. [Diseño minimalista](1. Especificación.html#diseño-minimalista)
  2. [Sistema de archivos raíz único para cada usuario](1. Especificación.html#sistema-de-archivos-raíz-único-para-cada-usuario)
  3. [Usuarios sin privilegios](1. Especificación.html#usuarios-sin-privilegios)
  4. [Simplicidad de uso](1. Especificación.html#simplicidad-de-uso)
  5. [Interfaz gráfica basada en HTML5](1. Especificación.html#interfaz-gráfica-basada-en-html5)
2. [Diseño](2. Diseño.html)
  1. [División en capas](2. Diseño.html#división-en-capas)
  2. [Módulos](2. Diseño.html#Módulos)
  3. [Sistema de archivos raíz único para cada usuario](2. Diseño.html#sistema-de-archivos-raíz-único-para-cada-usuario)
  4. [Interfaz gráfica basada en HTML5](2. Diseño.html#interfaz-gráfica-basada-en-html5)
3. [Implementación](3. Implementación/index.html)
  1. [cross-toolchain](3. Implementación/1. cross-toolchain.html)
    1. [gcc](3. Implementación/1. cross-toolchain.html#gcc)
    2. [Descarga de dependencias](3. Implementación/1. cross-toolchain.html#descarga-de-dependencias)
  2. [barebones](3. Implementación/2. barebones.html)
    1. [Node.js](3. Implementación/2. barebones.html#node.js)
    2. [Linux](3. Implementación/2. barebones.html#linux)
    3. [Comprobaciones finales](3. Implementación/2. barebones.html#comprobaciones-finales)
    4. [Problemas encontrados](3. Implementación/2. barebones.html#problemas-encontrados)
  3. [initramfs](3. Implementación/3. initramfs.html)
  4. [rootfs](3. Implementación/4. rootfs.html)
    1. [Generación del sistema raíz](3. Implementación/4. rootfs.html#generación-del-sistema-raíz)
  5. [usersfs](3. Implementación/5. usersfs.html)
    1. [root](3. Implementación/5. usersfs.html#root)
    2. [nodeos](3. Implementación/5. usersfs.html#nodeos)
  6. [NodeOS](3. Implementación/6. NodeOS.html)
  7. [Módulos propios](3. Implementación/7. módulos propios/index.html)
    1. [coreutils.js](3. Implementación/7. módulos propios/coreutils.js.html)
    2. [Davius](3. Implementación/7. módulos propios/Davius.md)
    3. [DebugFS](3. Implementación/7. módulos propios/DebugFS.html)
    4. [download-checksum](3. Implementación/7. módulos propios/download-checksum.html)
    5. [download-manager](3. Implementación/7. módulos propios/download-manager.html)
    6. [ExclFS](3. Implementación/7. módulos propios/ExclFS.html)
    7. [logon](3. Implementación/7. módulos propios/logon.html)
    8. [nodeos-console-font](3. Implementación/7. módulos propios/nodeos-console-font.html)
    9. [nodeos-init](3. Implementación/7. modulos propios/nodeos-init.html)
    10. [nodeos-media](3. Implementación/7. módulos propios/nodeos-media.html)
    11. [nodeos-mount-filesystems](3. Implementación/7. módulos propios/nodeos-mount-filesystems.html)
      1. [Proceso de montaje de los sistemas de archivos](3. Implementación/7. módulos propios/nodeos-mount-filesystems.html#proceso-de-montaje-de-los-sistemas-de-archivos)
      2. [Sistema de archivos raíz de cada usuario](3. Implementación/7. módulos propios/nodeos-mount-filesystems.html#sistema-de-archivos-raíz-de-cada-usuario)
      3. [Sistema de archivos raíz del usuario *root*](3. Implementación/7. módulos propios/nodeos-mount-filesystems.html#sistema-de-archivos-raíz-del-usuario-root)
      4. [Sistema de archivos raíz real](3. Implementación/7. módulos propios/nodeos-mount-filesystems.html#sistema-de-archivos-raíz-real)
    12. [nodeos-mount-utils](3. Implementación/7. módulos propios/nodeos-mount-utils.html)
    13. [usrbinenv](3. Implementación/7. módulos propios/usrbinenv.html)
      1. [Ejecución de scripts de Node.js](3. Implementación/7. módulos propios/usrbinenv.html#ejecución-de-scripts-de-node.js)
      2. [Ejecución de binarios externos](3. Implementación/7. módulos propios/usrbinenv.html#ejecución-de-binarios-externos)
      3. [Ubicación del comando](3. Implementación/7. módulos propios/usrbinenv.html#ubicación-del-comando)


La metodología que se sigue por diseño en el desarrollo de NodeOS consiste en la
[reutilización de requisitos](http://www.ecured.cu/index.php/Reutilización_de_requisitos)
en sus dos vertientes de *desarrollo con reutilización* al tratar de usar en
todo lo posible módulos ya existentes desarrollados por la comunidad, como en la
de *desarrollo para la reutilización* al desarrollar módulos con un enfoque de
uso genérico cuando no existe ninguno disponible. Esto además es acorde a las
buenas prácticas que promueve la comunidad de Node.js, sobre todo influidas por
la [filosofía UNIX](https://en.wikipedia.org/wiki/Unix_philosophy) y el uso del
gestor de paquetes `npm` (hasta el punto de que algunos solo contienen una única
función de unas pocas lineas encargada de realizar una tarea concreta), y
basadas fuertemente en la reutilización y combinación de módulos, donde lo
habitual es que cada proyecto se subdivida en una serie de proyectos
independientes y con entidad propia que después serán unidos en un proyecto que
englobe y une a todas las partes, como muestra el propio diseño por capas de
NodeOS que permite desarrollar fácilmente otros sistemas operativos a partir del
mismo[^1].

La política de distribución de nuevas versiones corresponde a la de una Rolling
Release, en la que se publica automáticamente una nueva versión cada vez que se
sube nuevo código al repositorio en el caso de que el servidor de integración
continua haya pasado satisfactoriamente todos los tests y haya podido generar
las imágenes del sistema sin problemas, publicando dichas imágenes pre-generadas
listas para su descarga en GitHub. No obstante, dichas versiones se marcan como
*pre-release* a pesar de ser totalmente operativas, marcando explícitamente como
*release* solamente las versiones que hayan cumplido un conjunto de objetivos
definidos previamente para la misma, como es el caso de la versión *1.0-RC1*.

El enfoque adoptado para el desarrollo del sistema ha sido el de un *desarrollo
evolutivo* mediante una serie de prototipos, común a la mayoría de proyectos de
Software Libre que están alojados en GitHub, los cuales suelen seguir un flujo
de trabajo desestructurado y "orgánico" que de forma implícita siguen una
metodología de trabajo en algunos conceptos equiparable al
[eXtreme Programming](https://es.wikipedia.org/wiki/Programación_extrema). Esto
se manifiesta especialmente en los proyectos relacionados con Node.js debido a
su herencia del ecosistema de desarrollo web, donde es habitual el necesitar
adaptarse a tecnologías en continua evolución y en algunos casos incompletas o
con una implementación no estandar o defectuosa, a diferencia de otros entornos
y lenguajes como Java o C++ donde culturalmente predominan ciclos de desarrollo
mas largos, debido en parte a que tradicionalmente se han usado en proyectos de
gran tamaño pero también por estar basados en entornos, librerías y tecnologías
mas estables. Esto hace que se vea como algo normal que se libere el código
fuente de los proyectos de Node.js desde el primer momento a pesar de estar
incompletos o con fallos, siguiendo el lema
[publica pronto, publica a menudo](https://es.wikipedia.org/wiki/Release_early,_release_often)
propio de la [cultura hacker](https://es.wikipedia.org/wiki/Ética_hacker) y
habitual en algunos de los proyectos y colectivos mas importantes del Software
Libre y la [cultura abierta](https://es.wikipedia.org/wiki/Cultura_libre), e
incluso el lanzamiento de nuevas versiones y actualizaciones varias veces al día
solventando el problema de la retrocompatibilidad y la inestabilidad que genera
un entorno tan dinámico mediante iniciativas como son el uso del
[versionado semántico](http://semver.org/lang/es).

Sin embargo, mas allá de aspectos ideológicos o de seguir una metodología de
trabajo afín a la usada normalmente dentro de la comunidad de Node.js que pueda
facilitar la colaboración por parte de terceras personas al proyecto, otro hecho
importante que ha influido en la adopción de una metodología de desarrollo
evolutivo han sido el carácter experimental del proyecto tanto por su enfoque
como por la implementación de nuevos conceptos (como el login descentralizado o
el sistema de archivos raíz único para cada usuario), que han provocado algunas
incertidumbres sobre como llevarlas a cabo o sobre su efectividad posterior en
la práctica, lo cual no permitía utilizar otras metodologías de desarrollo mas
tradicionales y estructuradas.

[^1]: En muchos casos este proyecto de "unión" a su vez separa el ejecutable de [línea de comandos](https://docs.npmjs.com/files/package.json#bin) (*CLI*) del núcleo de la aplicación reduciendo su tarea a simplemente interpretar los parámetros con los que ha sido invocado y pasarlos a su *núcleo*, de esta forma la propia aplicación también es usable por terceras partes como un módulo en si mismo. Sin embargo, el método que se esta recomendando en la comunidad de Node.js es separar el propio ejecutable a un módulo independiente para evitar la inclusión de dependencias por otra parte inútiles cuando es usada como librería. Esta división *ejecutable-librería* llega en algunos casos extremos como en el de [Grunt](http://gruntjs.com) o [GitBook](https://www.gitbook.com) a que el ejecutable sea un proyecto independiente que se instala de forma global y que se aísla por completo de la versión de la librería que sea usada por cada proyecto internamente, permitiendo que cada uno de ellos utilice una versión distinta sin afectar al resto.
