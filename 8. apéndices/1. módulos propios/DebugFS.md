#### DebugFS

La partición de usuarios es creada mediante el uso de `genext2fs --squash`, el
cual crea la imagen eliminando todos los permisos y poniendo como usuario a
*root* (`UID` 0). Sin embargo, NodeOS utiliza el `UID` y `GID` del directorio
del usuario para definir los permisos con los que se ejecutaran los procesos de
dicho usuario, por lo que deben de ser cambiados acordes a estos. El problema es
que una vez generada normalmente estos no se pueden cambiar si no es montando
dicho sistema de archivos, lo cual requiere permisos de administrador. Lo ideal
seria poder hacer los cambios directamente sobre la imagen de partición sin
necesidad de montarla, lo cual sólo es posible mediante el uso de la herramienta
[debugfs](http://linux.die.net/man/8/debugfs), por lo que he creado un módulo de
Node.js para hacer uso de ella de forma programada.

El módulo [DebugFS](https://github.com/piranna/DebugFS) esta diseñado en dos
partes, la clase que envuelve e interactua con el comando `debugfs`, y las
funciones de alto nivel que implementan el comportamiento que se esperaria de
los comandos de shell correspondientes a las operaciones que queremos aplicar.
En este sentido, la clase simplemente implementa metodos que internamente
ejecutan el comando `debugfs` pasandole como parametros la operación a ejecutar
sobre la imagen de partición y despues parseando los resultados para que sean
acordes a los ofrecidos por la API de Node.js, como por ejemplo en el caso de
los metadatos de los archivos.

Respecto a los comandos de shell, sólo se ha implementado
[chown](http://linux.die.net/man/1/chown) al ser el único necesitado para
arreglar los permisos de la partición de usuarios. El comando ofrece las mismas
opciones que el comando `chown` de UNIX, solo requiriendo que se le pase la ruta
al dispositivo con el sistema de archivos a modificar como primer parametro. Una
limitación que tiene este comando es que sólo se puede aplicar a directorios,
puesto que `debugfs` no ofrece una forma fácil de obtener los datos de un inodo
excepto por la ofrecida por el comando `ls` al listar directorios[^1], el cual
no se puede aplicar a inodos que no sean de directorios, siendo la única manera
de poder distinguirlos del resto de entradas puesto que su tamaño no esta
definido. Se espera poder arreglar este problema en el futuro para hacer que el
módulo sea mas generico.


[^1]: el comando `stat` muestra los datos de una forma esquematizada dificil de parsear, a diferencia de `ls` que proporciona un modo por el cual muestra los datos de forma que sean facilmente usados por comandos externos.
