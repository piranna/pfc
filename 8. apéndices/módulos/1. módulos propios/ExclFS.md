#### ExclFS

Para permitir a los distintos usuarios acceso a los dispositivos del sistema sin
requerir permisos de administrador o pertenecer a un grupo del sistema
determinado (`audio`, `video`, `disk`, `dialout`, `tty`...) se ha implementado
un [sistema de archivos](https://github.com/NodeOS/ExclFS) usando el modulo
[fuse-bindings](../2. colaboraciones con módulos externos/1. fuse-bindings.html)
que actua como una capa sobre el sistema de archivos real (en este caso
*devtmpfs*) pero que solo permite su acceso a un unico usuario cada vez. De este
modo, cuando un usuario toma el control de un dispositivo del sistema ningun
otro puede acceder a el y modificar su configuración o accder a su información
hasta que este ha sido liberado, permitiendo el acceso a los dispositivos del
sistema de la forma habitual de abrir su archivo descriptor de dispositivo y
leer o escribir directamente en el. Esto permite de cara al desarrollador por
ejemplo que sea sencillo usar varios ratones o framebuffers en una misma
aplicacion al poder acceder directamente a los dispositivos, o que
simultaneamente varios usuarios puedan acceder a ellos en una misma maquina
siempre que esten disponibles.

El control de acceso de los archivos (o dispositivos, en este caso) se realiza
mediante un mapa de las rutas de los archivos actualmente abiertos y el UID del
usuario. Este mapa es inicializado al momento de abrir el archivo (`open`) y se
elimina la entrada del archivo cuando este es liberado (`release`) en caso de
que el usuario no posea mas descriptores de fichero abiertos para dicho archivo.
De este modo, para comprobar si dicho archivo es accesible basta con comprobar
si su ruta no esta en dicho mapa (lo que significa que nadie lo esta usando en
estos momentos), o en caso de estarlo, que el usuario tratando de acceder a él
sea el mismo que ya lo posee. Esta comprobación se realiza en dos puntos: a la
hora de acceder al archivo propiamente dicho (`access`), y tambien al listar los
archivos dentro del sistema de archivos (`readdir`), de forma que no se muestren
los archivos que actualmente estan en uso por parte de otros usuarios (y por
tanto no accesibles). Los archivos que no se esten usando se penso en mostrar su
UID y GID como `-1` puesto que es el estandar UNIX para indicar que un usuario
es [desconocido](http://superuser.com/a/706343/369985), cambiandolo por los del
usuario cuando es accedido, lo cual es especialmente util en el caso del sistema
de archivos *devtmpfs* para listar solamente los dispositivos que estan libres
en estos momentos y listos para ser usados. Sin embargo FUSE realiza una llamada
[antes de cada operación](http://sourceforge.net/p/fuse/wiki/FuseInvariants) al
metodo `getattr`, entre otras tareas para gestionar los permisos de acceso, lo
cual tambien es posible explicitamente con el metodo `access` pero no hay apenas
documentación al respecto, por lo que en su lugar uso el UID del usuario que
esta tratando de obtener acceso si ningun usuario esta usando el archivo para
facilitar esta tarea y que pueda gestionarlo FUSE de forma automatica.

Por ultimo, los permisos de acceso usados son los correspondientes al *grupo*
del archivo como permisos del usuario, utilizando los correspondientes a *otros*
en el caso de que un archivo ya este siendo accedido. Este esquema de permisos
teniendo en cuenta solo al *propietario* y *otros* es similar al original de
UNIX y se adapta mejor a un sistema como NodeOS donde por diseño cada usuario
esta aislado del resto y por tanto por definición no exite el concepto de grupo.
De este modo se evita la posibilidad de acceder a los archivos cuyo acceso esta
restringido a su verdadero propietario, que en el caso del sistema de archivos
*devtmpfs* es el usuario *root* y corresponden al acceso directo a la memoria
del sistema y otros dispositivos que pueden plantear un serio problema de
seguridad. No obstante, tambien se permite definir manualmente una *whitelist*
para permitir el acceso a determinados archivos como son los descriptores de los
distintos buses [i2c](http://www.i2c-bus.org) disponibles en el sistema, los
cuales al ser usados para configurar la memoria RAM o la tarjeta grafica del
sistema (entre otra multitud de usos) solo permiten su acceso por parte del
usuario *root*, pero suele ser seguro el permiso de lectura por parte de los
usuarios por ejemplo para leer la temperatura de la CPU, y en muchos casos
tambien lo es el permiso de escritura para poder acceder a un puerto
[GPIO](https://es.wikipedia.org/wiki/GPIO) si la maquina lo incluyese.

Las operaciones de lectura y escritura no se realizan mediante los descriptores
de fichero del sistema de archivos subyacente, lo que introduce una penalización
en el rendimiento respecto al que se podria obtener usando directamente el
sistema de archivos *devtmpfs* ofrecido por el kernel (o mediante el uso de
[udev](https://www.kernel.org/pub/linux/utils/kernel/hotplug/udev/udev.html), el
cual es usado mas normalmente en sistemas Linux normales pero desconozco como es
su implementación) debido a como funciona FUSE, ya que a pesar de que
[tecnologicamente](http://fuse.996288.n3.nabble.com/Passthrough-file-descriptor-patch-tp8002.html)
seria posible devolver dicho descriptor de ficheros en los sistemas de archivos
de tipo *overlay* (como es el caso) a las aplicaciones que han solicitado su
acceso manteniendo la seguridad del sistema, los desarrolladores de FUSE
prefieren centrarse en aumentar el rendimiento en las operaciones de
transferencia de datos y otro tipo de operaciones genericas que puedan
repercutir en un aumento del rendimiento generalizado para todos los sistemas de
archivos basados en FUSE antes que ampliar su API para permitir un acceso
directo, aunque no descartan que dicha funcionalidad pueda añadirse en el futuro.
