#### node-century

Durante el arranque, el kernel de Linux ejecuta el programa ubicado en `/init`
una vez que ha terminado de cargarse, convirtiendose en el primer proceso del
sistema (`PID 1`). En sistemas UNIX tradicionales este proceso (también conocido
como *demonio del sistema*) se suele encargar de varias tareas, como por ejemplo
enviar la señal de terminación al resto de procesos cuando el sistema se esta
apagando, pero en su esencia su labor principal es actuar de "red de seguridad"
para recoger procesos zombie y evitar que puedan llegar a provocar un *kernel
panic*. La labor de [century](https://github.com/groundwater/node-century) es
justamente esta, delegando cualquier otra tarea a otros ejecutables, como es
[nodeos-mount-filesystems](../1. módulos propios/nodeos-mount-filesystems.html)
en el caso de NodeOS para montar la partición de usuarios e inicializar el resto
del sistema.

Las APIs de Node.js sólo permiten controlar procesos hijo que haya empezado él
mismo, por lo que para poder recoger todos los procesos zombie del sistema
(incluso los que no sean hijos directos suyos) *century* implementa un módulo
compilado que hace uso de [waitpid](http://linux.die.net/man/3/waitpid), e
iterativamente comprueba cada 3 segundos si ha habido procesos nuevos para ir
eliminandolos correctamente y limpiandolos del sistema.

[vagga](vagga.md) por defecto no requiere del uso de un `PID 1` dentro de los
contenedores LXC puesto que ejecuta el suyo própio cuyo comportamiento es
similar al de *century*, por lo que NodeOS no lo incluye. Mediante el uso de
[pid1mode](http://vagga.readthedocs.org/en/latest/commands.html?highlight=pid1mode#opt-pid1mode)
se puede definir que el proceso a ejecutar es *init-like* (como *century*) y
ejecutarlo directamente como `PID 1`, no obstante en estos momentos dicho
soporte se encuentra [desactivado](https://github.com/tailhook/vagga/issues/86),
con lo que en el futuro es posible que vuelva a activarse su uso de forma que el
comportamiento del sistema sea mas homogeneo entre plataformas.
