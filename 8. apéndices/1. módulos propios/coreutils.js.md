#### coreutils.js

Existen algunas implementaciones de los comandos típicos de UNIX en Javascript,
siendo la mas popular [shelljs](http://shelljs.org). Sin embargo, su
implementación de los comandos tiene algunas limitaciones y esta enfocada
solamente a replicar su funcionalidad, por lo que solo sirve para evitar el
ejecutar scripts de shell para realizar tareas sencillas pero no facilita su
integración con otros programas escritos en Javascript, teniendo que parsear los
datos en cada etapa al igual que sucedería usando comandos externos.

[coreutils.js](https://github.com/piranna/coreutils.js) por otro lado, al estar
diseñado específicamente para ser usado dentro de una shell interactiva como son
[nsh](../2. colaboraciones con proyectos externos/nsh.html) o el interprete REPL
de Node.js, toma un enfoque distinto al implementar los comandos básicos de un
sistema Unix mediante el uso de streams de objetos para cada uno de ellos,
permitiendo el interconectar los distintos "comandos" entre si usando la API de
streams de Node.js. Esto no solo hace que dichos streams puedan fácilmente
integrarse con otros módulos, sino que además sea mejor su rendimiento ya que
los datos ya están parseados y atomizados y por tanto no es necesario volver a
hacerlo cada vez, y también con grandes conjuntos de datos al no usar `Array`s
tal y como hacen otras librerías. Para ello he modificado el módulo
[ordered-read-streams](https://github.com/armed/ordered-read-streams) haciendo
que emita nuevos datos a medida que se van recibiendo (en vez de esperar a
consumirlos todos previamente) y el poder añadir nuevos streams una vez se haya
iniciado, y también en [node-byline](https://github.com/Tsenzuk/node-byline)
haciendo que su funcionamiento fuese mas similar a Python incluyendo el retorno
de linea en las cadenas de texto devueltas, permitiendo que pueda recomponerse
el contenido original del stream de forma fácil y transparente al usuario.

A los streams se les ha añadido un atributo *type* indicando el tipo de los
objetos dentro del ellos para poder procesarlos mas fácilmente al poder tener
una indicación de cuál es el formato de los datos que contienen, de manera
similar a como propone [TermKit](http://acko.net/blog/on-termkit). Además,
también se añade a cada uno de estos objetos un método
[inspect](https://nodejs.org/api/util.html#util_custom_inspect_function_on_objects)
personalizado de forma que se muestre al imprimirlos por pantalla un resultado
similar al de sus comandos equivalentes en UNIX en lugar de mostrar los datos de
los objetos en bruto.
