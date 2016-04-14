#### nodeos-mount-utils

El diseño original de NodeOS planteaba el que hubiese una partición raíz común a
todos los usuarios que contuviera los servicios globales del sistema, por lo que
los sistemas de archivos
[rootfs](../../../5. descripción informática/3. Implementación/3. rootfs.html) y
[usersfs](../../../5. descripción informática/3. Implementación/4. usersfs.html)
debían montarse por separado, aunque existía un conjunto de funciones comunes
necesarias para facilitar el montaje de ambos sistemas de archivos y el manejo
de los puntos de montaje que se han mantenido dentro del módulo
[nodeos-mount-utils](https://github.com/NodeOS/nodeos-mount-utils). Desde que
*rootfs* no es un sistema de archivos independiente al usarse *OverlayFS* en los
directorios de los usuarios, dichas funciones podían haberse reintegrado dentro
del módulo
[nodeos-mount-filesystems](nodeos-mount-filesystems.html). Sin embargo, se han
decidido dejar en un módulo aparte para seguir manteniendo su reusabilidad.

Las funciones que aporta dicho módulo son:

* *execInit*: ejecuta el script de inicio de un usuario, usado para arrancar
  servicios del sistema que haya definido el mismo. Por seguridad, primero se
  comprueba que tanto el script de inicio como el directorio de usuario tienen
  ambos el mismo id de usuario y de grupo (`UID` y `GID`), que serán utilizados
  posteriormente para definir el `UID` y `GID` de los procesos del usuario en
  ejecución. El script de inicio del usuario se ejecuta dentro de su propia
  jaula *chroot* utilizando el directorio del usuario como sistema de archivos
  raíz, del mismo modo a como posteriormente se ejecutarán el resto de procesos de
  dicho usuario. Para ello, se ejecuta un proceso intermedio `chrootInit` cuya
  única labor es crear la jaula *chroot* y después ejecutar el propio script de
  `/init` del usuario dentro de ella con su `UID` y `GID` y permisos reducidos.
  Esto es así porque la jaula *chroot* sólo puede generarse con permisos de
  administrador (los mismos usados para montar los sistemas de archivos), pero
  sobre todo porque esta afecta al propio proceso en curso, por lo que haciéndolo
  de otra manera se estaría encerrando al proceso que esté ejecutando la función
  (probablemente *nodeos-mount-filesystems*).
  Además, de este modo se puede comprobar cuándo el script se ha iniciado
  correctamente para poder seguir con la ejecución de los scripts del resto de
  usuarios, sin tener que esperar a que este haya terminado. Por último, para
  poder indicar a `chrootInit` el `UID` y `GID` con que debe ejecutar el script
  de inicio del usuario, estos se añaden al principio de la lista de argumentos
  del mismo, de forma que estén en una ubicación que permita después ser
  fácilmente localizables por este.
* *mkdirMount*: monta el sistema de archivos indicado, creando el directorio
  donde se va a alojar el punto de montaje previamente si no existía. Puesto que
  no importan los permisos del directorio que se utilicen como punto de montaje
  para poder ser usado, ya que estos son ignorados por Linux, este se crea
  con modo *0000* para evitar que se puedan escribir archivos dentro del
  mismo por accidente una vez se haya desmontado el sistema de archivos en caso
  de que no se haya hecho limpiamente y no se haya eliminado el punto de montaje.
* *mountfs*: comprueba si el sistema donde se está ejecutando es un entorno
  Docker (ya que este no usa montaje de particiones sino apilamiento de
  containers LXC), y si no es el caso, monta el sistema de archivos a partir del
  nombre de la variable de entorno indicada usando la función *mkdirMount*. Para
  comprobar si se está ejecutando dentro de un entorno Docker, se comprueba la
  existencia del archivo `.dockerinit` en el directorio raíz.
* *mountfs_path*: esta función es igual que *mountfs*, pero usa directamente la
  ruta del dispositivo en vez de una variable de entorno. *mountfs* se ha
  mantenido por retrocompatibilidad, pero es probable que se marque como
  deprecada en el futuro.
* *move*: mueve un sistema de archivos a una nueva ubicación, y si el directorio
  del anterior punto de montaje esta vacío, lo elimina.
* *moveSync*: versión síncrona de *move*.
* *mkdirMove*: igual a *move*, pero creando previamente el directorio del punto
  de montaje destino si no existe.
* *startRepl*: crea un intérprete REPL de emergencia y termina el proceso desde
  el que se ha ejecutado cuando se sale de este.
