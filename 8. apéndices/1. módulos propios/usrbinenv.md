#### usrbinenv

Una de las maximas de NodeOS es que todo el espacio de usuario este escrito en
Javascript hasta donde sea posible, lo cual incluye a las utilerias del sistema.
Una de las mas usadas es [/usr/bin/env](https://es.wikipedia.org/wiki/Env),
empleada comunmente en los [shebang](https://es.wikipedia.org/wiki/Shebang) para
para definir el interprete con el que debe ser ejecutados un script de forma
independiente a donde este ubicado. En un principio se hizo uso de el comando
incluido dentro de [coreutils](http://www.gnu.org/software/coreutils), pero
aparte de estar hecho en C, el tamaño de su descarga, las dependencias
necesarias para su compilacion y el tiempo necesario de esta al no poder
[compilar solo dicho comando](http://lists.gnu.org/archive/html/coreutils/2014-12/msg00014.html)
no lo hacian adecuado para su uso en NodeOS, por lo que decidi hacer una
[implementacion](https://github.com/piranna/usrbinenv) del mismo en Javascript.

Al ser un componente que ha de estar permanentemente en memoria se ha intentado
reducir su tamaño al máximo, lo cual incluye el limitar el uso de dependencias
tratando de usar solamente modulos de la libreria estanda de Node.jsr. Para ello
se ha prescindido del uso de un parseador de parametros externo usando uno hecho
manualmente, y tambien se hizo uso en un principio la funcion
[spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
para lanzar nuevos procesos. Esto ocasiono un gran consumo de memoria al
necesitar dos instancias de Node.js por cada ejecutable (una para '/usr/bin/env'
y otra para el script a ejecutar, con un tamaño de unos 10mb cada una), por lo
que aproveche la circunstancia de que el propio comando `/usr/bin/env` ya era un
script de Javascript para reusar su instancia de Node.js, con lo que ademas se
ahorra el tiempo de cargar una nueva instancia. Hacerlo de esta manera tiene el
inconveniente de que no se pueden usar algunos metodos que permiten que un mismo
script pueda usarse como comando y como libreria simultaneamente, como son
`!module.parent` o `require.main === module`, tan habituales en otros lenguajes
como es el caso de Python. Esto se soluciona emplendo scripts independientes
para la libreria y para el comando en si, que ademas es lo que promueve la
especificacion del archivo `package.json` de `npm` mediante el uso de los campos
[main](https://docs.npmjs.com/files/package.json#main) y
[bin](https://docs.npmjs.com/files/package.json#bin), respectivamente.

Sin embargo, en el caso de ejecutar comandos que no fuesen scripts de Node.js
se seguiria desperdiciando memoria al mantener una instancia de Node.js
inutilizada, por lo que la única solucion es hacer uso de la llamada al sistema
[execvp](http://linux.die.net/man/3/execvp) para que se sustituya el contenido
del proceso en memoria, tal y como hace la implementacion en C del comando `env`.
Node.js no proporciona una API para su uso, siendo proporcionada por el modulo
[kexec](https://github.com/jprichardson/node-kexec). El uso de un modulo externo
requiere un acceso mas al disco ralentizando el inicio de las aplicaciones,
ademas de un consumo extra de memoria al estar NodeOS basado en initram. En este
sentido planteé la posibilidad de integrar dicho modulo dentro del
[ejecutable de Node.js](https://github.com/nodejs/node-v0.x-archive/issues/14354),
pero se mostro como una solucion compleja, ademas de que la diferencia en el
tiempo de acceso era despreciable. Esto unido al hecho de que dentro de la
comunidad [existen](https://github.com/nodejs/NG/issues/18)
[varias](https://r.va.gg/2014/06/why-i-dont-use-nodes-core-stream-module.html)
[voces](https://github.com/nodejs/NG/issues/9) promoviendo el minificar la
libreria estandar de Node.js sacandola a modulos externos entre otras razones
por representar un [menor tamaño](https://github.com/nodejs/node/issues/2948)
del binario de Node.js y un menor consumo de memoria me convencieron para usar
el modulo tal como esta de forma externa. No obstante, el modulo hacia uso de
[node-gyp](https://github.vom/nodejs/node-gyp) como dependencia, lo cual
aumentaba su tamaño hasta los 9mb. Puesto que `node-gyp` ya esta incluido desde
hace varias versiones dentro de `npm` no es necesario definirlo como dependencia,
por lo que [modifique el modulo](https://github.com/jprichardson/node-kexec/pull/24)
para eliminarla sin mayores problemas al respecto.

Las normas de estilo indican que para el *shebang* debe usarse `/usr/bin/env
node` en los scripts de Node.js. Sin embargo al ser este modulo un script de
Node.js esto obliga a usar directamente la ubicacion del interprete, que en el
caso de NodeOS es `/bin/node`. Esto podria dar problemas en otros sistemas en
los que el binario de Node.js no este en dicha ubicacion (por ejemplo, Ubuntu lo
aloja en `/usr/bin/node`), pero al estar este modulo claramente enfocado a
NodeOS dicho problema desaparece. Tambien al estar hecho como un modulo de
Node.js se instalara el ejecutable dentro de `/bin`, por lo que para que los
demas scripts puedan seguir usando la ubicacion estandar `/usr/bin/env` he hecho
un link simbolico en su lugar. Por ultimo, puesto que en NodeOS se busca entre
otras cosas crear un sistema de archivos limpio y claro de cara a los usuarios y
por esta razon no usarse el directorio `/usr`, este se ha eliminado despues de
crear el sistema de archivos *OverlayFS* de forma que el directorio `/usr` no
sea visible aunque puede seguir accediendose a su contenido, en concreto para
poder ejecutarse el citado `/usr/bin/env`. No obstante, desconozco si este
comportamiento es una caracteristica de OverlayFS o un bug del mismo, aunque
considero que es especialmente util para casos de uso como éste.
