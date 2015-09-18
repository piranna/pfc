#### fuse-bindings

[FUSE](http://fuse.sourceforge.net), el mecanismo por el que se pueden
implementar sistemas de archivos fuera del kernel de Linux, requiere del uso de
una libreria (`libfuse`) que haga de puente entre el kernel y el espacio de
usuario. Existen varios bindings para Node.js, siendo el que actualmente recibe
mas soporte [fuse-bindings](https://github.com/mafintosh/fuse-bindings). Sin
embargo, dicho binding hace uso de la libreria dinamica incluida en el sistema,
y debido al enfoque minimalista que le he dado a NodeOS donde el sistema base
contiene solamente los componentes fundamentales para su funcionamiento y a que
[por cuestiones de portabilidad](https://n8.io/converting-a-c-library-to-gyp))
la forma recomendada de construir módulos en Node.js es sin usar librerias
dinamicas, decidi añadirle soporte para generar una version que incluyese
*libfuse* compilado estaticamente de forma similar a como he hecho con la
libreria [Cairo](http://cairographics.org) en [node-canvas](4. node-canvas.html)
mediante la detección de si la libreria esta instalada globalmente y caso de que
no sea asi, descargarla y compilarla como una dependencia suya.

El metodo de construcción de `libfuse` utiliza el sistema tradicional basado en
`./configure && make` en vez de usar GYP, por lo que para evitar tener que
generar un archivo de configuracion GYP completo decidi emplear el comando
[actions](http://stackoverflow.com/a/27301199/586382) por el cual se pueden
ejecutar comandos de shell en su lugar, y despues configurar *fuse-bindings*
para que lo linkee estaticamente. Las opciones de configuración desactivan el
uso del archivo `/etc/mtab` ya que no tiene sentido en un sistema como NodeOS
donde cada usuario tendria su propia copia (aunque una alternativa valida y
usada en algunos sistemas como *Ubuntu 15.10 'Wily Werewolf'* es sustituirlo por
un link simbolico a `/proc/mounts`, por lo que no haria falta desactivarlo ya
que FUSE detectaria automaticamente dicho link simbolico y no trataria de
actualizar el contenido del archivo), y tambien desactivan la compilación de los
ejemplos, los comandos de ayuda como `fusermount` y las librerias dinamicas.

Una vez que `libfuse` se compila correctamente, procedi a usarlo como
dependencia de *fuse-bindings*, encontrandome sin embargo con dos errores de
linkado. El mensaje del primer error indicaba que "no se puede usar la
reubicación R_X86_64_32 contra '.text' cuando se hace un objeto compartido",
para lo cual la solución consiste simplemente en compilar `libfuse` como
[Código Independiente de la Posicion](https://en.wikipedia.org/wiki/Position-independent_code)
(*PIC*), ya que en ultima instancia estamos haciendo una libreria dinamica. Una
vez arreglado este punto, el segundo mensaje de error indicaba que "no se
encuentra la versión del nodo para el símbolo fuse_setup@FUSE_2.2", lo cual es
debido a que `libfuse` incorpora soporte para varias versiones de su API, sin
embargo a pesar de haber buscado información al respecto no he sido capaz de que
use la version correcta. Desconozco si este error esta relaccionado con el uso
de Código Independiente de la Posicion para solucionar el error anterior ya que
en *node-canvas* no ha sido necesario emplearlo, por lo que llegados a este
punto decidi generar un archivo de configuracion GYP completo exclusivo para
`libfuse` del mismo modo que *node-canvas* ha hecho con las dependencias
estaticas ya que se tendria mas posibilidades de exito al estar todo el proceso
de construcción administrado por GYP. Sin embargo esto tampoco ha funcionado
dando igualmente el error de que no encuentra la versión del nodo para el
símbolo fuse_setup@FUSE_2.2, por lo que la única alternativa disponible consiste
en incluir la libreria dinamica dentro del initramfs. Esto iria en contra de la
regla de no incluir elementos indispensables para el funcionamiento del sistema
para mantenerlo en un tamaño minimo, pero por otro lado tendria sentido ya que
`libfuse` es fundamental para poder hacer uso de FUSE en el kernel, por lo que
se podria hacer que se compilase e incluyese dentro de la imagen final de
initramfs solo en el caso de que FUSE se hubiese habilitado en el kernel.
