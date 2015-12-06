### Desarrollo del libro

1. [gitbook-plugin-printlinks](gitbook-plugin-printlinks.html)
2. [Stargazers](Stargazers.html)
  1. [Obtención de los datos](Stargazers.html#obtención-de-los-datos)
  2. [Generación de la gráfica](Stargazers.html#generación-de-la-gráfica)
  3. [Uso de Google Image Charts](Stargazers.html#uso-de-google-image-charts)

Para la creación de este libro se han aportando mejoras a los siguientes
proyectos:

* [Gitbook autocover](https://github.com/GitbookIO/plugin-autocover): uso de
  plantillas SVG en lugar de un layout predefinido para la portada del libro.
* [gitbook-plugin-mermaid](https://github.com/lsenft/gitbook-plugin-mermaid):
  soporte para cargar los diagramas desde archivos externos (en lugar de que
  estén embebidos dentro del código Markdown) y usar el módulo
  [phantomjs](https://github.com/Medium/phantomjs) para obtener automaticamente
  el binario de [PhantomJS](http://phantomjs.org) en vez de requerir al usuario
  que este instalado globalmente. Ademas, gracias a esta mejora también pude
  identificar un bug en el procesamiento de argumentos en el mecanismo de
  [bloques de GitBook](https://github.com/GitbookIO/gitbook/issues/934).
* [node-canvg](https://github.com/yetzt/node-canvg): cargar imágenes desde disco
  al usar URLs relativas.
* [phantomjs-node](https://github.com/sgentle/phantomjs-node): detecté un bug en
  la forma en que se trataba la ruta al binario de PhantomJS que no permitía que
  [tuviera espacios](https://github.com/sgentle/phantomjs-node/issues/320), lo
  cual impedia a *gitbook-plugin-mermaid* el poder usar su própia copia local.

Ademas, también se ha creado el plugin para GitBook
[printlinks](gitbook-plugin-printlinks.html) para mostrar las direcciones URL de
los hiperenlaces incluidos en el texto como notas al pie de página al final de
cada sección, y se ha usado una hoja de estilos própia para justificar el texto
a los [márgenes](https://en.wikipedia.org/wiki/Typographic_alignment#Justified)
en su versión impresa y mejorar su aspecto visual.

Por último, para la gráfica con la evolución del número de Stargazers del
proyecto, se ha desarrollado [un módulo especifico](Stargazers.html) que hace
uso de las APIs de [GitHub para desarrolladores](https://developer.github.com/v3)
y de [Google Image Charts](https://developers.google.com/chart/image).
