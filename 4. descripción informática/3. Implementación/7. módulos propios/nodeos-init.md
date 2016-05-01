#### nodeos-init

Durante el arranque, el kernel de Linux ejecuta el programa ubicado en `/init`
una vez ha terminado de cargarse, convirtiéndose en el primer proceso del
sistema (`PID 1`). En sistemas UNIX tradicionales este proceso (también conocido
como *demonio del sistema*) suele encargarse de varias tareas, como enviar la
señal de terminación al resto de procesos cuando el sistema se está apagando,
pero su labor principal es actuar de "red de seguridad" para recoger procesos
huerfanos y evitar que puedan llegar a provocar un *kernel panic*. La labor de
[nodeos-init](https://github.com/piranna/nodeos-init) es justamente esta,
delegando cualquier otra tarea en otros ejecutables, como es
[nodeos-mount-filesystems](nodeos-mount-filesystems.md) en el caso de NodeOS
para montar la partición de usuarios e inicializar el resto del sistema. Ello
tiene la ventaja adicional de disminuir el consumo de memoria al no requerir una
instancia de v8 que de otra forma estaría inutilizada la mayor parte del tiempo.

*nodeos-init* además también detecta cuando no hay más procesos ejecutándose en
el sistema para proceder a apagar automáticamente el mismo, algo especialmente
útil cuando se está ejecutando directamente un intérprete REPL de Node.js (por
ejemplo, ante fallos de arranque o cuando se hace uso de la capa
[nodeos-barebones](../../4. descripción informática/3. Implementación/2. barebones.html)).
Para ello, se bloquean todas las señales del proceso y se espera a recibir
información de que ha terminado un proceso hijo mediante la señal `SIGCHLD`,
para después procesarlos mediante [waitpid](http://linux.die.net/man/2/waitpid)
hasta que esta función devuelva un error notificando que no hay más procesos.
También se le indica al kernel que bloquée la combinación de teclas
`Ctrl-Alt-Del` de forma que pueda procesarla *nodeos-init* mediante la señal
`SIGINT` y proceder a hacer un apagado limpio y posterior reinicio del sistema.
Finalmente, también procede a montar el sistema de archivos *devtmpfs* antes de
ejecutar el proceso *init* asociado (por defecto `/sbin/init`), debido a que es
necesario por parte de las últimas versiones de Node.js para ejecutarse
correctamente.

[vagga](../../../7. apéndices/1. colaboraciones con proyectos externos/vagga.html),
por defecto, no requiere del uso de un `PID 1` dentro de los contenedores LXC ya
que ejecuta el suyo propio. Su comportamiento es similar al de *nodeos-init*,
por lo que NodeOS no lo incluye. Mediante el uso de
[pid1mode](http://vagga.readthedocs.org/en/latest/commands.html?highlight=pid1mode#opt-pid1mode)
se puede definir que el proceso a ejecutar es *init-like* (como *nodeos-init*) y
ejecutarlo directamente como `PID 1`; no obstante, en estos momentos dicho
soporte se encuentra [desactivado](https://github.com/tailhook/vagga/issues/86),
por lo que en el futuro es posible que vuelva a activarse su uso de forma que el
comportamiento del sistema sea más homogéneo entre plataformas, ya que usaría el
mismo ejecutable como `PID 1` y evita, por tanto, problemas por diferencias
entre ellas.
