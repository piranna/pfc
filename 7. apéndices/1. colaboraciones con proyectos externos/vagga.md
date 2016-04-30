#### vagga

La arquitectura minimalista de NodeOS ofrece unas claras ventajas para ser usado
como sistema operativo de servidores cloud. Dentro de este entorno están ganando
popularidad los contenedores [LXC](https://linuxcontainers.org), y en especial
el administrador de contenedores [Docker](https://www.docker.com), el cual
permite controlar las aplicaciones de forma aislada del resto del sistema y
poder cambiar de proveedor de servicios fácilmente.

Teniendo esto en mente, los primeros desarrollos del proyecto estaban basados en
él, y de hecho se hacía un uso extensivo de las librerías propias de Ubuntu del
sistema donde se estaba generando, lo cual normalmente no daba ningún problema
puesto que el sistema operativo de los sistemas Docker en internet suelen estar
basados en Ubuntu. Sin embargo, decidí centrarme en poder ejecutarlo bajo
[QEmu](http://qemu.org) por dos razones:

* mis conocimientos de cómo funciona *Docker* eran escasos en comparación con
  los QEmu, con el cual ya había experimentado anteriormente.
* y por otro, que al ser QEmu un emulador de ordenador completo, una vez NodeOS
  funcionara correctamente en él, seria relativamente fácil hacer que funcionara
  sobre hardware real, lo cual sería un gran paso de cara a su portabilidad con
  otras plataformas, a su versatilidad y a que pudiese ser auto-contenido.

Sin embargo, *Docker* está diseñado para ser ejecutado como servicio del sistema
y por tanto requiere permisos de administrador, lo cual es un problema tal como
esta diseñado el sistema de construcción de NodeOS, y aunque se puede configurar
para permitir su uso mediantes usuarios normales, requiere de trabajo extra por
parte del desarrollador, por lo que finalmente descarte su uso y en su lugar
decidí usar [vagga](https://github.com/tailhook/vagga), el cual hace uso de
contenedores LXC en espacio de usuario. Esto evita la necesidad de tener
permisos de administrador y además esta diseñado para que pueda ser compatible
tanto con *Docker* como con [Vagrant](https://www.vagrantup.com) (una
herramienta para la creación y configuración de entornos de desarrollo
virtualizados, similar a *Docker* en cuanto a objetivos pero basado en el uso de
maquinas virtuales), permitiendo así generar imágenes compatibles con los tres
sistemas a la vez.

El uso de *vagga* ha dado bastantes problemas, en parte debido a que es un
proyecto actualmente en desarrollo. En primer lugar, el formato usado por el
kernel de Linux para el *initramfs* es el tipo de archivo `cpio` en su formato
`newc`, mientras que tanto *Docker* como *vagga* sólo soportan `tar` para
inicializar su sistema de archivos base (y en concreto, *Docker* sólo soporta el
formato `ustar`). Para poder generarlo siguiendo el mismo proceso usado para
generar el sistema de archivos *initramfs* del kernel de Linux a partir de un
archivo en texto plano, decidí convertir el archivo `cpio` generado a `tar`. El
problema está en que a pesar de que tanto el comando `cpio` como `tar` soportan
ambos tipos de archivos, ninguno proporciona un modo de conversión entre ellos,
requiriendo primero desempaquetarlos para después volver a empaquetarlos en el
nuevo formato. Esto podría acarrear problemas de permisos en el sistema de
archivos del usuario que este generando la imagen, además de ser mas lento al
requerir de hacer accesos al disco, por lo que decidí convertirlos dinámicamente
mediante el uso de los módulos [cpio-stream](cpio-stream.html) y
[tar-stream](tar-stream.html) de Node.js.

Una vez que conseguí generar el archivo `tar` con el contenido de la capa
[barebones](../../../4. descripción informática/3. Implementación/1. barebones.html)
de forma que pueda ser usada tanto por *Docker* como por *vagga*, procedí a
ejecutarla por este último. Para ello configuré el archivo `vagga.yaml` para que
inicialice el contenido del sistema de archivos mediante el comando
[!Tar](http://vagga.readthedocs.org/en/latest/build_commands.html#generic-installers),
descubriendo que no funciona con archivos locales sino solo con
[archivos alojados remotamente](https://github.com/tailhook/vagga/issues/81),
por lo que para las pruebas decidí usar un servidor HTTP local[^1]. Vagga genera
por defecto los directorios `/bin` y `/lib`, el punto de montaje para `/dev` y
también añade el dispositivo `/dev/console`, entrando en conflicto con los
incluidos en el *initramfs* de NodeOS. Para solucionarlo, simplemente detecto el
entorno para el que estoy generando el sistema y en caso de estar produciendo
una imagen para un contenedor LXC no añado dichas entradas para poder crear el
sistema de archivos correctamente, por lo que después de esto y una vez que se
[resolvieron algunos problemas](https://github.com/tailhook/vagga/issues/85) en
*vagga* relativos al archivo de configuración, finalmente pude ejecutar la capa
de *barebones* dentro del entorno:

```Javascript
[piranna@Mabuk:~/Proyectos/NodeOS/node_modules/nodeos-barebones]
 (vagga) > vagga run
> var os = require('os')
undefined
> os.nodeos
'0.0.0'
> process.pid
2
> process.getuid()
0
> process.getgid()
0
```

El poder cargar las capas subsecuentes de
[initramfs](../../../4. descripción informática/3. Implementación/2. initramfs.html) y
[rootfs](../../../4. descripción informática/3. Implementación/3. rootfs.html)
fue solo una cuestión de configurarlas correctamente, no obstante no ha sido por
el momento posible hacer funcionar el sistema completo. La razón de esto es
debido a que NodeOS crea por cada usuario un sistema de archivos
[OverlayFS](https://www.kernel.org/doc/Documentation/filesystems/overlayfs.txt),
el cual no esta soportado en estos momentos en *vagga* puesto que para poder ser
usado por usuarios normales previamente el kernel de Linux debe ser
[parcheado](https://github.com/tailhook/vagga/issues/101#issuecomment-150922680).
Aparte, también han surgido algunos problemas debido por un lado a que *vagga*
habilita por defecto algunos puntos de montaje que entran en conflicto con los
que NodeOS monta durante su arranque, y por el uso del archivo `/proc/cmdline`
del sistema de archivos *procfs*, el cual es usado por NodeOS para detectar la
partición que contiene los directorios de usuarios mediante los parámetros de
arranque del kernel. *vagga* emplea el sistema de archivos *procfs* usado por el
sistema operativo donde esta corriendo, con lo que se esta usando la
configuración del sistema de archivos raíz de éste en vez de la de NodeOS. Este
punto, unido al hecho de que por motivos de seguridad no se pueden cargar
sistemas de archivos externos desde dentro del entorno aislado de *vagga* (para
lo que he propuesto que estos puedan ser definidos en la configuración de
[arranque del propio container](https://github.com/tailhook/vagga/issues/103)),
ha hecho que tenga que modificar el módulo
[nodeos-mount-filesystems](../../4. descripción informática/3. Implementación/7. módulos propios/nodeos-mount-filesystems.html)
para poder aceptar dichos valores como variables de entorno y de esta forma
poder definirlos en la configuración del container, y tener un medio por el que
ignorar los ofrecidos por el `/proc/cmdline` del sistema.

Gracias al uso de *vagga* se ha simplificado la forma de generar imágenes
*Docker* al no ser necesario el uso de permisos de administrador mas que para el
registro de dichas imágenes. Además al poder usar un formato común de las mismas
basado en archivos `tar` y los correspondientes archivos de configuración de
cada plataforma, el mantenimiento de estas se reduce al mínimo.


[^1]: gracias a mi propuesta, *vagga* ya incorpora soporte para usar archivos `tar` locales a partir de la versión [0.4.1](https://github.com/tailhook/vagga/issues/81#issuecomment-147208077).
