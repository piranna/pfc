#### nodeos-mount-filesystems

Una de las principales caracteristicas de NodeOS es el mostrar a los usuarios un
sistema de archivos raiz propio para cada uno de ellos e independiente del resto,
lo cual se ha logrado mediante el uso del sistema de archivos OverlayFS y de
jaulas chroot. Esta funcionalidad estaba implementada anteriormente en los
módulos *nodeos-mount-rootfs* y *nodeos-mount-usersfs*, centrados en montar
respectivamente el sistema de archivos raiz del sistema y la partición de los
usuarios. Sin embargo, la que era partición raiz del sistema ahora solo es usada
como partición de arranque, por lo que se ha unido su funcionalidad en el modulo
[nodeos-mount-filesystems](https://github.com/piranna/nodeos-mount-filesystems),
lo cual ademas simplifica la tarea de montar todos los sistemas de archivos
incluidas las referencias a los sistemas de archivos *devtmpfs* y *proc* dentro
de cada uno de los sistemas de archivos raiz de forma que estos puedan ser
accesibles por los usuarios.

El primer paso que realiza dicho modulo es montar los sistemas de archivos
virtuales *devtmpfs* y *procfs* en los puntos de montaje `/dev` y `/proc`
respectivamente, de forma que se pueda acceder a los parametros con los que se
ha arrancado el kernel de Linux leyendo el contenido del archivo ubicado en
`/proc/cmdline` y acceder al dispositivo que contiene el sistema de archivos
de los usuarios. El sistema de archivos *procfs* es montado por seguridad con el
parametro `hidepid=2` de forma que solo muestre a los usuarios la información de
[sus propios procesos](http://www.cyberciti.biz/faq/linux-hide-processes-from-other-users)
en vez de la de todos los que estan corriendo en el sistema, de forma similar a
como se esta usando el sistema de archivos [ExclFS](2. ExclFS.html) sobre
*devtmpfs* para mostrar solamente los dispositivos accesibles por el usuario.

A partir del sistema de archivos *procfs* se obtienen los parametros con los que
se ha ejecutado el kernel de Linux parseando el contenido del archivo
`/proc/cmdline` para obtener el dispositivo que contiene el sistema de archivos
de los usuarios. Al ejecutarse el descubrimiento de dispositivos por parte de
Linux de forma asincrona, en algunos casos puede que se ejecute el script de
inicio (y por tanto el montaje de la particion de usuarios) antes de que esta
este disponible, es por esto por lo que se comprueba la existencia del
descriptor de dispositivo durante 5 segundos a intervalos de 1 segundo antes de
notificar del error al usuario y solicitarle que indique su ubicacion. En caso
de no haberse indicado una particion con el sistema de archivos de los usuarios
durante el arranque o al solicitarselo explicitamente, se muestra una
advertencia indicando que se usara un disco RAM donde todos los cambios se
perderan al reiniciar el sistema y se ofrece acceso a un interprete REPL.

Una vez que se ha localizado la partición con los directorios de los usuarios,
se monta dentro del directorio `/tmp` del initram y se actualizan las variables
de entorno eliminando las que han sido usadas durante el proceso de arranque y
definiendo la variable de entorno `NODE_PATH` donde estara la ubicación de los
módulos de Node.js instalados globalmente dentro del sistema de archivos raiz de
cada ususario (`/lib/node_modules`) de forma que luego sean usables por
cualquier aplicación o script que ellos desarrollen (y sobretodo poder acceder a
ellos desde un interprete REPL).

Por ultimo, se crea por cada uno de los usuarios un sistema de archivos raiz
propio aislado de el de los demas. Para ello se utiliza OverlayFS usando el
directorio raiz real como capa de solo-lectura y el directorio del usuario como
lectura-escritura, montando ambos directamente en el propio directorio del
usuario. Esto es posible porque OverlayFS mantiene internamente una referencia
al inodo del sistema de archivos real en lugar de acceder a su contenido
mediante rutas (las cuales al resolverse accederian sin embargo al contenido del
sistema de archivos mostrado por OverlayFS). De esta forma, se ven
simultaneamente el sistema de archivos initram con el binario de Node.js y las
librerias del sistema junto con los archivos del propio usuario de forma
unificada. Despues se montan los directorios `/dev` y `/proc` usando la opcion
`MS_BIND` de forma que puedan ser accesibles desde dentro de los directorios de
usuarios. Estos no estaran ubicados fisicamente sino que se usan los
correspondientes al initramfs a traves del OverlayFS, con lo que en caso despues
de tener que acceder directamente a la partición (por ejemplo desde otra maquina
para recuperar los datos) el contenido del directorio no estara ensuciado con
directorios vacios. Por ultimo tambien se monta un sistema de archivos *tmpfs*
en el directorio `tmp` de forma que cada usuario tenga su propio directorio para
archivos temporales, reusando en este caso el directorio `/tmp` donde se monto
la partición de usuarios (lo cual es la verdadera razón por la que se monto en
dicha ubicación en primer lugar). Una vez que los usuarios accedan al sistema,
se creara una jaula *chroot* dentro de su propio directorio de usuario y la
visión que tendran del sistema de archivos sera el siguiente:

{% mermaid src="resources/user.mmd" %}{% endmermaid %}

La particion puede contener el directorio de usuario de un usuario administrador,
el cual tendria algunos servicios globales y configuracion del sistema. Este
usuario no es necesario para el funcionamiento correcto del sistema y es
totalmente opcional, aunque en caso de estar disponible se prepara antes de los
demas usuarios para poder tener acceso a los directorios de todos usuarios,
necesario por ejemplo para poder leer la configuracion de los usuarios para el
login distribuido.

En tal caso, se crea su sistema overlay en el directorio `/root` del initramfs,
se mueve el punto de montaje de la partición de usuarios al directorio
`/root/home`, y finalmente se mueve de vuelta el punto de montaje de `/root` a
`/tmp` antes de continuar con el proceso de montar los sistemas de archivos de
los usuarios normalmente. De este modo no solo queda el directorio de *root*
oculto al igual que antes estaba la partición de usuarios sino que ademas estos
estan accesibles desde dentro de su jaula chroot en el directorio `/home`. De
esta forma, el sistema de archivos que veria el usuario *root* seria (se han
ocultado los puntos de montaje compartidos con el usuario *nodeos* por claridad):

{% mermaid src="resources/root.mmd" %}{% endmermaid %}

La finalidad de todo este proceso es no solo que el sistema de archivos real
tenga una estructura limpia sino sobretodo el que no esten disponibles en los
sistemas de archivos raiz de los usuarios directorios intermedios de los
distintos sistemas overlay sino tambien elementos que solo pertenecen al usuario
*root*, razón por la que tiene su propio sistema overlay en vez de usar
directamente el sistema de archivos real, teniendo la siguiente estructura
cuando no hay un usuario *root* en el sistema (se han ocultado todos los puntos
de montaje que no corresponden a particiones fisicas por claridad):

{% mermaid src="resources/real.mmd" %}{% endmermaid %}

Mientras que cuando si hay un usuario *root* encargado de administrar el sistema
de arranque y los procesos globales la estructura seria la siguiente (solo se
muestran las particiones reales y el sistema overlay del usuario *root*):

{% mermaid src="resources/real_root.mmd" %}{% endmermaid %}

Una posible alternativa habria sido el configurar los puntos de montaje de forma
que fuesen compartidos por los sistemas de archivos donde han sido montados con
lo que estarian disponibles automaticamente sin necesidad de crear nuevos puntos
de montaje mediante el flag `MS_BIND` por cada usuario. Otra posible alternativa
seria el uso de namespaces y contenedores LXC, pero ambas opciónes no he tenido
ocasión de probarlas y desconozco si podrian implicar algun problema de
seguridad por la forma en que se esta usando el sistema de archivos OverlayFS.
