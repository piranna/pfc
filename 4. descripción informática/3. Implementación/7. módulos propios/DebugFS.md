#### DebugFS

La partición de usuarios es creada mediante el uso de `genext2fs --squash`, que
crea la imagen eliminando todos los permisos y poniendo como usuario a *root*
(`UID` 0). Sin embargo, NodeOS utiliza el `UID` y `GID` del directorio del
usuario para definir los permisos con los que se ejecutarán los procesos de
dicho usuario, por lo que deben de ser cambiados acorde a estos. El problema es
que una vez generada, estos no se pueden cambiar si no es montando dicho sistema
de archivos, lo cual requiere permisos de administrador. Lo ideal sería poder
hacer los cambios directamente sobre la imagen de partición sin necesidad de
montarla, pero la única manera posible que se ha encontrado para hacer esto es
mediante el uso del comando [debugfs](http://linux.die.net/man/8/debugfs), para
lo que se ha creado un módulo de Node.js que permita usarla de forma programada.

El módulo [DebugFS](https://github.com/piranna/DebugFS) está diseñado en dos
partes: la clase que envuelve e interactúa con el comando `debugfs`, y las
funciones de alto nivel que implementan el comportamiento que se esperaría de
los comandos de shell correspondientes a las operaciones a aplicar. En este
sentido, la clase simplemente implementa métodos que luego internamente ejecutan
el comando `debugfs`, pasándole como parámetros la operación a ejecutar sobre la
imagen de partición, y después parseando los resultados para que sean acordes a
los ofrecidos por la API de Node.js, y mas concretamente respecto al uso de los
metadatos de los archivos.

Respecto a los comandos de shell, sólo se ha implementado
[chown](http://linux.die.net/man/1/chown) por ser el único necesitado para
arreglar los permisos de la partición de usuarios. El comando ofrece las mismás
opciones que el comando `chown` de UNIX, solo requiriendo que se le pase la ruta
al dispositivo con el sistema de archivos a modificar como primer parámetro. Una
limitación que tiene este comando es que sólo se puede aplicar a directorios,
puesto que `debugfs` no ofrece una forma fácil de obtener los datos de un inodo,
excepto por la ofrecida por el comando `ls` al listar directorios[^1]. Dicho
comando no se puede aplicar a inodos que no sean de directorios, siendo la única
manera de poder distinguirlos del resto de entradas el hecho de que su tamaño no
está definido. Se espera poder arreglar este problema en el futuro para hacer
que el funcionamiento del módulo sea más genérico y próximo al del comando
*chown* de los sistemas UNIX.

No obstante, puesto que se emplea un comando externo (el cual tiene que leer y
escribir de forma síncrona en la imagen de la partición), este paso es varios
ordenes de magnitud más lento que si la partición estuviera montada (de forma
similar a como ocurre con las [mtools](http://www.gnu.org/software/mtools) al
trabajar con sistemas de archivos de tipo VFAT), por lo que se plantea que en el
futuro se sustituya el uso de `debugfs` por un módulo que permita la
manipulación de sistemas de archivos en formato `ext4` de forma nativa.


[^1]: el comando `stat`, aunque muestra toda la información del inodo, muestra los datos en un formato esquematizada difícil de parsear, a diferencia de `ls` que proporciona un modo por el cual los datos son mostrados de forma que sean fácilmente parseados y usados por comandos externos.
