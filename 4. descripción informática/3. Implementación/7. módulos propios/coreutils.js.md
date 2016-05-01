#### coreutils.js

Existen algunas implementaciones de los comandos típicos de UNIX en Javascript,
siendo la más popular [shelljs](http://shelljs.org). Sin embargo, su
implementación de comandos tiene algunas limitaciones al estár enfocada
sólamente a replicar su funcionalidad, por lo que sólo sirve para evitar tener
que ejecutar scripts de shell que realicen tareas sencillas, pero no facilita su
integración con otros programas escritos en Javascript, teniendo que procesar
los datos en cada etapa por separado al igual que sucedería usando comandos
externos.

[coreutils.js](https://github.com/piranna/coreutils.js) por otro lado, al estar
diseñado específicamente para ser usado dentro de una shell interactiva como son
[nsh](../1. colaboraciones con proyectos externos/nsh.html) o el interprete REPL
de Node.js, toma un enfoque distinto al implementar internamente los comandos
básicos de un sistema Unix mediante el uso de streams de objetos, permitiendo el
interconectar los distintos "comandos" entre sí usando la API de streams de
Node.js. Esto no sólo hace que dichos streams puedan fácilmente integrarse con
otros módulos, sino que además mejore su rendimiento, ya que los datos ya están
procesados y atomizados y, por tanto, no es necesario volver a hacerlo cada vez,
y también mejora su rendimiento con grandes conjuntos de datos al no usar
`Array`s tal y como hacen otras librerías. Para ello, se ha modificado el módulo
[ordered-read-streams](https://github.com/armed/ordered-read-streams) haciendo
que emita nuevos datos a medida que se van recibiendo (en vez de esperar a
consumirlos todos previamente) y permitir el añadir nuevos streams una vez se
haya iniciado. También en [node-byline](https://github.com/Tsenzuk/node-byline),
haciendo que su funcionamiento sea similar a Python, incluyendo el retorno
de línea en las cadenas de texto devueltas, permitiendo que pueda recomponerse
el contenido original del stream de forma fácil y transparente al usuario.

A los streams se les ha añadido un atributo *type* indicando el tipo de objetos
que contienen para poder procesarlos más fácilmente (al tener una indicación de
cuál es el formato de dichos datos), de manera similar a como propone
[TermKit](http://acko.net/blog/on-termkit). Además, se añade a cada uno de estos
objetos un método
[inspect](https://nodejs.org/api/util.html#util_custom_inspect_function_on_objects)
personalizado de forma que muestre al imprimirlos por pantalla un resultado
similar al de sus comandos equivalentes en sistemas UNIX, en lugar de mostrar
directamente los datos de los objetos en bruto.

Los comandos actualmente implementados total o parcialmente en este módulo son:
* **text utils**
  * cat
  * head
  * sort
* **file utils**
  * dir
  * ls
  * mkdir
* **sh utils**
  * chroot
  * date
  * dirname
  * echo
  * [env](usrbinenv.md)
  * hostname
  * sleep
  * tee
  * test
  * yes
* **requeridos por POSIX**
  * cd
  * pwd
  * umask
* **comandos extras**
  * grep
