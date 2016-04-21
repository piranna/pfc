#### node-canvas

La forma mas sencilla de poder mostrar gráficos en la consola de Linux es
utilizando el [dispositivo de framebuffer](https://es.wikipedia.org/wiki/Fbdev),
el cual proporciona acceso directo a la región de memoria correspondiente a la
pantalla para poder modificarla. En un principio se pensó en crear un módulo de
Node.js para que el usuario pudiera controlar dicho dispositivo fácilmente, sin
tener que usar directamente la interfaz proporcionada por el kernel de Linux,
implementando todas las llamadas al sistema correspondientes como funciones,
pero mas tarde se decidió usar en su lugar el módulo
[node-canvas](https://github.com/Automattic/node-canvas), el cual proporciona
una implementación de la API de
[Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) de HTML, y
que además es el módulo estándar *de-facto* para renderizar imágenes en Node.js
en el servidor, ofreciendo por tanto compatibilidad con aplicaciones existentes
para Node.js que usen dicho módulo, como con las aplicaciones web que hagan uso
de la API de *Canvas*, principalmente juegos y animaciones. Dicho módulo es en
sí un wrapper en torno a la librería gráfica [Cairo](http://cairographics.org),
la cual proporciona un framework multiplataforma para el dibujado de gráficos
vectoriales, y que es usada por múltiples proyectos de Software Libre, entre
ellos la librería de componentes gráficos [GTK](http://www.gtk.org), usada por
[Gnome](https://www.gnome.org) y [XFCE](http://www.xfce.org), dos de los
entornos de escritorio mas populares en Linux.

Debido al diseño de NodeOS donde no hay componentes o librerías globales comunes
para todos los usuarios, para poder usar *node-canvas* se ha tenido en primer
lugar que añadir soporte para poder compilarlo como una librería dinámica
linkeada estáticamente. De esta forma, todas sus dependencias (`Cairo`,
`FreeType`, `giflib`, `libjpeg-turbo`, `libpng`, `pixman` y `zlib`) están
incluidas dentro del propio módulo una vez generado sin tener dependencias de
ninguna librería externa (lo cual es la forma recomendada de desarrollar módulos
[compilados en Node.js](https://n8.io/converting-a-c-library-to-gyp) por razones
de portabilidad), en lugar del método actual por el que se están utilizando las
librerías globales del sistema. Ya había habido algunos intentos anteriores para
[añadir esta funcionalidad](https://github.com/magicode/node-canvas), aunque
dichos cambios nunca llegaron a integrarse en el código principal. Sin embargo,
se decidió usarlos como base debido a la calidad de su código, el cual separaba
el script de generación del módulo según fuese a utilizarse el linkado estático
o por el contrario fuesen a emplearse las librerías dinámicas instaladas
globalmente en el sistema.

El otro elemento fundamental para poder usar *node-canvas* para mostrar los
gráficos en la pantalla es el propio soporte de framebuffer como destino para
las operaciones de dibujado. Cairo tiene soporte nativo para el mismo, con lo
que sólo es cuestión de configurar *node-canvas* de forma que pueda utilizarlo.
Para ello se ha basado en el código previo realizado por
[Rene Hollander](https://github.com/ReneHollander/node-canvas), el cual a raíz
del [issue](https://github.com/Automattic/node-canvas/issues/533) que se abrió
en el repositorio de *node-canvas* solicitando el soporte para el framebuffer de
Linux hizo una prueba de concepto para añadirlo, y además ha implementado un
sistema por el cual el usuario puede configurar fácilmente que sistema gráfico
quiere utilizar (imagen, framebuffer, EGL, X11, Wayland, Quartz, GDI, SVG,
PDF...) aparte de poder configurar en tiempo de compilación cuales de los
sistemas gráficos nativos posteriormente estarán disponibles en el módulo.

Al estar ambas funcionalidades actualmente en desarrollo y sin integrar en el
repositorio principal, se han [combinado](https://github.com/NodeOS/node-canvas)
en un repositorio propio. A pesar de haberse hecho la mezcla de ambos forks sin
conflictos, al hacerlo se han encontrado
[diversos problemas](https://github.com/Automattic/node-canvas/issues/551),
algunos debidos a la forma tan poco común en la que es compilado el módulo
(librería dinámica linkada estáticamente y usando `musl` como librería estándar)
y debido a esto mismo también se han encontrado algunos bugs que permanecían
ocultos en entornos de desarrollo mas comunes:

* El primero de ellos fue el hecho de que no se estaba forzando que el linkado
  fuese estático mediante el flag `-static`, por lo que aunque se estuviesen
  descargando y compilando las dependencias del módulo como librerías estáticas,
  éstas sólo se usarían en caso de que no se encontrase su versión dinámica
  entre las librerías globales del sistema, lo cual podría dar problemas con el
  *cross-compiler* de NodeOS. Sin embargo, al añadir dicho flag obtuve algunos
  errores relativos a que el objeto `crtBeginT.o` debe de ser compilado como
  [Código Independiente de la Posición](https://en.wikipedia.org/wiki/Position-independent_code)
  (*PIC*), ya que estamos haciendo una librería dinámica. Esto es debido a un
  [bug en gcc sin resolver](https://bugzilla.redhat.com/show_bug.cgi?id=214465#c1)
  puesto que sus desarrolladores no quieren que se usen simultáneamente los
  flags `-shared` (para crear una librería dinámica) y `-static` (para forzar a
  que se linkeen estáticamente todas sus dependencias) promoviendo que se usen
  en su lugar librerías dinámicas en todos los casos, a pesar de haber casos de
  uso válidos como son la creación de plugins y/o módulos compilados de Node.js
  (como es este mismo caso). La solución empleada en un principio fue
  [reemplazar](https://bugs.launchpad.net/ubuntu/+source/gcc-4.4/+bug/640734/comments/6)
  dicho archivo por el contenido de `crtBeginS.o`, el cual esta orientado a su
  uso en librerías dinámicas, y por tanto compilado usando el necesario flag
  `-fPIC`. Esto es así al parecer porque el uso de *Código Independiente de
  Posición* añade una pequeña penalización en el rendimiento y por tanto se
  tienen dos versiones especializadas de dicho archivo, Este problema no afecta
  a otros compiladores como [LLVM](http://llvm.org) ya que sólo utilizan una
  única versión del archivo. Sin embargo, esto tiene el problema de que dicha
  sustitución tendría que hacerse en todos los sistemas para los que se vaya a
  compilar el módulo y no sólamente cuando sea NodeOS el objetivo, por lo que se
  ha optado por una solución menos invasiva consistente en indicar en el archivo
  de configuración de *node-gyp* (`binding.gyp`) de forma explicita la ubicación
  de todas las librerías estáticas contra las que debe ser linkado (que
  corresponden a las dependencias que hemos bajado y compilado previamente), de
  forma que ya no sea necesario hacer uso del flag `-static`, y evitando también
  los problemas asociados a su uso con `gcc` indicados antes. Una vez hecho este
  cambio, el módulo pudo compilarse sin problemas bajo Ubuntu usando `glibc`
  como librería estándar y ejecutarse los tests correctamente. No obstante, los
  ejemplos relativos al uso del framebuffer no mostraban nada en pantalla, lo
  que luego resulto ser debido al hecho de que equipo usado durante las pruebas
  (un portátil MacBook Pro) incorpora una tarjeta gráfica híbrida (una Intel en
  fb0 y una NVidia en fb1), estando activada por defecto la secundaria. Una vez
  modificado el módulo para poder configurar desde Javascript el dispositivo de
  [framebuffer a usar](https://github.com/ReneHollander/node-canvas/issues/2),
  dichos ejemplos ya pudieron ejecutarse nativamente en mi equipo:
  ![node-canvas compilado estáticamente funcionando de forma nativa en el framebuffer de Linux. Se ven las rayas superiores en vez de un cuadrado verde debido a un error en el cálculo de la longitud del número de bytes entre lineas, que identifiqué posteriormente y que fue corregido por Rene Hollander](img/node-canvas compilado estáticamente funcionando de forma nativa en el framebuffer de Linux.jpg)
* Después, al intentar compilar el módulo con el *cross-compiler* de NodeOS,
  este notificó que no podía encontrar el archivo `zlib.h` y algunos otros
  archivos de cabecera, lo cual se solucionó incluyendo los directorios
  faltantes desde las librerías descargadas. Algo similar ocurrió con el archivo
  `fontconfig/fontconfig.h`, perteneciente a una dependencia no documentada
  sobre [FontConfig](http://www.freedesktop.org/wiki/Software/fontconfig),
  librería usada en varios sistemas UNIX para la gestión de fuentes tipográficas
  y habitualmente disponible en cualquier distribución de Linux estándar. Dicho
  archivo sólo contiene algunas constantes y estructuras de datos, por lo que
  este problema se he solucionado descargando dicho archivo desde su
  [repositorio](http://cgit.freedesktop.org/fontconfig/plain/fontconfig/fontconfig.h)
  del mismo modo que el resto de librerías, y configurando el script de
  compilación para que sea usado en caso de estar generando un módulo linkado
  estáticamente o en un sistema que no tenga las librerías necesarias instaladas
  globalmente, como es el caso de NodeOS.
* Una vez que se conseguió que se pudiera compilar el módulo con el
  *cross-compiler* de NodeOS, al probarlo se obtuvo un error relativo a que no
  se podía encontrar la función `jinit_arith_decode`, perteneciente a
  *libjpeg-turbo*, una de las dependencias de *node-canvas*, a pesar de que la
  compilación no dio ningún fallo. Después de
  [preguntar](http://www.openwall.com/lists/musl/2015/06/26/1)
  en la lista de correo de `musl` (al ser la única diferencia con respecto a la
  compilación nativa en Ubuntu usando `glibc`) y también de hacer varias pruebas
  usando [nm](https://sourceware.org/binutils/docs-2.23/binutils/nm.html) para
  inspeccionar la lista de símbolos exportados por las librerías y deshabilitar
  algunas funcionalidades, se conseguió gracias a la ayuda en especial de
  [siblynx](https://github.com/siblynx) y [Szabolcs Nagy](mailto:nsz@port70.net)
  llegar a la conclusión de que el problema era que
  [no se estaban compilando](http://www.openwall.com/lists/musl/2015/06/28/8)
  los archivos que proporcionan algunas de las funciones que son requeridas por
  *Cairo* (entre ellas la anteriormente citada `jinit_arith_decode`), bien
  porque dichos archivos estaban comentados en la configuración de `gyp` o
  directamente no estaban incluidos en estos, unido al hecho que por defecto el
  [compilador gcc no notifica](http://www.openwall.com/lists/musl/2015/06/27/1)
  errores sobre símbolos sin resolver al generar librerías dinámicas, ya que
  estos pueden ser resueltos posteriormente al ser cargados si en dicho momento
  están definidos[^1]. Para forzar a que notificara dichos errores para poder
  buscar posteriormente los archivos donde están definidos e incluirlos en el
  proceso de compilación de GYP se ha usado el flag
  [--no-undefined](https://blog.flameeyes.eu/2010/09/your-worst-enemy-undefined-symbols),
  lo cual ha permitido comprobar que dicho problema también se estaba
  produciendo al ser compilado con `glibc`, solo que no se estaba manifestando
  ya que por diseño `glibc` realiza la búsqueda y linkado de los símbolos en el
  momento de ser utilizados (*lazy loading*) a diferencia de `musl` que lo hace
  en el momento de ser cargada la librería (generalmente en el arranque del
  programa, o en el caso de los módulos compilados de Node.js, al ser importados
  al llamar a la función `require()`). Esto también sirvió para descubrir un
  error relativo a un conflicto entre versiones de Node.js al compilar módulos
  binarios usando el *cross-compiler*, ya que estaban usando las cabeceras de
  desarrollo de la versión de Node.js instalada en el sistema en vez de las
  correspondientes a la usada para la generación de NodeOS, y por tanto también
  aparecían como no definidas algunas funciones y métodos de Node.js y v8 que
  deberían haberse resuelto al cargar el módulo.
* Por último y relacionado con el punto anterior, el mecanismo de selección de
  sistemas gráficos tenía un fallo por el cual no estaba definido un método
  destructor en la clase base abstracta de la cual heredan cada uno de ellos.
  Esto en situaciones normales no causaría problemas debido al *lazy loading* (o
  a lo sumo se generaría un core dump cuyos efectos quedarían ocultos al
  producirse generalmente durante el cierre normal de la aplicación), pero al
  haberse compilado en NodeOS usando `musl`, la ausencia de dicho destructor
  virtual se mostró justo en el momento de cargar el módulo. Al implementar un
  método vacío para solucionar dicho problema, se decidió también reubicar otros
  métodos que estaban definidos en el archivo de cabecera en un archivo propio
  para ahorrar memoria y organizar mejor el código, momento en que se encontró
  casualmente otro bug oculto relativo a la definición del tamaño del
  framebuffer que había estado dando algunos problemas a otros
  [usuarios](https://github.com/ReneHollander/node-canvas/issues/1).

Una vez solucionados todos estos problemas, finalmente se pudo utilizar el
módulo para desde NodeOS
[acceder](https://github.com/NodeOS/NodeOS/issues/39#issuecomment-116304688) al
dispositivo de framebuffer y poder modificar su contenido:

![Primera prueba de node-canvas en NodeOS](img/Primera prueba de node-canvas en NodeOS.png)

En la figura puede verse el resultado de dibujar un cuadrado de color verde en
el dispositivo framebuffer de QEmu usando *node-canvas*. El hecho que se vean 3
cuadrados grisáceos es debido a que la tarjeta gráfica que emula QEmu por
defecto (Cirrus Logic 54xx) utiliza 24 bits para mostrar colores reales (RGB, 8
bits x 3) a diferencia de todas las tarjetas gráficas actuales como la que
incorpora el equipo usado durante las pruebas (NVidia GeForce GT 330M), las
cuales usan 32 bits (RGB + alpha).
[Cairo no tiene soporte para color de 24 bits real](http://cairographics.org/manual/cairo-Image-Surfaces.html),
usando en su lugar 32 bits e ignorando el canal alpha, motivo por el que al
dibujar directamente en el dispositivo de framebuffer y no coincidir sus modos
de almacenamiento de los pixels (3 bytes en framebuffer vs. 4 bytes en Cairo)
se da una mala alineación y un desplazamiento de estos que produce un patrón de
colores que les da un aspecto grisáceo. Relacionado con este hecho, se da la
situación de que no coincide el desplazamiento entre lineas
([stride](http://cairographics.org/manual/cairo-Image-Surfaces.html#cairo-format-stride-for-width)).
En condiciones normales este corresponde a la
[longitud de cada linea](http://lxr.free-electrons.com/source/include/uapi/linux/fb.h#L167)
en el framebuffer, la cual es fija independientemente de la resolución empleada,
pero ésta da un valor incorrecto para Cairo cuando se usa bajo QEmu en 24 bits,
lo cual provoca que aparezca la imagen triplicada y con lineas en blanco (1024 x
4 bytes = 4096 bytes, cuando la longitud de cada linea es de 1024 x 3 bytes =
3072 bytes, con lo que los píxeles quedan alineados en pantalla cada 4 lineas
del framebuffer, o 12288 bytes):

![node-canvas en QEmu ampliado 20 veces. Se puede observar el patrón de colores y las lineas en blanco producidas por la desalineación entre los formatos de Cairo y del dispositivo de framebuffer](img/node-canvas en QEmu ampliado 20 veces.png)

La solución para ambos problemas ha pasado por hacer uso de la tarjeta gráfica
[stdvga](https://www.kraxel.org/blog/2014/10/qemu-using-cirrus-considered-harmful)
(QEmu ofrece por defecto la tarjeta gráfica Cirrus por retrocompatibilidad) la
cual ofrece un comportamiento acorde a las tarjetas gráficas reales actuales
como es el uso de color real en 32 bits o resoluciones en formato panorámico.
También para evitar problemas posteriores se ha hecho que el backend sólo admita
profundidades de color de 16 y 32 bits empaquetados en formato 565 y ARGB puesto
que son los únicos que comparten nativamente tanto Cairo como el dispositivo de
framebuffer, lanzando una excepción si se intenta usar cualquier otro modo. No
obstante, sería posible el utilizar también el formato RGB de 24 bits utilizando
dos buffers independientes y convirtiendo la información de color entre ellos,
pero esto provocaría una perdida de rendimiento debido a que Cairo no ofrece
ningún medio de notificar cuando los datos en una superficie se han actualizado,
por lo que la única manera posible de tener ambos buffers sincronizados es
copiando los datos a intervalos regulares mediante el uso de timers.

![node-canvas funcionando correctamente en NodeOS bajo QEmu](img/node-canvas funcionando correctamente en NodeOS bajo QEmu.png)

El último problema encontrado durante la portabilidad de *node-canvas* a NodeOS
ha venido dado por el uso de Cairo de los tipos de datos `__uint128_t` y
`__int128_t`, los cuales son extensiones ofrecidas por `gcc` y que sólo están
disponibles para sistemas de 64 bits, por lo que no ha sido posible compilar el
módulo para la versión de 32 bits de NodeOS. Se ha notificado del problema en el
[bugtracker](https://bugs.freedesktop.org/show_bug.cgi?id=91473) de Cairo.

No obstante, también se ha aprovechado para hacer algunas mejoras en el código.
La primera de ellas ha sido separar el directorio de descarga de las librerías
externas, ya que estas se estaban guardando en el mismo directorio donde estaban
definidos sus scripts de compilación y sus configuraciones, haciendo difícil el
poder limpiar el espacio de trabajo. Además, se estaban usando los números de
versión de las librerías en las propias rutas donde se estaban descargando, por
lo que también se ha hecho este proceso genérico para que sean mas fáciles de
actualizar al estar definidos los números de versión en un único lugar. Una vez
hecho esto, se modifiquó el script de instalación de las dependencias eliminando
código duplicado e integrándolo dentro de funciones reusables y con mejor
gestión de errores, de forma que fuese mas fácil de mantener en el futuro.
Además, ahora se descomprimen los archivos en su ubicación final a medida que se
descargan los tarballs sin necesidad de guardarlos previamente en el disco duro,
de forma que el proceso es más rápido y consume menos recursos. Una vez
realizados todos estos cambios y mejoras se abrió un pull-request en el proyecto
[solicitando](https://github.com/Automattic/node-canvas/pull/571) que sean
incorporados al repositorio principal, el cual esta actualmente pendiente de
aprobación.

Durante la realización de todos estos cambios, también se ha caído en la cuenta
de que muchos de estos problemas se podrían solucionar mediante una generación
mas modular, aparte de que se reducirían los tiempos de compilación y la memoria
y ancho de banda consumidos, por lo que he propuesto el que los módulos
compilados puedan
[indicar sus dependencias](https://github.com/joyent/node/issues/25627), de tal
forma que no tengan que estar instaladas globalmente en el sistema o compiladas
estáticamente dentro del propio módulo sino en otros módulos reutilizables. Esto
se basaría en el hecho de que los símbolos no definidos en una librería dinámica
son resueltos al ser cargados y además que todos coexisten después en el mismo
espacio de memoria, por lo que sería factible el cargar los módulos de las
dependencias antes que el propio módulo, de tal forma que puedan estar
disponibles todos sus símbolos en memoria y funcionar correctamente.


[^1]: La única razón por la que dichos errores no se detectaron antes al ejecutar los tests sólo es posible porque estos no sean lo suficientemente exhaustivos, por lo que también se ha abierto un [issue](https://github.com/Automattic/node-canvas/issues/577) en el proyecto notificándolo y solicitando que se compruebe cual es el porcentaje de cobertura de dichos tests para evitar problemas similares en el futuro.
