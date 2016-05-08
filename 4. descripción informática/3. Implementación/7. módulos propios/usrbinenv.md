#### usrbinenv

Una de las máximas de NodeOS es que todo el espacio de usuario esté escrito en
Javascript hasta donde sea posible, lo cual incluye a las utilerías del sistema.
Una de las más usadas es [/usr/bin/env](https://es.wikipedia.org/wiki/Env),
empleada comúnmente en los [shebang](https://es.wikipedia.org/wiki/Shebang) para
definir el intérprete con el que deben ser ejecutados los scripts de forma
independiente a donde esté ubicado. En un principio se hizo uso del comando
incluido dentro de [coreutils](http://www.gnu.org/software/coreutils), pero
aparte de estar hecho en C, debido al tamaño de su descarga, las dependencias
necesarias para su compilación y el tiempo necesario de esta al no poder
[compilar sólo dicho comando](http://lists.gnu.org/archive/html/coreutils/2014-12/msg00014.html)
no lo hacían adecuado para su uso en NodeOS, por lo que se decidió hacer una
[implementación](https://github.com/piranna/usrbinenv) del mismo en Javascript.

##### Ejecución de scripts de Node.js

Al ser un componente que ha de estar permanentemente en memoria se ha intentado
reducir su tamaño al máximo, lo cual incluye el limitar el uso de dependencias
tratando de usar solamente módulos de la librería estándar de Node.js. Para ello
se ha prescindido del uso de un parseador de parámetros externo incluyendo uno
hecho manualmente *ad-hoc*, y también se hizo uso en un principio de la función
[spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
incluida en Node.js para lanzar nuevos procesos. Sin embargo, esto ocasionó un
gran consumo de memoria al necesitar dos instancias de Node.js por cada ejecución
(una para `/usr/bin/env` y otra para el script a ejecutar), con un tamaño de unos
[10mb](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options)
cada una), por lo que aproveché la circunstancia de que el propio comando
`/usr/bin/env` ya era por si mismo un script de Javascript para reusar su
instancia de Node.js, con lo que además se ahorra el tiempo de crear una nueva.
Hacerlo de esta manera tiene el inconveniente de que no se pueden usar algunos
mecanismos que permiten que un mismo script pueda usarse como comando y como
librería simultáneamente, como son comprobar `require.main === module` o
`!module.parent`, habituales en otros lenguajes como es el caso de Python. Esto
se puede solucionar empleando scripts independientes para la librería y para el
ejecutable, que además es lo que promueve la especificación del archivo
`package.json` de `npm` mediante el uso de los campos
[main](https://docs.npmjs.com/files/package.json#main) y
[bin](https://docs.npmjs.com/files/package.json#bin), respectivamente.

##### Ejecución de binarios externos

Sin embargo, en el caso de ejecutar comandos que no fuesen scripts de Node.js
se seguiría desperdiciando memoria al mantener una instancia de Node.js
inutilizada, por lo que la única solución es hacer uso de la llamada al sistema
[execvp](http://linux.die.net/man/3/execvp) para que se sustituya el contenido
del proceso en memoria, tal y como hace la implementación en C del comando `env`.
Node.js no proporciona una API para su uso por su ausencia en Windows, siendo
proporcionada por el módulo [kexec](https://github.com/jprichardson/node-kexec).
El uso de un módulo externo requiere un acceso más al disco ralentizando el
inicio de las aplicaciones, además de un consumo extra de memoria al estar
NodeOS basado en initram. En este sentido, se planteó la posibilidad de integrar
dicho módulo en tiempo de compilación dentro del propio
[ejecutable de Node.js](https://github.com/nodejs/node-v0.x-archive/issues/14354),
pero se mostró como una solución compleja, además de que la diferencia en el
tiempo de acceso sería despreciable. Esto unido al hecho de que dentro de la
comunidad de Node.js [existen](https://github.com/nodejs/NG/issues/18)
[varias](https://r.va.gg/2014/06/why-i-dont-use-nodes-core-stream-module.html)
[voces](https://github.com/nodejs/NG/issues/9) promoviendo el minificar la
librería estándar de Node.js haciendo uso de módulos externos por representar un
[menor tamaño del binario de Node.js](https://github.com/nodejs/node/issues/2948)
y un menor consumo de memoria, hizo decantarse por usar el módulo tal como esta
de forma externa. No obstante, el módulo estaba haciendo uso directamente de
[node-gyp](https://github.vom/nodejs/node-gyp) como dependencia, lo cual
aumentaba su tamaño hasta los 9mb. Puesto que `node-gyp` ya está incluido desde
hace varias versiones dentro de `npm` no es necesario definirlo como dependencia,
por lo que [se ha eliminado](https://github.com/jprichardson/node-kexec/pull/24)
dicha dependencia sin mayores problemas al respecto.

##### Ubicación del comando

Las normas de estilo indican que para el *shebang* debe usarse `/usr/bin/env
node` en los scripts de Node.js. Sin embargo, al ser este módulo por si mismo un
script de Node.js, esto obliga a usar directamente la ubicación del intérprete,
que en el caso de NodeOS es `/bin/node`. Esto podría dar problemas en otros
sistemas en los que el binario de Node.js no esté en dicha ubicación (por
ejemplo, Ubuntu lo aloja en `/usr/bin/node`), pero al estar este módulo
principalmente enfocado a NodeOS dicho problema desaparece.

Al estar hecho como un módulo de Node.js se instalará el ejecutable dentro de
`/bin`, por lo que para que los demás scripts puedan seguir usando la ubicación
estándar `/usr/bin/env` se ha hecho un enlace simbólico en su lugar. Después,
puesto que en NodeOS se busca entre otras cosas crear una jerarquía de archivos
limpia y claro de cara a los usuarios, y por esta razón el no requerir usarse el
directorio `/usr` entre otros, éste se ha eliminado después de crear el sistema
de archivos *OverlayFS* de forma que el directorio `/usr` no sea visible, aunque
puede seguir accediéndose a su contenido en concreto para poder ejecutarse el
citado `/usr/bin/env`. Este comportamiento es una característica propia de
OverlayFS conocida como
[directorio opaco](https://docs.docker.com/engine/userguide/storagedriver/overlayfs-driver/#container-reads-and-writes-with-overlay).
