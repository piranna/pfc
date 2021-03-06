#### ExclFS

Para permitir a los distintos usuarios el acceso a los dispositivos del sistema
sin requerir permisos de administrador o pertenecer a un grupo del sistema
determinado (`audio`, `video`, `disk`, `dialout`, `tty`...) se ha implementado
un [sistema de archivos](https://github.com/NodeOS/ExclFS) usando el módulo
[fuse-bindings](../2. colaboraciones con módulos externos/1. fuse-bindings.html)
que actúa como una capa sobre el sistema de archivos real (en este caso
*devtmpfs*), pero que ofrece acceso exclusivo a los archivos del mismo, por lo
que sólo permite el acceso a un único usuario cada vez. De esta forma, cuando un
usuario toma el control de un dispositivo del sistema ningún otro puede acceder
a dicho dispositivo y modificar su configuración o acceder a su información
hasta haber sido liberado. Esto hace que se pueda acceder a los dispositivos del
sistema de la forma habitual en UNIX, consistente en abrir su archivo descriptor
de dispositivo y leer o escribir directamente en él, sin necesidad de tener
permisos de administrador ni ocasionar riesgos de seguridad para los usuarios o
para el propio sistema, y permite al desarrollador que sea sencillo, por ejemplo,
el [poder usar varios ratones](https://github.com/NodeOS/NodeOS/issues/69) o
framebuffers en una misma aplicación ya que puede acceder directamente a dichos
dispositivos, o el que simultáneamente varios usuarios puedan acceder a ellos en
una misma máquina siempre que estén disponibles.

El control de acceso de los archivos (o dispositivos, en este caso) se realiza
mediante un mapa de las rutas de los archivos actualmente abiertos y el UID del
usuario. Este mapa se inicializa en el momento de abrir el archivo (`open`) y se
elimina su entrada en el mapa cuando este se ha liberado (`release`) en caso de
que el usuario no posea más descriptores de fichero abiertos para dicho archivo.
De este modo, para comprobar si es accesible basta con comprobar si su ruta no
está en dicho mapa (lo que significa que nadie lo está usando en ese momento),
o, en caso de estarlo, que esté siendo usado por el mismo usuario que está
tratando de acceder a él. Esta comprobación se realiza en dos puntos: a la hora
de acceder al archivo propiamente dicho (`access`) y al listar los archivos
dentro de un directorio (`readdir`), de forma que no se muestren los archivos
que actualmente están en uso por parte de otros usuarios (y, por tanto, no
accesibles por nosotros). Para los archivos que no estén siendo usados se pensó
en un principio en mostrar su UID y GID como `-1` puesto que es el estándar UNIX
para indicar que un usuario es
[desconocido](http://superuser.com/a/706343/369985), cambiándolo por los del
usuario actual cuando este fuese accedido, algo especialmente útil en el caso
del sistema de archivos *devtmpfs* para que el usuario pueda identificar qué
dispositivos están libres y cuáles está usando actualmente. Sin embargo, FUSE
realiza una llamada al método `getattr` antes de cada
[operación](http://sourceforge.net/p/fuse/wiki/FuseInvariants), entre otras
tareas, para gestionar los permisos de acceso, algo también posible con el
método `access` pero no hay apenas documentación al respecto, por lo que en su
lugar se decidió usar el `UID` del usuario que está tratando de obtener acceso
si ningún otro usuario está usando el archivo para facilitar esta tarea y que
pueda gestionarlo FUSE de forma automática.

Por último, los permisos de acceso usados como permisos del usuario son los
correspondientes al *grupo* del archivo, utilizando los correspondientes a
*otros* en el caso de que un archivo ya esté siendo accedido. Este esquema de
permisos teniendo en cuenta sólo al *propietario* y *otros* es similar al
original de UNIX y se adapta mejor a un sistema como NodeOS donde, por diseño,
cada usuario está aislado del resto y, por definición, no existe el concepto de
grupo. De este modo, se evita la posibilidad de acceder a los archivos cuyo
acceso está restringido a su verdadero propietario, que en el caso del sistema
de archivos *devtmpfs* es el usuario *root* y que generalmente corresponden a
descriptores de dispositivos que permiten un acceso directo a la memoria del
sistema y otros dispositivos que igualmente pueden plantear un serio problema de
seguridad. No obstante, también se puede definir manualmente un *whitelist* para
permitir el acceso a determinados archivos como son los descriptores de
dispositivo de los distintos buses [i2c](http://www.i2c-bus.org) disponibles en
el sistema, los cuales, al ser usados para configurar la memoria RAM o la
tarjeta gráfica (entre otra multitud de usos), sólo permiten su acceso por parte
del usuario *root*, pero suelen tener permisos de lectura en los mismos por
parte de los usuarios (por ejemplo, para leer la temperatura de la CPU), y en
muchos casos también lo es el permiso de escritura para poder acceder a un
puerto [GPIO](https://es.wikipedia.org/wiki/GPIO) si la máquina incluyese uno.

![ExclFS en ejecución. A la izquierda pueden comprobarse los permisos mostrados por ExclFS y a la derecha los que corresponden realmente a los distintos archivos. En el cuadro superior pueden comprobarse la ruta original de uno de los archivos con el usuario y los permisos modificados que luego se mostraran del mismo](img/ExclFS en ejecución.png)

Las operaciones de lectura y escritura no se realizan mediante los descriptores
de fichero del sistema de archivos subyacente, lo que introduce una penalización
en el rendimiento respecto al que podría obtenerse usando directamente el
sistema de archivos *devtmpfs* ofrecido por el kernel (o mediante el uso de
[udev](https://www.kernel.org/pub/linux/utils/kernel/hotplug/udev/udev.html), el
cual es usado habitualmente en sistemas Linux normales pero del que se desconoce
cómo es su implementación) debido a como funciona FUSE, ya que a pesar de que
[tecnológicamente](http://fuse.996288.n3.nabble.com/Passthrough-file-descriptor-patch-tp8002.html)
sería posible devolver dicho descriptor de ficheros en los sistemas de archivos
de tipo *overlay* (como es el caso) a las aplicaciones que han solicitado su
acceso sin comprometer la seguridad del sistema (para obtener dicho descriptor
de fichero se habrán tenido que hacer antes todas las comprobaciones pertinentes
por lo que es indiferente que sea el proceso que implementa el sistema de
archivos o el que ha solicitado acceso a su contenido el que lea o escriba en el
mismo), los desarrolladores de FUSE prefieren centrarse en aumentar el
rendimiento de otras operaciones genéricas que puedan repercutir en un aumento
del rendimiento generalizado para todos los sistemas de archivos basados en FUSE
antes que ampliar su API para permitir un acceso directo, aunque no descartan
que dicha funcionalidad pueda añadirse en el futuro.
