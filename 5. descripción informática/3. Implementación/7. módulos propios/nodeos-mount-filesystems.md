#### nodeos-mount-filesystems

Una de las principales características de NodeOS es mostrar a los usuarios un
sistema de archivos raíz propio para cada uno de ellos e independiente del resto,
algo que se ha logrado mediante el uso del sistema de archivos *OverlayFS* y de
jaulas *chroot*. Esta funcionalidad estaba implementada anteriormente en los
módulos *nodeos-mount-rootfs* y *nodeos-mount-usersfs*, centrados en montar
respectivamente el sistema de archivos raíz del sistema y la partición de los
usuarios. Sin embargo, la que era partición raíz del sistema ahora sólo es usada
como partición de arranque, por lo que se ha unido la funcionalidad de ambos en
[nodeos-mount-filesystems](https://github.com/piranna/nodeos-mount-filesystems),
mejora que simplifica la tarea de montar todos los sistemas de archivos,
incluidas las referencias a los sistemas de archivos *devtmpfs* y *proc*, dentro
de cada uno de los sistemas de archivos raíz de cada uno de los usuarios, de
forma que aquellos puedan ser accesibles por estos.

##### Proceso de montaje de los sistemas de archivos

El primer paso que realiza dicho módulo es montar los sistemas de archivos
virtuales *devtmpfs* y *procfs* en los puntos de montaje `/dev` y `/proc`
respectivamente, de forma que se pueda acceder a los parámetros con los que se
ha arrancado el kernel de Linux leyendo el contenido del archivo ubicado en
`/proc/cmdline` y acceder al dispositivo que contiene el sistema de archivos de
los usuarios. El sistema de archivos *procfs* es montado por seguridad con el
parámetro `hidepid=2` de forma que solo muestre a los usuarios la información de
[sus propios procesos](http://www.cyberciti.biz/faq/linux-hide-processes-from-other-users)
en vez de la de todos los que están corriendo en el sistema, de forma similar a
como se está usando el sistema de archivos [ExclFS](ExclFS.md) sobre *devtmpfs*
para mostrar solamente los dispositivos accesibles por el usuario. Si está
ejecutándose el sistema sobre *Docker* o *vagga*, el tratar de montar estos
sistemas de archivos dará un fallo, ya que estarán montados previamente, por lo
que solamente se notificará al usuario dicho error.

A partir del sistema de archivos *procfs* se obtienen los parámetros con los que
se ha ejecutado el kernel de Linux, parseando el contenido del archivo
`/proc/cmdline`, para obtener el dispositivo que contiene el sistema de archivos
de los usuarios. Puesto que tanto *Docker* como *vagga* utilizan el sistema de
archivos *procfs* del sistema sobre el que están corriendo, los parámetros
`root` y `rootfstype` corresponden a los de este en vez de indicar el sistema de
archivos de los usuarios perteneciente a NodeOS, por lo que también se puede
definir mediante una variable de entorno que sobrescriba el valor proporcionado
en `/proc/cmdline`. Al ejecutarse el descubrimiento de dispositivos por parte de
Linux de forma asíncrona, en algunos casos puede que se ejecute el script de
inicio (y, por tanto, el montaje de la partición de usuarios) antes de que esta
esté disponible. Por este motivo se comprueba la existencia del descriptor de
dispositivo durante 5 segundos, a intervalos de 1 segundo, antes de notificar el
error al usuario y solicitarle que indique su ubicación precisa. En caso de no
haberse indicado una partición con el sistema de archivos de los usuarios
durante el arranque o después de solicitárselo explícitamente, se muestra una
advertencia indicando que se usará un disco RAM donde todos los cambios se
perderán al reiniciar el sistema y se ofrece acceso a un intérprete REPL. Si el
parámetro `root` tiene el valor `container`, se asumirá que se está ejecutando
dentro de un contenedor LXC y que, por tanto, la partición de usuarios ya está
montada, pasando directamente a montar los sistemas de archivos raíz de cada uno
de los usuarios.

Una vez que se ha localizado la partición con los directorios de los usuarios,
se monta dentro del directorio `/tmp` del initram. Se procede de esta manera
porque dicho directorio será usado posteriormente por *OVerlayFS* en los
sistemas raíz de los usuarios, por lo que sus correspondientes *tmpfs* ocultarán
el contenido de la partición de los usuarios, previniendo posibles agujeros de
seguridad. Después, se actualizan las variables de entorno eliminando las que
han sido usadas durante el proceso de arranque (`root`, `rootfstype` y `vga`,
usada esta última para definir el modo y la resolución del framebuffer) y
definiendo la variable de entorno `NODE_PATH` a la ruta en la que estará la
ubicación de los módulos de Node.js instalados globalmente dentro del sistema de
archivos raíz de cada usuario (`/lib/node_modules`), de forma que luego estén
disponibles para cualquier aplicación o script, y en especial desde los
intérpretes REPL.

##### Sistema de archivos raíz de cada usuario

Una vez montada la partición con los directorios de los usuarios, se crea para
cada uno de ellos un sistema de archivos raíz propio, aislado de el de los
demás. Para ello se utiliza *OverlayFS* usando el directorio raíz real
(*initramfs*) como capa de sólo-lectura y el directorio del usuario como capa de
lectura-escritura, montando ambos directamente en el propio directorio del
usuario. Esto es posible porque *OverlayFS* mantiene internamente una referencia
al `inodo` del sistema de archivos real en lugar de acceder a su contenido
mediante rutas (las cuales, al resolverse, accederían sin embargo al contenido
del sistema de archivos mostrado por *OverlayFS*). De esta forma, se ven
simultáneamente el sistema de archivos *initramfs* con el binario de Node.js y
las librerías del sistema junto con los archivos del propio usuario de forma
unificada. Después se montan los directorios `/dev` y `/proc`, usando la opción
`MS_BIND`, de forma que puedan ser accesibles desde dentro de los directorios de
usuarios. Sus puntos de montaje no están ubicados físicamente sino que se usan
los correspondientes al *initramfs* a través del *OverlayFS*, por lo que en caso
de tener después que acceder directamente a la partición (por ejemplo, desde
otra máquina para recuperar los datos) el contenido del directorio no estará
ensuciado con directorios vacíos. Por último, también se monta un sistema de
archivos *tmpfs* en el directorio `tmp` antes de ejecutar el script de inicio
del usuario, de forma que cada usuario tenga su propio directorio para archivos
temporales, reusando en este caso el directorio `/tmp` donde se montó
anteriormente la partición de usuarios, quedando esta oculta. Una vez los
usuarios accedan al sistema, se creará una jaula *chroot* dentro de su propio
directorio y la visión que tendrán del sistema de archivos será la siguiente:

{% mermaid src="resources/user.mmd" %}{% endmermaid %}

##### Sistema de archivos raíz del usuario *root*

La partición puede contener el directorio de un usuario administrador (`root`),
que tendría algunos servicios globales y configuración del sistema. Este usuario
no es necesario para el funcionamiento correcto del sistema y es totalmente
opcional, aunque en caso de estar disponible se prepara antes que los demás
usuarios para poder tener acceso a los directorios de todos los usuarios,
necesario, por ejemplo, para leer la configuración de los usuarios para el
[login distribuido](logon.md).

En tal caso, se crea su sistema overlay en el directorio `/root` del initramfs,
se mueve el punto de montaje de la partición de usuarios al directorio
`/root/home`, y finalmente se mueve de vuelta el punto de montaje de `/root` a
`/tmp` antes de continuar con el proceso de montar los sistemas de archivos raíz
de los usuarios desde su nueva ubicación. De este modo no solo queda el
directorio de *root* oculto al igual que antes estaba la partición de usuarios
sino que además estos están accesibles en el directorio `/home` desde dentro de
la jaula *chroot* del usuario *root*. No obstante, en caso de no estar
ejecutándose dentro de un contenedor LXC y si el sistema de archivos *ExclFS*
está disponible, entonces se usará este en vez de usar directamente el sistema
de archivos *devtmpfs* del sistema y después se eliminará del *initram* para
ahorrar memoria, al igual que se hace con el módulo
[nodeos-mount-utils](nodeos-mount-utils.md) después de montar los sistemas de
archivos raíz de los usuarios o con el directorio `/usr`; este último para que
no se muestre en los sistemas raíz aunque siga estando usable. De esta forma, el
sistema de archivos que vería el usuario *root* seria:

{% mermaid src="resources/root.mmd" %}{% endmermaid %}

(Se han ocultado los puntos de montaje compartidos con el usuario *nodeos* por
claridad)

##### Sistema de archivos raíz real

La finalidad de todo este proceso es no sólo que el sistema de archivos real
tenga una estructura limpia sino sobre todo que no estén disponibles en los
sistemas de archivos raíz de cada uno de los usuarios directorios intermedios de
los distintos sistemas overlay o elementos que sólo pertenecen al usuario
*root*, razón por la que tiene su propio sistema overlay en vez de usar
directamente el sistema de archivos real, teniendo el sistema la siguiente
estructura cuando no hay un usuario *root* en el sistema:

{% mermaid src="resources/real.mmd" %}{% endmermaid %}

(Se han ocultado todos los puntos de montaje que no corresponden a particiones
físicas por claridad)

En el caso de que haya un usuario *root* encargado de administrar el sistema
de arranque y los procesos globales, la estructura del sistema de archivos raíz
sería la siguiente:

{% mermaid src="resources/real_root.mmd" %}{% endmermaid %}

(Solo se muestran las particiones reales y el sistema overlay del usuario *root*)

Una posible alternativa habría sido configurar los puntos de montaje de forma
que fuesen compartidos por los sistemas de archivos donde han sido montados, con
lo que estarían disponibles automáticamente sin necesidad de crear nuevos puntos
de montaje mediante el flag `MS_BIND` por cada usuario. Otra posible alternativa
sería el uso de namespaces y contenedores LXC para cada usuario, pero ambas
opciones no han sido probadas y se desconoce si podrían implicar algún problema
de seguridad por la forma en que se está usando actualmente el sistema de
archivos *OverlayFS*, por lo que se ha dejado la experimentación con los mismos
como una posible mejora en el futuro.
