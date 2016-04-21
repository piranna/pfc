#### fuse-bindings

[FUSE](http://fuse.sourceforge.net), el mecanismo por el que se pueden
implementar sistemas de archivos fuera del kernel de Linux, requiere del uso de
la librería `libfuse` para que haga de puente entre el kernel y el espacio de
usuario. Existen varios bindings para Node.js, siendo el que actualmente recibe
mas soporte [fuse-bindings](https://github.com/mafintosh/fuse-bindings). Sin
embargo, dicho binding hace uso de la librería dinámica incluida en el sistema,
y debido al enfoque minimalista que tiene NodeOS donde el sistema base sólamente
contiene los componentes fundamentales para su funcionamiento y a que por
[cuestiones de portabilidad](https://n8.io/converting-a-c-library-to-gyp)) la
forma recomendada de construir módulos en Node.js es sin usar librerías
dinámicas, decidí añadirle soporte para generar una versión que incluyese a
`libfuse` compilado estáticamente de forma similar a como se ha hecho con la
librería [Cairo](http://cairographics.org) en [node-canvas](4. node-canvas.html)
detectando si la librería esta instalada globalmente, o caso de que no sea así,
descargarla y compilarla como una dependencia interna suya.

##### Compilación estática de `libfuse`

El método de construcción de `libfuse` utiliza el sistema tradicional basado en
`./configure && make` en vez de usar `GYP`, por lo que para evitar tener que
generar un archivo de configuración GYP completo, decidí hacer uso de la
instrucción [actions](http://stackoverflow.com/a/27301199/586382) de `GYP` por
la cual se pueden ejecutar comandos de shell en su lugar, y después configuré
*fuse-bindings* para que haga el linkado estáticamente. Las opciones de
configuración empleadas desactivan la compilación de los ejemplos, los comandos
de ayuda como `fusermount` y la generación de las librerías dinámicas. También
desactivaban el uso del archivo `/etc/mtab` ya que no tiene sentido en un
sistema como NodeOS donde cada usuario tendría su propia copia, sin embargo en
algunos sistemas como *Ubuntu 15.10 'Wily Werewolf'* es sustituido por un link
simbólico a `/proc/mounts`, por lo que no hace falta desactivarlo ya que FUSE
detecta automáticamente dicho caso y no trata de actualizar el contenido del
archivo. Además, se ha comprobado que dicho archivo sólo contiene información
sobre los sistemas de archivos a los que el usuario tiene acceso dentro de su
jaula *chroot*, por lo que su uso no representa ningún problema de seguridad.

Una vez que conseguí que `libfuse` se compilara correctamente en un sistema
Ubuntu, se procedió a usarlo como dependencia de *fuse-bindings*, encontrándose
sin embargo con dos errores de linkado. El primer error indicaba que `no se
puede usar la reubicación R_X86_64_32 contra '.text' cuando se crea un objeto
compartido`, para lo cual la solución consiste simplemente en compilarlo como
[Código Independiente de la Posición](https://en.wikipedia.org/wiki/Position-independent_code)
(*PIC*), ya que en última instancia estamos haciendo una librería dinámica. Una
vez arreglado este punto, el segundo mensaje de error indicaba que `no se
encuentra la versión del nodo para el símbolo 'fuse_setup@FUSE_2.2'`, lo cual es
debido a que la librería `libfuse` incorpora soporte para varias versiones de su
API simultáneamente. Sin embargo, a pesar de haberse buscado información al
respecto, no se ha sido capaz de averiguar como hacer para que use la versión
correcta. Al pensarse que dicho error pueda estar relacionado con el uso
explicito de *Código Independiente de la Posición* para solucionar el error
anterior (ya que en *node-canvas* no fue necesario emplearlo), se decidio
generar un archivo de configuración GYP completo exclusivo para `libfuse`, del
mismo modo que se ha hecho en *node-canvas* para las dependencias estáticas y
dejar que todo el proceso de construcción esté administrado por `GYP`. Sin
embargo, esto también ha dado el mismo error anterior de no poder encontrar la
versión del nodo para el símbolo `fuse_setup@FUSE_2.2`, por lo que finalmente se
ha decidido usar `libfuse` como librería dinámica incluyéndola dentro del
[initramfs](../../../5. descripción informática/3. Implementación/2. initramfs.html).

##### Uso de `libfuse` como librería dinámica

La inclusión de `libfuse` dentro de *initramfs* va en contra de la regla de no
incluir elementos no indispensables para el funcionamiento del sistema para que
sea lo mas reducido posible, pero por otro lado tiene sentido hacerlo de esta
manera ya que dicha librería es necesaria para poder hacer uso de FUSE, por lo
que se ha hecho que ésta sólo se compile y se incluya dentro de la imagen final
de *initramfs* en el caso de que se haya habilitado su soporte en el kernel si
esta definida la opción `CONFIG_FUSE_FS` dentro del archivo `.config` del kernel
de Linux. Esto tiene un inconveniente, y es que en caso de estar ausente impide
que se compile *fuse-bindings* y que pueda usarse cualquier sistema de archivos
que haga uso de él como es el caso de
[ExclFS](../../5. descripción informática/3. Implementación/7. módulos propios/ExclFS.md),
por lo que también se hace la comprobación posteriormente para que éstos no se
incluyan, además de definir *ExclFS* como opcional en el módulo
[nodeos-mount-filesystems](../../5. descripción informática/3. Implementación/7. módulos propios/nodeos-mount-filesystems.html).
Esta es la mejor alternativa, ya que de esta forma se hace que el sistema sea
agnóstico a cual es el binding de FUSE empleado por los módulos.

El uso de `libfuse` como librería dinámica no ha estado libre de problemas, ya
que aunque su compilación ha sido trivial, *fuse-bindings* la localiza mediante
el uso de [pkg-config](http://www.freedesktop.org/wiki/Software/pkg-config),
queriendo por tanto usar la librería instalada en el sistema huésped en vez de
hacer uso del cross-compiler, y dando un error de linkado de que no ha podido
encontrar la librería al estar compiladas con distintas librerías del sistema
(`glibc` y `musl`). En principio se pueden indicar a `gcc` mas ubicaciones donde
buscar las librerías mediante la variable de entorno `LIBRARY_PATH`, sin embargo
esto no ha dado resultado puesto que `GYP` usa un entorno aislado del sistema
durante el proceso de construcción, por lo que la única solución ha sido
modificar el archivo de configuración de *fuse-bindings* para que se pueda
definir la ubicación de las librerías mediante el uso de un
[parámetro opcional](https://github.com/mafintosh/fuse-bindings/pull/12).
