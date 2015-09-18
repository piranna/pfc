### Desarrollo del libro

Para la creación de este libro se ha colaborado aportando mejoras a los
siguientes proyectos:

* [Gitbook autocover](https://github.com/GitbookIO/plugin-autocover): usar
  plantillas SVG en vez de un layout predefinido para la portada del libro
* [gitbook-plugin-mermaid](https://github.com/lsenft/gitbook-plugin-mermaid):
  soporte para archivos externos e identificar un bug en el procesamiento de
  [argumentos en GitBook](https://github.com/GitbookIO/gitbook/issues/934)
* [node-canvg](https://github.com/yetzt/node-canvg): cargar imagenes desde disco
  al usar URLs relativas

Ademas tambien se ha creado el plugin para gitbook
[printlinks](8. apéndices/2. módulos/2. gitbook-plugin-printlinks.html) para
mostrar las direcciones URL de los hiperenlaces incluidos en el texto como notas
al pie de pagina al final de cada seccion, y tambien se ha usado una hoja de
estilos propia para justificar el texto a los margenes en su version impresa y
mejorar su aspecto visual.

Para la gráfica con la evolución del número de Stargazers del proyecto se ha
desarrollado un script especifico haciendo uso de las APIs de
[GitHub para desarrolladores](https://developer.github.com/v3) y de
[Google Image Charts](https://developers.google.com/chart/image). Puede
encontrar mas información sobre el en su [apendice](8. apéndices/Stargazers.html).
