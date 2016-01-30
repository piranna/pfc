#### coreutils.js

Node.js posee un interprete REPL avanzado con soporte de autocompletado e
historico de comandos que lo hacen adecuado como shell interactiva, pero al no
disponer de los comandos básicos de un sistema UNIX hace complejo su uso de
forma habitual. Por ejemplo, para leer el listado del directorio actual es
necesario ejecutar:

```Javascript
var fs = require('fs')
fs.readdirSync('.')
```

Esto no es adecuado para un uso continuado, haciendo incomodo su uso en casos
mas avanzados. Por otro lado, al ser Javascript un lenguaje de alto nivel se
pueden hacer las mismas tareas que en una shell como por ejemplo
[bash](https://www.gnu.org/software/bash) sin necesidad de usar comandos
externos, al poder implementarse los comandos como funciones y mejorar su
rendimiento no solo por ejecutar estos dentro del mismo proceso que la shell en
lugar de crear uno nuevo por cada comando, sino ademas por permitir hacer uso de
caracteristicas de Node.js como es su API de [streams](https://nodejs.org/api/stream.html).

Existen algunas implementaciones de los comandos típicos de UNIX en Javascript,
siendo la mas popular [shelljs](http://shelljs.org). Sin embargo, su
implementación de los comandos tiene algunas limitaciónes y esta enfocada
sólamente a replicar su funcionalidad, por lo que solo sirve para evitar el
ejecutar scripts de shell para rehalizar tareas sencillas pero no facilita su
integración con otros programas escritos en Javascript, teniendo que parsear los
datos en cada etapa al igual que sucederia usando comandos externos.

[coreutils.js](https://github.com/piranna/coreutils.js) por otro lado, al estar
diseñado específicamente para ser usado dentro de una shell interactiva como son
[nsh](../2. colaboraciones con proyectos externos/nsh.html) o el interprete REPL
de Node.js toma un enfoque distinto al crear streams de objetos para cada uno de
los comandos, permitiendo el interconectar los distintos "comandos" entre si
usando la API de streams de Node.js. Ésto no solo hace que dichos streams puedan
facilmente integrarse con otros módulos sino que su rendimiento sea mejor con
grandes conjuntos de datos que usando `Array`s como hacen otras librerias.
Ademas, al ser streams de objetos, los datos ya estan parseados y atomizados y
por tanto no es necesario volver a hacerlo cada vez, solamente acceder a sus
atributos para poder ser procesados.

A los streams se les ha añadido un atributo *type* indicando el tipo de los
objetos dentro del ellos para poder procesarlos mas facilmente al poder tener
una indicación de cuál es el formato de los datos que contienen, de manera
similar a como propone [TermKit](http://acko.net/blog/on-termkit). Ademas,
tambien se añade a cada uno de estos objetos un método
[inspect](https://nodejs.org/api/util.html#util_custom_inspect_function_on_objects)
personalizado de forma que se muestre al imprimirlos por pantalla un resultado
similar al de sus comandos equivalentes en UNIX en lugar de mostrar los datos de
los objetos en bruto.
