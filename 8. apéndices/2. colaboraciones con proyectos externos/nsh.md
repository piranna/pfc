#### nsh

Node.js posee un interprete REPL avanzado con soporte de autocompletado e
histórico de comandos que lo hacen adecuado para su uso de forma interactiva,
pero al no disponer de los comandos básicos de un sistema UNIX hace complejo su
uso como shell del sistema de forma habitual. Por ejemplo, para leer el listado
del directorio actual es necesario ejecutar:

```Javascript
var fs = require('fs')
fs.readdirSync('.')
```

Esto no es adecuado para un uso continuado, haciéndolo incomodo en casos mas
avanzados. Por otro lado, al ser Javascript un lenguaje de alto nivel se pueden
hacer las mismas tareas que en una shell como por ejemplo
[bash](https://www.gnu.org/software/bash) sin necesidad de usar comandos
externos, al poder implementarse los comandos como funciones y mejorar su
rendimiento no solo por ejecutar éstos dentro del mismo proceso que la shell en
lugar de crear uno nuevo por cada comando, sino además por permitir hacer uso de
características de Node.js como es su API de [streams](https://nodejs.org/api/stream.html).

Originariamente, la única forma de interactuar con NodeOS era utilizando la
shell [nsh](https://github.com/groundwater/node-bin-nsh), la cual era bastante
primitiva en cuanto a su funcionalidad y estabilidad. En un principio traté de
hacer que fuera importable y que estuviera basada en el propio REPL de Node.js
de forma que se pudieran escribir scripts en Javascript desde la propia shell,
por lo que [sugerí](https://github.com/joyent/node/issues/9224) que el módulo
REPL fuese genérico al igual que el paquete `cmd` de Python en vez de orientado
únicamente a su uso en interpretes Javascript, pero finalmente he decidido
[reescribir nsh](https://github.com/piranna/nsh) tratando a los scripts de shell
como si fuese código de un lenguaje de programación, de forma que después puedan
reutilizarse los distintos componentes empleados en dicha reescritura para hacer
que pueda usarse directamente el interprete de Node.js como shell del sistema de
forma fácil y amigable (que es realmente el propósito de hacerlo de ésta manera).
Esto también tiene la ventaja de que se podrán usar desde dentro de NodeOS otros
módulos binarios y programas que estén basados en scripts de shell, como son los
sistema de construcción basados en `Makefiles`.

Para dicha reescritura me he basado en el módulo
[shell-parse](https://github.com/grncdr/js-shell-parse), el cual genera un árbol
AST del script bash que después recorro procesando cada uno de sus nodos. Esta
forma de hacerlo es mas óptima que la empleada por las shells clásicas debido a
que éstas implementan su lógica mediante comandos externos y el uso de procesos,
no obstante una vez que estén mas claros cuales son los distintos componentes
necesarios para la creación de dicha shell y el cómo deben funcionar para que
puedan ser fácilmente utilizables desde el interprete REPL de Node.js, se
plantea sustituir en una futura versión su funcionamiento por un transpilador
que convierta los scripts de *bash* a Javascript a nivel de código fuente de
forma que puedan emplearse las estructuras y operadores propios del lenguaje,
haciendo que la ejecución de dichos scripts sean tan rápida como si se hubiesen
escrito nativamente en dicho lenguaje, eliminando la perdida de rendimiento que
supone tener que recorrer y procesar el árbol AST constantemente, y en algunos
casos incluso permitiendo efectuar optimizaciones.

Al estar *nsh* escrito en Javascript se pueden sustituir algunos de los comandos
externos por funciones que se ejecuten internamente aumentando su rendimiento al
no tener que crear nuevos procesos como ocurre en el resto de shells clásicas
incluso en el caso de las que incorporan algunos comandos dentro de si mismas
como es el caso de [busybox](https://www.busybox.net). En este sentido, se ha
decidido crear el módulo [Coreutils.js](../1. módulos propios/coreutils.js.html),
el cual implementa los comandos básicos de un sistema Unix como streams de
objetos, permitiendo usar los datos directamente en vez de tener que ser
parseados y procesados cada vez para poder acceder a ellos. Para que los
comandos externos puedan ser compatibles con este sistema, se ha creado una
clase que envuelve dichos comandos y genera un objeto
[Duplex](https://nodejs.org/api/stream.html#stream_class_stream_duplex) a partir
de su entrada y salida estándar, permitiendo que los comandos externos puedan
ser usados como filtros al igual que cualquiera de las funciones proporcionadas
por *Coreutils.js*. Por último, también se hace uso del módulo
[npm-path](https://github.com/timoxley/npm-path), el cual puede cambiar la
variable de entorno `$PATH` para que incluya la ubicación de todos los binarios
instalados por npm a partir del directorio actual y en todos los anteriores, de
forma que sean fácilmente accesibles para el usuario gracias a este "`$PATH`
dinámico", y al que [corregí un bug](https://github.com/timoxley/npm-path/pull/5)
por el cual se estaban duplicando algunos de los componentes del *$PATH*
generado ya que es posible que algunas de las rutas que añade este módulo ya
estuvieran incluidas antes, como es la ubicación del binario de `node-gyp`.

La reescritura de *nsh* ha sido relativamente fácil principalmente por el hecho
de que todo el parseo de los scripts shell ya estaba hecho por el módulo
*shell-parse* y se ha reducido la tarea a procesar los tokens del árbol AST, no
obstante ha habido algunos problemas con el tratamiento de los streams al tratar
los comandos externos como objetos *Duplex* ya que Node.js 0.12 no admite el uso
de streams sin un descriptor de ficheros asociado cuando se usan para definir la
entrada o salida estándar de un proceso hijo por lo que he tenido que cubrir
dicho proceso y conectar los streams de forma explicita, y también con la salida
estándar al no poder identificarse como un terminal interactivo, lo cual
precisará el que se proporcione a los comandos previamente a su ejecución.
También ha habido problemas con el diseño de la API de los builtins ya que se ha
pretendido que estos puedan ser fácilmente integrados con otros módulos y en
especial con *Coreutils.js* debido a que no tienen una salida de error estándar,
para lo que estoy generando un stream de objetos a partir de los eventos
emitidos de tipo `error` capturándolos mediante el uso de un
[dominio](https://nodejs.org/api/domain.html).

*nsh* hace uso del modulo [async](https://github.com/caolan/async) para definir
el control de flujo de las operaciones, como en el uso de `reduce` para calcular
las redirecciones. Esto permite que todo el código se ejecute de forma asíncrona
y no bloqueante y que sea mucho mas simple de entender. Por ejemplo, el código
para ejecutar los bucles `while` se reduce al siguiente:

```Javascript
var during = require('async').during

var ast2js = require('./index')


function while_loop(item, callback)
{
  during(ast2js.bind(null, item.test),
         ast2js.bind(null, item.body),
         callback)
}


module.exports = while_loop
```

Se puede comprobar que no es necesario ejecutar subprocesos puesto que el
módulo *async* comprueba de forma asíncrona el árbol AST de la condición del
bucle. Del mismo modo, tampoco es necesario el uso de subprocesos para la
substitución de comandos puesto que el árbol AST se procesa de forma normal al
igual que con los comandos normales o las redirecciones, solamente que
definiendo como salida estándar un stream `Writable` que guarde su contenido en
una variable y devolviendo esta como resultado, y guardando una copia de las
variables de entorno y de la ruta actual de forma que luego pueda restituirse el
estado de la shell previo a la ejecución de la substitución de comandos.

Por último, aunque no afecte directamente al funcionamiento de la shell, también
he mejorado el soporte de autocompletado haciendo que muestre como sugerencias
las variables de entorno, y también agrupando los distintos comandos disponibles
según el directorio en el que estén disponibles dentro del `$PATH`. Para esto
último he actualizado las dependencias y modificado el módulo
[lib-pathsearch](https://github.com/piranna/node-lib-pathsearch) para que el
devuelva los distintos ejecutables que coinciden con el patrón buscado separados
[por una cadena vacía](https://nodejs.org/api/readline.html#readline_readline_createinterface_options)
por cada componente del `$PATH`, además de eliminar los que ya estén incluidos
previamente (probablemente debido a un link simbólico, aunque también puede ser
una versión distinta, o en el caso de los ejecutables incluidos dentro de los
módulos de npm debido a una dependencia incompatible con la instalada mas
globalmente) puesto que no estarán accesibles debido a que la ocurrencia
anterior tiene prioridad sobre esta.
