#### nodeos-mount-utils

El diseño original de NodeOS planteaba el que ubiese una particion raiz comun a
todos los usuarios y que contuviera los servicios globales del sistema, por lo
que los sistemas de archivos
[rootfs](../../../5. descripción informática/3. Implementación/3. rootfs.html) y
[usersfs](../../../5. descripción informática/3. Implementación/4. usersfs.html)
debian montarse por separado, aunque existia un conjunto de funciones comunes
necesarias para facilitar el montaje de ambos sistemas de archivos y el manejo
de los puntos de montaje que se han mantenido dentro del módulo
[nodeos-mount-utils](https://github.com/NodeOS/nodeos-mount-utils). Desde que
*rootfs* no es un sistema de archivos independiente al usarse *OverlayFS* en los
directorios de los usuarios dichas funciones podian haberse reintegrado dentro
el módulo
[nodeos-mount-filesystems](nodeos-mount-filesystems.html), sin embargo se han
decidido dejar en un módulo aparte para seguir manteniendo su reusabilidad.

Las funciones que aporta dicho módulo son:

* *execInit*: ejecuta el script de inicio de un usuario, usado para arrancar
  servicios del sistema que haya definido el mismo. Por seguridad primero se
  comprueba que tanto el script de inicio como el directorio de usuario tienen
  ambos el mismo id de usuario y de grupo (`UID` y `GID`), que seran utilizados
  posteriormente para definir el `UID` y `GID` de los procesos del usuario en
  ejecución. El script de inicio del usuario se ejecuta dentro de su propia
  jaula *chroot* utilizando el directorio del usuario como sistema de archivos
  raiz, del mismo modo como posteriormente se ejecutaran el resto de procesos de
  dicho usuario. Para ello, se ejecuta un proceso intermedio `chrootInit` cuya
  unica labor es crear la jaula *chroot* y despues ejecutar el propio script de
  `/init` del usuario dentro de él con el `UID` y `GID` con permisos reducidos.
  Esto es asi porque la jaula *chroot* solo puede generarse con permisos de
  administrador (los mismos usados para montar los sistemas de archivos), pero
  sobretodo porque ésta afecta al propio proceso en curso, con lo que haciendolo
  de otra manera se estaria encerrando al proceso que este ejecutando la funcion
  (probablemente [nodeos-mount-filesystems](nodeos-mount-filesystems.html)).
  Ademas, de este modo se puede comprobar cuando el script se ha iniciado
  correctamente para poder seguir con la ejecucion de los scripts del resto de
  usuarios, sin tener que esperar a que este haya terminado. Por ultimo, para
  poder indicar a `chrootInit` el `UID` y `GID` con que debe ejecutar el script
  de inicio del usuario, estos se añaden al principio de la lista de argumentos
  del mismo, de forma que esten en una ubicacion que permitan ser facilmente
  localizables por este.
* *mkdirMount*: monta el sistema de archivos indicado, creando el directorio
  donde se va a alojar el punto de montaje previamente si este no existia.
  Puesto que no importan los permisos del directorio que se utilice como punto
  de montaje para poder ser usado puesto que estos son ignorados, este se crea
  con modo *0000* para evitar el que se puedan escribir archivos dentro del
  mismo por accidente una vez se haya desmontado el sistema de archivos.
* *mountfs*: comprueba si el sistema donde se esta ejecutando es un entorno
  Docker (ya que este no usa montaje de particiones sino apilamiento de
  containers LXC), y si no es el caso, monta el sistema de archivos a partir del
  nombre de la variable de entorno indicada usando la funcion *mkdirMount*. Para
  comprobar si se esta ejecutando dentro de un entorno Docker se comprueba l
   existencia del archivo `.dockerinit` en el directorio raiz.
* *mountfs_path*: esta función es igual que *mountfs*, pero usa directamente la
  ruta del dispositivo en vez de una variable de entorno. *mountfs* se ha
  mantenido por retrocompatibilidad, pero es probable que se marque como
  deprecada en el futuro.
* *move*: mueve un sistema de archivos a una nueva ubicacion, y si el directorio
  del anterior punto de montaje esta vacio, lo elimina.
* *moveSync*: version sincrona de *move*.
* *mkdirMove*: igual a *move*, pero creando previamente el directorio del punto
  de montaje destino si no existe.
* *startRepl*: crea un interprete REPL de emergencia y termina el proceso desde
  el que se ha ejecutado cuando se sale de este.
