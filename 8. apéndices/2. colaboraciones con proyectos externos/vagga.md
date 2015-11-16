#### vagga

La arquitectura minimalista de NodeOS ofrece unas claras ventajas para ser usado
como sistema operativo de servidores cloud. Dentro de este entorno estan ganando
popularidad los contenedores [LXC](https://linuxcontainers.org), y en especial
el administrador [Docker](https://www.docker.com), el cual permite controlar las
aplicaciones aisladas del resto del sistema y poder cambiar de proveedor de
servicios facilmente.

Teniendo esto en mente, los primeros desarrollos del proyecto estaban basados en
él, y de hecho se hacia un uso extensivo de las librerias propias de Ubuntu del
sistema donde estaba generando, lo cual normalmente no daba ningun problema
puesto que el sistema operativo de los sistemas Docker en internet suelen estar
basados en Ubuntu. Sin embargo, decidi centrarme en poder ejecutarlo bajo
[QEmu](http://qemu.org) por dos razones:

* mis conocimientos de como funciona Docker eran escasos en comparación con QEmu,
  con el cual ya habia experimentado anteriormente
* y por otro que al ser QEmu un emulador de ordenador completo, una vez NodeOS
  funcionara correctamente en él seria relativamente facil hacer que funcionara
  sobre hardware real, lo cual seria un gran paso de cara a su portabilidad y a
  que fuese auto-contenido.

Sin embargo, Docker esta diseñado para ser ejecutado como servicio del sistema y
con permisos de administrador, lo cual es un problema tal como esta diseñado el
sistema de construcción de NodeOS, y aunque se puede configurar para permitir su
uso mediantes usuarios normales, requiere de un paso extra por parte del
desarrollador, por lo que finalmente descarte su uso y en su lugar decidi usar
[vagga](https://github.com/tailhook/vagga), el cual hace uso de contenedores LXC
en espacio de usuario.Esto evita la necesidad de tener permisos de administrador
y ademas esta diseñado para que sea compatible tanto con Docker como con
[Vagrant](https://www.vagrantup.com) (una herramienta para la creación y
configuración de entornos de desarrollo virtualizados, similar a Docker en
cuanto a objetivos pero basado en maquinas virtuales), permitiendo que generar
imagenes compatibles con los tres sistemas a la vez.

El uso de *vagga* ha dado bastantes problemas, en parte debido a que es un
proyecto actualmente en desarrollo. En primer lugar, el formato usado por el
kernel de Linux para el initram es el tipo de archivo `cpio` en su formato
`newc`, mientras que tanto *Docker* como *vagga* solo soportan `tar` para
inicializar su sistema de archivos base (y en concreto, Docker solo soporta el
formato `ustar`). Para poder generarlo siguiendo el mismo proceso usado para
generar el sistema de archivos *initramfs* del kernel de Linux a partir de un
archivo en text plano, decido convertir el archivo `cpio` geneerado a `tar`. El
problema esta en que a pesar de que tanto el comando `cpio` como `tar` soportan
ambos tipos de archivos, ninguno proporciona un modo para conversion entre ellos,
requiriendo primero desempaquetarlos para despues volver a empaquetarlos en el
nuevo formato. Esto podria acarrear problemas de permisos ademas de ser mas
lento, por lo que decidí convertirlos dinamicamente usando los modulos
[cpio-stream](cpio-stream.html) y [tar-stream](tar-stream.html) de Node.js.

Una vez que consegui generar el archivo `tar` con el contenido de la capa
[barebones](../../../5. descripción informática/3. Implementación/1. barebones.md)
de forma que pueda ser usada tanto por *Docker* como por *vagga*, procedí a
ejecutarla por este último. Para ello configuré el archivo `vagga.yaml` para que
inicialice el contenido del sistema de archivos mediante el comando
[!Tar](http://vagga.readthedocs.org/en/latest/build_commands.html#generic-installers),
descubriendo que no funciona con archivos locales sino solo con
[archivos alojados remotamente](https://github.com/tailhook/vagga/issues/81)
(aunque gracias a mi propuesta ya incorpora dicho soporte a partir de la versión
[0.4.1](https://github.com/tailhook/vagga/issues/81#issuecomment-147208077)),
por lo que para las pruebas decidi usar un servidor HTTP local. Vagga genera por
defecto los directorios `/bin` y `/lib`, el punto de montaje para `/dev` y
tambien añade el dispositivo `/dev/console`, entrando en conflicto con los
incluidos en el initramfs de NodeOS. Para solucionarlo simplemente detecto el
entorno para el que estoy generando el sistema y en caso de estar produciendo
una imagen para un contenedor LXC no añado dichas entradas para poder generar el
sistema de archivos correctamente, por lo que despues de esto y una vez que se
resolvieron [algunos problemas](https://github.com/tailhook/vagga/issues/85) en
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
[initramfs](../../../5. descripción informática/3. Implementación/2. initramfs.html) y
[rootfs](../../../5. descripción informática/3. Implementación/3. rootfs.html)
fue solo una cuestion de configurarlas correctamente, no obstante no ha sido por
el momento posible hacer funcionar el sistema completo. La razon de esto es
debido a que NodeOS crea por cada usuario un sistema de archivos
[OverlayFS](https://www.kernel.org/doc/Documentation/filesystems/overlayfs.txt),
el cual no esta soportado en estos momentos en *vagga* puesto que para poder ser
usado por usuarios normales previamente el kernel de Linux debe ser
[parcheado](https://github.com/tailhook/vagga/issues/101#issuecomment-150922680).
Aparte, tambien han surgido algunos problemas debido por un lado a que *vagga*
habilita por defecto algunos puntos de montaje que entran en conflicto con los
que NodeOS monta durante su arranque y por el uso del archivo `/proc/cmdline`
del sistema de archivos *procfs*, el cual es usado por NodeOS para detectar el
sistema de archivos que contiene los directorios de usuarios mediante los
parametros de arranque del kernel. *vagga* hace uso del *procfs* usado por el
sistema operativo donde esta corriendo, con lo que se esta usando la
configuracion del sistema de archivos raiz de este en vez de la de NodeOS. Este
punto unido al hecho de que por motivos de seguridad no se pueden cargar
sistemas de archivos externos desde dentro del entorno aislado de *vagga* (para
lo que he propuesto que estos puedan ser definidos en la configuracion de
[arranque del propio container](https://github.com/tailhook/vagga/issues/103)),
por lo que he tenido que módificar el modulo
[nodeos-mount-filesystems](../1. módulos propios/nodeos-mount-filesystems.html)
para poder aceptar dichos valores como variables de entorno y de esta forma
poder definirlos en la configuracion del container y tener un medio por el que
ignorar los ofrecidos por el `/proc/cmdline` del sistema.

Gracias al uso de *vagga* se ha simplificado la forma de generar imagenes
*Docker* al no ser necesario el uso de permisos de administrador mas que para el
registro de dichas imagenes. Ademas al poder usar un formato comun de las mismas
basado en archivos `tar` y los correspondientes archivos de configuracion de
cada plataforma, el mantenimiento de las mismas se reduce al minimo.
