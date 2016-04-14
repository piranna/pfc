#### gitbook-plugin-printlinks

GitBook esta orientado principalmente a su uso en medios electrónicos incluso en
el caso de la exportación a PDF, al estar enfocado a e-readers y documentación
online. Esto tiene el problema de que al general material impreso no hay
posibilidad de conservar los enlaces a otros documentos, pero tampoco las
referencias dentro del propio libro ya que éstas están hechas mediante el uso de
hiperenlaces. Para paliar esta situación propuse el añadir soporte para mostrar
los [enlaces al generar un PDF](https://github.com/GitbookIO/gitbook/issues/571)
dentro de la funcionalidad de GitBook, pero al no haberse producido avances al
respecto, decidí desarrollar un [plugin](https://github.com/piranna/gitbook-plugin-printlinks)
que añadiera dicho soporte mostrando los enlaces a modo de notas al pie de página
([footnotes](http://www.plagiarism.org/citing-sources/what-are-footnotes)).

El plugin se ejecuta en cada uno de los capítulos antes de ser convertido a HTML
para su posterior generación como archivo PDF, y busca todos los enlaces que
estén en el documento que no correspondan a imágenes o a un índice, y añade un
footnote con su URL. En el caso de las referencias internas, éstas se detectan
mediante el uso de URLs relativas en vez de usarse URLs absolutas, y se
sustituye en el pie de página por una referencia a la sección a la que apuntaba
el hiperenlace teniendo en cuenta el idioma en el que está escrito el libro.
También tiene en cuenta los footnotes actualmente definidos para evitar duplicar
sus índices y provocar referencias inválidas.

El principal problema que he encontrado al desarrollar el plugin ha sido en la
identificación de los links que no deben ser convertidos en footnotes (imágenes
y tablas de contenidos) debido al formato que tienen en Markdown (las imágenes
precedidas por un signo de admiración, y las tablas de contenidos por su índice).
En un principio intenté filtrar dichos enlaces directamente en la expresión
regular que los detecta mediante el uso de una coincidencia negativa, pero el
motor de expresiones regulares de Javascript no soporta la búsqueda de
coincidencias antes del punto de escaneo actual (*look behind*), por lo que
decidí considerar que el formato de los enlaces tenía "prefijos" (el signo de
admiración y el índice) y solo procesar los enlaces que no tuvieran ninguno
(enlaces cuyo "prefijo" fuera la cadena vacía). Después dentro del texto se
inserta una referencia al footnote a continuación del propio enlace para que
éste pueda ubicarse cuando se imprima el libro, y al final de la página el
propio *footnote* con la ruta del enlace.

Los enlaces a otras secciones del libro se realizan parseando la URL del enlace
y se comprueba si éste es relativo si no está definido su host. En tal caso, se
extraen los índices de sección de cada uno de los componentes de la ruta del
enlace y se unifican, y después se crea la referencia a la sección teniendo en
cuenta el idioma del libro mediante un sencillo mecanismo inspirado en
[gettext](https://www.gnu.org/software/gettext) consistente en un objeto JSON
donde las claves son el identificador del idioma y sus valores son cadenas de
texto [localizadas](https://es.wikipedia.org/wiki/Internacionalización_y_localización)
con el texto `__REF__` en la ubicación donde después se insertara la referencia
a la sección mediante una simple sustitución de texto.
