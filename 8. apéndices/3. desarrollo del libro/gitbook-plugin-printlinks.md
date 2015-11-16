#### gitbook-plugin-printlinks

GitBook esta orientado principalmente a su uso en medios electronicos incluso en
el caso de usar la exportación a PDF. Esto tiene el problema de que al imprimir
no hay posibilidad de conservar los enlaces a otros documentos, pero tampoco las
referencias dentro del propio libro ya que éstas están hechas mediante el uso de
hiperenlaces. Para paliar esta situación propuse el añadir soporte para mostrar
los [enlaces](https://github.com/GitbookIO/gitbook/issues/571) dentro de la
funcionalidad de GitBook, pero al no haberse producido avances al respecto, he
desarrollado un [plugin](https://github.com/piranna/gitbook-plugin-printlinks)
para añadier dicho soporte mostrando los enlaces a modo de notas al pie de pagina
([footnotes](http://www.plagiarism.org/citing-sources/what-are-footnotes)).

El plugin se ejecuta en cada uno de los capitulos antes de ser convertido a HTML
para su posterior generación como archivo PDF, y busca todos los enlaces que
esten en el documento que no correspondan a imagenes o a un indice, y añade un
footnote con su URL. En el caso de las referencias internas, estas se detectan
mediante el uso de URLs relativas en vez de usarse URLs absolutas, y se
sustituye en el pie de pagina por una referencia a la sección a la que apuntaba
el hiperenlace teniendo en cuenta el idioma en el que esta escrito el libro.
Tambien tiene en cuenta los footnotes actualmente definidos para evitar duplicar
sus indices y provocar referencias invalidas.

El principal problema que he encontrado al desarrollar el plugin ha sido en la
identificacion de los links que no deben ser convertidos en footnotes (imagenes
y tablas de contenidos) debido al formato que tienen en Markdown (las imagenes
precedidas por un signo de admiración, y los tablas de contenidos por su indice).
En un principio intente filtrar dichos enlaces directamente en la expresion
regular que los detecta mediante el uso de una coincidencia negativa, pero el
motor de expresiones regulares de Javascript no soporta la busqueda de
coincidencias antes del punto de escaneo actual (*look behind*), por lo que
decidi considerar que el formato de los enlaces tenia "prefijos" (el signo de
admiración y el indice) y solo procesar los enlaces que no tuvieran ninguno
(enlaces cuyo "prefijo" fuera la cadena vacia). Despues dentro del texto se
inserta una referencia al footnote a continuacion del propio enlace para que
este pueda ubicarse cuando se imprima el libro, y al final de la página el
propio *footnote* con la ruta del enlace.

Los enlaces a otras secciones del libro se realizan parseando la URL del enlace
y se comprueba si este es relativo si no esta definido su host. En tal caso, se
extraen los indices de seccion de cada uno de los componentes de la ruta del
enlace y se unifican, y despues se crea la referencia a la seccion teniendo en
cuenta el idioma del libro mediante un sencillo mecanismo inspirado en
[gettext](https://www.gnu.org/software/gettext) consistente en un objeto JSON
donde las claves son el identificador del idioma y sus valores son cadenas de
texto [localizadas](https://es.wikipedia.org/wiki/Internacionalización_y_localización)
con el texto `__REF__` en la ubicación donde despues se insertara la referencia
a la sección mediante una simple sustitución de texto.
