#### nodeos-init

Durante el arranque, el kernel de Linux ejecuta el programa ubicado en `/init`
una vez que ha terminado de cargarse, convirtiéndose en el primer proceso del
sistema (`PID 1`). En sistemas UNIX tradicionales este proceso (también conocido
como *demonio del sistema*) se suele encargar de varias tareas, como por ejemplo
enviar la señal de terminación al resto de procesos cuando el sistema se esta
apagando, pero en su esencia su labor principal es actuar de "red de seguridad"
para recoger procesos zombie y evitar que puedan llegar a provocar un *kernel
panic*. La labor de [nodeos-init](https://github.com/piranna/nodeos-init) es
justamente esta, delegando cualquier otra tarea a otros ejecutables, como es
[nodeos-mount-filesystems](nodeos-mount-filesystems.md) en el caso de NodeOS
para montar la partición de usuarios e inicializar el resto del sistema. Esto
tiene la ventaja adicional de disminuir el consumo de memoria al no requerir el
uso de una instancia de v8 que de otra forma estaría inutilizada la mayor parte
del tiempo.

*nodeos-init* además también detecta cuando no hay mas procesos ejecutándose en
el sistema para proceder a apagar automáticamente el sistema, lo cual es
especialmente útil cuando se esta ejecutando directamente un interprete REPL de
Node.js (por ejemplo ante fallos de arranque o cuando se hace uso de la capa
[nodeos-barebones](../../5. descripción informática/3. Implementación/2. barebones.html)).
Para ello, se bloquean todas las señales del proceso y se espera a recibir
información de que ha terminado un proceso hijo mediante la señal `SIGCHLD`,
para después procesarlos mediante [waitpid](http://linux.die.net/man/2/waitpid)
hasta que esta función devuelva un error notificando que no hay mas procesos.
También se le indica al kernel que bloquee la combinación de teclas
`Ctrl-Alt-Del` de forma que pueda procesarla *nodeos-init* mediante la señal
`SIGINT` y proceder a hacer un apagado limpio y posterior reinicio del sistema.
Finalmente, también procede a montar el sistema de archivos *devtmpfs* antes de
ejecutar el proceso *init* asociado (por defecto `/sbin/init`) debido a que es
necesario por parte de las últimas versiones de Node.js para poder ejecutarse
correctamente.

[vagga](vagga.md) por defecto no requiere del uso de un `PID 1` dentro de los
contenedores LXC puesto que ejecuta el suyo propio cuyo comportamiento es
similar al de *nodeos-init*, por lo que NodeOS no lo incluye. Mediante el uso de
[pid1mode](http://vagga.readthedocs.org/en/latest/commands.html?highlight=pid1mode#opt-pid1mode)
se puede definir que el proceso a ejecutar es *init-like* (como *nodeos-init*) y
ejecutarlo directamente como `PID 1`, no obstante en estos momentos dicho
soporte se encuentra [desactivado](https://github.com/tailhook/vagga/issues/86),
con lo que en el futuro es posible que vuelva a activarse su uso de forma que el
comportamiento del sistema sea mas homogéneo entre plataformas al usar el mismo
ejecutable como `PID 1` y por tanto evitar problemas por diferencias entre ellas.
