## Stargazers

GitHub denomina *stargazers* a los seguidores de un proyecto determinado, de
forma equiparable a los "Me gusta" de Facebook o los "+1" de Google Plus. Sin
embargo en GitHub ademas tienen la funcionalidad de actuar como marcadores para
su posterior consulta y tambien como reconocimiento ante el trabajo de otros (en
el mismo sentido que la expresión [kudos](https://en.wiktionary.org/wiki/kudos)).

Para poder tener constancia del progreso en el número de seguidores del proyecto
he realizado un script para dicha tarea haciendo uso de la API pública de
[GitHub para desarrolladores](https://developer.github.com/v3) y de la API de
[Google Image Charts](https://developers.google.com/chart/image) para la
generación de la gráfica, la cual a pesar de estar deprecada en beneficio de
[Google Charts](https://developers.google.com/chart) ofrece una interfaz mas
sencilla para la generación de imagenes estaticas al estar basada en peticiones
HTTP GET y POST.

El funcionamiento del script se divide en dos partes: obtención de los datos y
generación de la grafica.

### Obtención de los datos

Para obtener el listado de stargazers del proyecto se ha hecho uso del módulo
[node-github](https://github.com/mikedeboer/node-github) el cual evita tener que
usar directamente la API REST de GitHub proporcionando una API para Node.js de
alto nivel.

Las peticiones se pueden hacer opcionalmente usando las credenciales del usuario,
de forma que se pueda sobrepasar el limite de peticiones que proporciona el
aceso anonimo. Estas se rehalizan solicitando el número maximo de datos
devueltos por peticion en vez de su valor por defecto (30) y empezando por la
pagina 1; despues en cada una de las respuestas se comprueba si en las cabeceras
del mensaje se ha indicado de la existencia de mas paginas, en tal caso se
procede a solicitar la siguiente o por el contrario se devuelven todos los datos
recolectados. Ademas se hace uso de la cabecera
`{Accept: 'application/vnd.github.v3.star+json'}` para forzar que el servidor
devuelva las fechas en que se genero cada stargazer, ya que es el unico dato en
el que estamos interesados.

### Generación de la gráfica

Una vez obtenidos los datos de todos los stargazers del proyecto, estos se
procesan para que puedan ser usados convenientemente por la API de Google Image
Charts. El motivo de usar dicho servicio es porque no hay ningun modulo de
generación de gráficas para Node.js lo suficiente potente estando la mayoria de
ellos desarrollados para solucionar casos especificos, o bien orientados para su
uso en el navegador de forma interactiva (y sin apenas opciones de configuración)
y por tanto no siendo validos para la generación de graficos estáticos. Me
planteé la posibilidad de usar el servicio de Google Image Charts mediante el
modulo [quiche](https://github.com/ryanrolds/quiche), el cual de forma similar a
*node-github* proporciona una API de alto nivel, sin embargo debido a que dicho
modulo esta sin mantenimiento desde hace 4 años y el querer tambien indicar los
distintos eventos acontecidos durante el proyecto y su repercusion en el numero
de seguidores, finalmente decidi usar directamente la API REST de Google Image
Charts. Estos hechos tambien me han hecho plantearme desarrollar en el futuro mi
propio modulo de gráficas (quizas usando como base alguno de los ya existentes
para Node.js como [line-graph](https://github.com/dominictarr/line-graph) y
usando una API similar a la *quiche*) además de crear un plugin para GitBook de
forma que puedan generarse automaticamente a partir de datos contenidos en
formato Markdown.

El primer paso para generar la gráfica es calcular un histograma con el número
de stargazers cada dia, para despues calcular su valor acumulado. Con estos
datos despues se generan varias listas con los stargazers, la distribución de
los dias en los que se han producido, los eventos acontecidos relaccionados con
el desarrollo y publicidad del proyecto, y dos listas auxiliares con los meses y
los años en los que se distribuyen los datos para mostrarlos correctamente en el
eje de ordenadas.

Por ultimo, estos datos se envian al WebService de Google Image Charts y el
resultado se escribe en un archivo en el disco duro. Debido a la cantidad de
datos generados estos se envian mediante una peticion POST en vez de mediante su
API basada en peticiones GET para evitar la limitacion que impone la API de
Google Image Charts en cuanto al tamaño de las peticiones GIT (2040 caracteres)
debido a las limitaciones actuales existentes en los navegadores web para la
[longitud de las URLs](http://stackoverflow.com/a/417184).

### Código fuente
!CODEFILE "./stargazers.js"
