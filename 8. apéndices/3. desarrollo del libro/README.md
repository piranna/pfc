### Desarrollo del libro

1. [gitbook-plugin-printlinks](gitbook-plugin-printlinks.html)
2. [Stargazers](Stargazers.html)

Para la creación de este libro se ha colaborado aportando mejoras a los
siguientes proyectos:

* [Gitbook autocover](https://github.com/GitbookIO/plugin-autocover): uso de
  plantillas SVG en vez de un layout predefinido para la portada del libro.
* [gitbook-plugin-mermaid](https://github.com/lsenft/gitbook-plugin-mermaid):
  soporte para cargar diagramas desde archivos externos (no embebidos) y usar el
  modulo [phantomjs](https://github.com/Medium/phantomjs) para poder descargar
  automaticamente el binario de [PhantomJS](http://phantomjs.org) en vez de
  requerir al usuario que este instalado globalmente. Ademas, también
  identifique un bug en el procesamiento de argumentos en el mecanismo de
  [bloques de GitBook](https://github.com/GitbookIO/gitbook/issues/934).
* [node-canvg](https://github.com/yetzt/node-canvg): cargar imágenes desde disco
  al usar URLs relativas.
* [phantomjs-node](https://github.com/sgentle/phantomjs-node): detecté un bug
  por como se trataba la ruta del binario de PhantomJS que no permitia que
  [tuviera espacios](https://github.com/sgentle/phantomjs-node/issues/320), lo
  cual impedia a *gitbook-plugin-mermaid* el poder usar su propia copia local.

Ademas, también se ha creado el plugin para GitBook
[printlinks](gitbook-plugin-printlinks.html) para mostrar las direcciones URL de
los hiperenlaces incluidos en el texto como notas al pie de página al final de
cada sección, y se ha usado una hoja de estilos para justificar el texto a los
[margenes](https://en.wikipedia.org/wiki/Typographic_alignment#Justified) en su
versión impresa y mejorar su aspecto visual.

Para la gráfica con la evolución del número de [Stargazers](Stargazers.html) del
proyecto se ha desarrollado un script especifico haciendo uso de las APIs de
[GitHub para desarrolladores](https://developer.github.com/v3) y de
[Google Image Charts](https://developers.google.com/chart/image).
