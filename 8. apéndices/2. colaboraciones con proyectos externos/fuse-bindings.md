#### fuse-bindings

[FUSE](http://fuse.sourceforge.net), el mecanismo por el que se pueden
implementar sistemas de archivos fuera del kernel de Linux, requiere del uso de
una libreria (`libfuse`) que haga de puente entre el kernel y el espacio de
usuario. Existen varios bindings para Node.js, siendo el que actualmente recibe
mas soporte [fuse-bindings](https://github.com/mafintosh/fuse-bindings). Sin
embargo, dicho binding hace uso de la libreria dinamica incluida en el sistema,
y debido al enfoque minimalista que tiene NodeOS donde el sistema base solamente
contiene los componentes fundamentales para su funcionamiento y a que por
[cuestiones de portabilidad](https://n8.io/converting-a-c-library-to-gyp)) la
forma recomendada de construir módulos en Node.js es sin usar librerias
dinamicas, decidi añadirle soporte para generar una version que incluyese
`libfuse` compilado estaticamente de forma similar a como he hecho con la
libreria [Cairo](http://cairographics.org) en [node-canvas](4. node-canvas.html)
mediante la detección de si la libreria esta instalada globalmente, o caso de
que no sea asi, descargarla y compilarla como una dependencia interna suya.

El metodo de construcción de `libfuse` utiliza el sistema tradicional basado en
`./configure && make` en vez de usar GYP, por lo que para evitar tener que
generar un archivo de configuración GYP completo decidi hacer uso de la
instrucción [actions](http://stackoverflow.com/a/27301199/586382) de GYP por la
cual se pueden ejecutar comandos de shell en su lugar, y despues configuré
*fuse-bindings* para que lo linkee estaticamente. Las opciones de configuración
empleadas desactivan el uso del archivo `/etc/mtab` ya que no tiene sentido en
un sistema como NodeOS donde cada usuario tendria su propia copia (aunque una
alternativa valida y usada en algunos sistemas como *Ubuntu 15.10 'Wily
Werewolf'* es sustituirlo por un link simbolico a `/proc/mounts`, por lo que no
haria falta desactivarlo ya que FUSE detecta automaticamente dicho caso y no
trataria de actualizar el contenido del archivo), y tambien desactivan la
compilación de los ejemplos, los comandos de ayuda como `fusermount` y las
librerias dinamicas.

Una vez que `libfuse` se compila correctamente en mi sistema Ubuntu, procedi a
usarlo como dependencia de *fuse-bindings*, encontrandome sin embargo con dos
errores de linkado. El mensaje del primer error indicaba que `no se puede usar
la reubicación R_X86_64_32 contra '.text' cuando se hace un objeto compartido`,
para lo cual la solución consiste simplemente en compilar `libfuse` como
[Código Independiente de la Posicion](https://en.wikipedia.org/wiki/Position-independent_code)
(*PIC*), ya que en ultima instancia estamos haciendo una libreria dinamica. Una
vez arreglado este punto, el segundo mensaje de error indicaba que `no se
encuentra la versión del nodo para el símbolo 'fuse_setup@FUSE_2.2'`, lo cual es
debido a que la libreria `libfuse` incorpora soporte para varias versiones de su
API simultaneamente. Sin embargo, a pesar de haber buscado información al
respecto, no he sido capaz de encontrar información para hacer que use la
versión correcta. Al pensar que dicho error pueda estar relaccionado con el uso
explicito de *Código Independiente de la Posicion* para solucionar el error
anterior (ya que en *node-canvas* no fue necesario emplearlo), decido generar un
archivo de configuracion GYP completo exclusivo para `libfuse` del mismo modo
que se ha hecho en *node-canvas* para las dependencias estaticas y dejar que
todo el proceso de construccion este administrado por GYP. Sin embargo esto
tambien ha dado el mismo error de no poder encontrar la versión del nodo para el
símbolo `fuse_setup@FUSE_2.2`, por lo que finalmente he decidido usar `libfuse`
como libreria dinamica incluyendola dentro de
[initramfs](../../../5. descripción informática/3. Implementación/2. initramfs.html).
Esto va en contra de la regla de no incluir elementos indispensables para el
funcionamiento del sistema para mantenerlo lo mas reducido posible, pero por
otro lado tiene sentido hacerlo de esta manera ya que dicha libreria es
indispensable para poder hacer uso de FUSE, por lo que he hecho que esta solo se
compile y se incluya dentro de la imagen final de *initramfs* en el caso de que
se haya habilitado en el kernel observando si esta definida la opcion
`CONFIG_FUSE_FS` dentro del archivo `.config` del kernel de Linux. Esto tiene un
inconveniente y es que en caso de estar ausente impide que se compile
*fuse-bindings* y que pueda usarse cualquier sistema de archivos que haga uso de
el como es el caso de [ExclFS](../1. módulos propios/ExclFS.md), por lo que
tambien hago la comprobación posteriormente para que estos no se incluyan,
ademas de definir *ExclFS* como opcional en
[nodeos-mount-filesystems](../1. módulos propios/nodeos-mount-filesystems.html).
Esta es la mejor alternativa, ya que de esta forma se hace que el sistema sea
agnostico a cual es el binding de FUSE empleado por los módulos.

El uso de `libfuse` como libreria dinamica no ha estado libre de problemas, ya
que aunque su compilacion ha sido trivial, *fuse-bindings* la localiza mediante
el uso de [pkg-config](http://www.freedesktop.org/wiki/Software/pkg-config),
queriendo por tanto usar la libreria instalada en el sistema huesped en vez de
hacer uso del cross-compiler y dando un error de linkado de que no ha podido
encontrar la libreria al estar compiladas con distintas librerias del sistema
(`glibc` y `musl`). En principio se puede indicar a `gcc` mas ubicaciones donde
buscar las librerias mediante la variable de entorno `LIBRARY_PATH`, sin embargo
esto no ha dado resultado puesto que GYP usa un entorno aislado durante el
proceso de construccion, por lo que la unica solucion ha sido modificar el
archivo de configuración de *fuse-bindings* para que se pueda definir la
ubicación de las librerias mediante el uso de un
[parametro opcional](https://github.com/mafintosh/fuse-bindings/pull/12).
