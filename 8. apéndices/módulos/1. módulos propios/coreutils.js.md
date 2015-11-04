#### coreutils.js

Node.js posee un interprete REPL avanzado con soporte de autocompletado e
historico de comandos que lo hacen adecuado como shell interactiva, pero al no
disponer de los comandos basicos de un sistema UNIX hace complejo su uso de
forma habitual. Por ejemplo, para leer el listado del directorio actual es
necesario hacer:

```Javascript
var fs = require('fs')
fs.readdirSync('.')
```

Aunque cumple su funcion, no es adecuado para un uso continuado, haciendo muy
incomodo su uso en casos mas avanzados. Por otro lado, al ser Javascript un
lenguaje de alto nivel se pueden hacer las mismas tareas que con una shell
[bash](https://www.gnu.org/software/bash) sin necesidad de usar comandos
externos, al poder implementarse las mismas tareas facilmente como funciones,
mejorando su rendimiento no solo por no requerir la ejecucion de un nuevo
proceso por cada comando sino por poder hacer uso de caracteristicas propias de
Node.js como es la API de [streams](https://nodejs.org/api/stream.html).

Existen algunas implementaciones de los comandos tipicos de UNIX en Javascript,
siendo la mas popular [shelljs](http://shelljs.org). Sin embargo, su
implementación de los comandos es incompleta y esta enfocada solamente replicar
la funcionalidad de estos como funciones Javascript, por lo que solo sirve para
evitar el ejecutar scripts shell en comandos sencillos pero no facilita su
integración con otros scripts Javascript teniendo que parsear los datos en cada
etapa al igual que sucederia usando comandos externos.

[coreutils.js](https://github.com/piranna/coreutils.js) al estar diseñado
especificamente para ser usado dentro de un shell interactivo como
[nsh](../2. colaboraciones con proyectos externos/nsh.html) o el interprete REPL
de Node.js, toma un enfoque distinto creando streams de objetos para cada uno de
los comandos, permitiendo el interconectar los distintos "comandos" entre si
usando la API de streams de Node.js. Esto no solo hace que dichos streams puedan
facilmente integrarse con otros modulos sino que su rendimiento sea mejor con
grandes conjuntos de datos que usando `Array`s como hacen otras librerias.
Ademas, al ser streams de objetos, los datos ya estan parseados y atomizados y
por tanto no es necesario volver a hacerlo cada vez, solamente acceder a sus
atributos para poder ser procesados.

A los streams se les ha añadido un atributo *type* indicando el tipo de los
objetos dentro del ellos para poder procesarlos mas facilmente de una manera
similar a como propone [TermKit](http://acko.net/blog/on-termkit). Ademas,
tambien se añade a cada uno de estos objetos un metodo
[inspect](https://nodejs.org/api/util.html#util_custom_inspect_function_on_objects)
de forma que se muestre al imprimirlos por pantalla un resultado similar al de
sus correspondientes comandos UNIX en lugar de mostrar los objetos en bruto.
