#### nodeos-mount-filesystems

Una de las principales caracteristicas de NodeOS es el mostrar a los usuarios un
sistema de archivos raiz propio para cada uno de ellos e independiente del resto,
lo cual se ha logrado mediante el uso del sistema de archivos *OverlayFS* y de
jaulas *chroot*. Esta funcionalidad estaba implementada anteriormente en los
módulos *nodeos-mount-rootfs* y *nodeos-mount-usersfs*, centrados en montar
respectivamente el sistema de archivos raiz del sistema y la partición de los
usuarios. Sin embargo, la que era partición raiz del sistema ahora solo es usada
como partición de arranque, por lo que se ha unido la funcionalidad de ambos en
[nodeos-mount-filesystems](https://github.com/piranna/nodeos-mount-filesystems),
lo cual ademas simplifica la tarea de montar todos los sistemas de archivos
incluidas las referencias a los sistemas de archivos *devtmpfs* y *proc* dentro
de cada uno de los sistemas de archivos raiz de cada uno de los usuarios de
forma que estos puedan ser accesibles por ellos.

##### Proceso de montaje de los sistemas de archivos

El primer paso que realiza dicho módulo es montar los sistemas de archivos
virtuales *devtmpfs* y *procfs* en los puntos de montaje `/dev` y `/proc`
respectivamente, de forma que se pueda acceder a los parametros con los que se
ha arrancado el kernel de Linux leyendo el contenido del archivo ubicado en
`/proc/cmdline` y acceder al dispositivo que contiene el sistema de archivos
de los usuarios. El sistema de archivos *procfs* es montado por seguridad con el
parametro `hidepid=2` de forma que solo muestre a los usuarios la información de
[sus propios procesos](http://www.cyberciti.biz/faq/linux-hide-processes-from-other-users)
en vez de la de todos los que estan corriendo en el sistema, de forma similar a
como se está usando el sistema de archivos [ExclFS](ExclFS.md) sobre
*devtmpfs* para mostrar solamente los dispositivos accesibles por el usuario. En
el caso de estar ejecutandose el sistema sobre *Docker* o *vagga* el tratar de
montar estos sistemas de archivos dara un fallo puesto que ya estarán montados
previamente, por lo que solamente notificamos al usuario de dicho error.

A partir del sistema de archivos *procfs* se obtienen los parametros con los que
se ha ejecutado el kernel de Linux parseando el contenido del archivo
`/proc/cmdline` para obtener el dispositivo que contiene el sistema de archivos
de los usuarios. Puesto que tanto *Docker* como *vagga* utilizan el sistema de
archivos *procfs* del sistema sobre el que están corriendo, los parametros
`root` y `rootfstype` corresponden a los de este en vez de indicar el sistema de
archivos de los usuarios perteneciente a NodeOS, por lo que también se puede
definir mediante una variable de entorno que sobrescriba el valor proporcionado
en `/proc/cmdline`. Al ejecutarse el descubrimiento de dispositivos por parte de
Linux de forma asíncrona, en algunos casos puede que se ejecute el script de
inicio (y por tanto el montaje de la partición de usuarios) antes de que esta
esté disponible, es por este motivo por lo que se comprueba la existencia del
descriptor de dispositivo durante 5 segundos a intervalos de 1 segundo antes de
notificar del error al usuario y solicitarle que indique su ubicación exacta. En
caso de no haberse indicado una partición con el sistema de archivos de los
usuarios durante el arranque o despues de solicitarselo explicitamente, se
muestra una advertencia indicando que se usará un disco RAM donde todos los
cambios se perderan al reiniciar el sistema y se ofrece acceso a un interprete
REPL. En el caso de que el parametro `root` tenga el valor `container` se
asumirá que se está ejecutando dentro de un contanedor LXC y que por tanto la
partición de usuarios ya está montada, por lo que se pasa directamente a montar
los sistemas de archivos raíz de cada uno de los usuarios.

Una vez que se ha localizado la partición con los directorios de los usuarios,
se monta dentro del directorio `/tmp` del initram. Esto es así puesto que dicho
directorio será usado posteriormente por *OVerlayFS* en los sistemas raíz de los
usuarios, por lo que sus correspondientes *tmpfs* ocultarán el contenido de la
partición de los usuarios, previniendo posibles agujeros de seguridad. Después
se actualízan las variables de entorno eliminando las que han sido usadas
durante el proceso de arranque (`root`, `rootfstype` y `vga`, usada esta última
para definir el modo y la resolución del framebuffer) y definiendo la variable
de entorno `NODE_PATH` a la ruta donde estará la ubicación de los módulos de
Node.js instalados globalmente dentro del sistema de archivos raiz de cada
ususario (`/lib/node_modules`), de forma que luego estén disponibles para
cualquier aplicación o script, y en especial desde los interpretes REPL.

##### Sistema de archivos raíz de cada usuario

Una vez que ya esta montada la partición con los directorios de los usuarios, se
crea para cada uno de ellos un sistema de archivos raíz própio aislado de el de
los demas. Para ello se utiliza *OverlayFS* usando el directorio raiz real
(*initramfs*) como capa de solo-lectura y el directorio del usuario como capa de
lectura-escritura, montando ambos directamente en el própio directorio del
usuario. Esto es posible porque *OverlayFS* mantiene internamente una referencia
al `inodo` del sistema de archivos real en lugar de acceder a su contenido
mediante rutas (las cuales al resolverse accederian sin embargo al contenido del
sistema de archivos mostrado por *OverlayFS*). De esta forma, se ven de forma
simultanea el sistema de archivos *initramfs* con el binario de Node.js y las
librerías del sistema junto con los archivos del própio usuario de forma
unificada. Después se montan los directorios `/dev` y `/proc` usando la opción
`MS_BIND` de forma que puedan ser accesibles desde dentro de los directorios de
usuarios. Sus puntos de montaje no estarán ubicados físicamente sino que se usan
los correspondientes al *initramfs* a traves del *OverlayFS*, con lo que en caso
de tener despues que acceder directamente a la partición (por ejemplo desde otra
máquina para recuperar los datos) el contenído del directorio no estará
ensuciado con directorios vacios. Por último, también se monta un sistema de
archivos *tmpfs* en el directorio `tmp` antes de ejecutar el script de inicio
del usuario, de forma que cada usuario tenga su própio directorio para archivos
temporales, reusando en este caso el directorio `/tmp` donde se montó
anteriormente la partición de usuarios de forma que esta queda oculta. Una vez
que los usuarios accedan al sistema, se creará una jaula *chroot* dentro de su
própio directorio de usuario y la visión que tendran del sistema de archivos
sera la siguiente:

{% mermaid src="resources/user.mmd" %}{% endmermaid %}

##### Sistema de archivos raíz del usuario *root*

La partición puede contener el directorio de usuario de un usuario administrador
(`root`), el cual tendría algunos servicios globales y configuración del sistema.
Este usuario no es necesario para el funcionamiento correcto del sistema y es
totalmente opcional, aunque en caso de estar disponible se prepara antes de los
demas usuarios para poder tener acceso a los directorios de todos usuarios,
necesario por ejemplo para poder leer la configuración de los usuarios para el
[login distribuido](logon.md).

En tal caso, se crea su sistema overlay en el directorio `/root` del initramfs,
se mueve el punto de montaje de la partición de usuarios al directorio
`/root/home`, y finalmente se mueve de vuelta el punto de montaje de `/root` a
`/tmp` antes de continuar con el proceso de montar los sistemas de archivos raiz
de los usuarios normalmente desde su nueva ubicación. De este modo no solo queda
el directorio de *root* oculto al igual que antes estaba la partición de
usuarios sino que ademas estos están accesibles en el directorio `/home` desde
dentro de la jaula *chroot* del usuario *root*. No obstante, en caso de no estar
ejecutandose dentro de un contenedor LXC y si el sistema de archivos
[ExclFS](ExclFS.md) esta disponible, entonces se usara éste en vez de usar
directamente el sistema de archivos *devtmpfs* del sistema y despues se
eliminará del *initram* para ahorrar memoria, al igual que se hace con
[nodeos-mount-utils](nodeos-mount-utils.md) despues de montar los sistemas de
archivos raíz de los usuarios o con el directorio `/usr`, éste último para que
no se muestre en los sistemas raíz aunque siga estando usable. De esta forma, el
sistema de archivos que veria el usuario *root* seria:

{% mermaid src="resources/root.mmd" %}{% endmermaid %}

(Se han ocultado los puntos de montaje compartidos con el usuario *nodeos* por
claridad)

##### Sistema de archivos raíz real

La finalidad de todo este proceso es no sólo que el sistema de archivos real
tenga una estructura límpia sino sobretodo el que no estén disponibles en los
sistemas de archivos raíz de cada uno de los usuarios directorios intermedios de
los distíntos sistemas overlay o elementos que sólo pertenecen al usuario *root*,
razón por la que tiene su própio sistema overlay en vez de usar directamente el
sistema de archivos real, teniendo el sistema la siguiente estructura cuando no
hay un usuario *root* en el sistema:

{% mermaid src="resources/real.mmd" %}{% endmermaid %}

(Se han ocultado todos los puntos de montaje que no corresponden a particiones
físicas por claridad)

En el caso de que sí haya un usuario *root* encargado de administrar el sistema
de arranque y los procesos globales, la estructura del sistema de archivos raíz
seria la siguiente:

{% mermaid src="resources/real_root.mmd" %}{% endmermaid %}

(Solo se muestran las particiones reales y el sistema overlay del usuario *root*)

Una posible alternativa habría sido el configurar los puntos de montaje de forma
que fuesen compartidos por los sistemas de archivos donde han sido montados, con
lo que estarían disponibles automaticamente sin necesidad de crear nuevos puntos
de montaje mediante el flag `MS_BIND` por cada usuario. Otra posible alternativa
sería el uso de namespaces y contenedores LXC para cada usuario, pero para ambas
opciónes no he tenido ocasión de probarlas y desconozco si podrían implicar
algun problema de seguridad por la forma en que se esta usando actualmente el
sistema de archivos *OverlayFS*.
