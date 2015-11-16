#### DebugFS

NodeOS utiliza el `UID` y `GID` del directorio del usuario para definir los
permisos con los que se ejecutaran los procesos de dicho usuario. El problema
esta en que al generar la imagen de partición de usuarios, estos normalmente no
se pueden cambiar si no es montando dicha imagen, lo cual requiere permisos de
administrador. Lo ideal es poder hacer los cambios directamente sobre la imagen
de partición sin montarla, lo cual la única herramienta capaz de hacer dichos
cambios es [debugfs](http://linux.die.net/man/8/debugfs), por lo que he creado
un módulo de Node.js que hace uso de ella.

[DebugFS](https://github.com/piranna/DebugFS) esta diseñado en dos partes, la
clase que envuelve al comando `debugfs`, y las funciones de alto nivel que
emulan el comportamiento de los comandos de shell. En este sentido, la clase
simplemente implementa metodos que internamente ejecutan el comando `debugfs`
pasandole como parametros la operación a ejecutar sobre la imagen de partición,
y despues parseando los resultados para que sean acordes a los ofrecidos por la
API de Node.js, como por ejemplo en el formato de las estadisticas de los
archivos.

Respecto a los comandos de shell, solo se ha implementado
[chown](http://linux.die.net/man/1/chown), al ser el único necesitado para
arreglar los permisos de la partición de usuarios. El comando ofrece las mismas
opciones que el `chown` de UNIX, solo requiriendo que se le pase la ruta al
dispositivo con el sistema de archivos a modificar como primer parametro. Una
limitación que tiene este comando es que solo se puede aplicar a directorios,
puesto que `debugfs` no ofrece una forma facil de obtener los datos de un inodo
excepto por la ofrecida por el comando `ls` al listar directorios, el cual no se
puede aplicar a inodos que no sean de directorios, siendo la única manera de
poder distinguirlos porque su tamaño no esta definido. Se espera poder arreglar
este problema en el futuro para hacer que el módulo sea mas generico.
