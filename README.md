[![NodeOS](img/NodeOS.svg)](http://node-os.com) Sistema operativo ligero para Node.js
======

[![](img/by-nc-sa.svg)](http://creativecommons.org/licenses/by-nc-sa/4.0)

Memoria del Proyecto de Fin de Carrera de Jesús Leganés Combarro, alumno de la
[Escuela Técnica Superior de Ingeniería Informática](http://www.etsii.urjc.es)
de la [Universidad Rey Juan Carlos](http://www.urjc.es), consistente en el
desarrollo de un sistema operativo minimalista sobre un kernel Linux y cuyo
espacio de usuario este basado en el framework [Node.js](https://nodejs.org) y
el gestor de dependencias [npm](https://www.npmjs.org), reduciendo el consumo de
recursos al eliminar capas intermedias y permitiendo un facil aprendizaje y
mantenimiento al estar todas las aplicaciones escritas en Javascript.

Este libro se ha generado con [GitBook](https://www.gitbook.com) utilizando
[Markdown](http://daringfireball.net/projects/markdown) como formato de edición.
Se pueden descargar sus fuentes originales desde su repositorio en
[GitHub](https://github.com/piranna/pfc), estando tambien disponible para su
lectura online y su descarga en formato ebook y PDF desde su pagina web en
[gitbooks.io](http://piranna.gitbooks.io/pfc).

Para la creación de este libro se ha colaborado aportando mejoras a los
siguientes proyectos:

* [Gitbook autocover](https://github.com/GitbookIO/plugin-autocover): usar
  plantillas SVG en vez de un layout predefinido para la portada del libro
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

Generación del libro
--------------------

Para generar el libro a partir de sus fuentes, necesitara tener instalados en su
sistema [Calibre](http://calibre-ebook.com) (necesario para la generacion del
libro en formato PDF) y Node.js. La version de Calibre incorporada en Ubuntu
15.04 "Vivid Velvet" (2.20) contiene algunos errores que impiden su uso con
GitBook, por lo que se recomienda usar la version 2.30 o superior, o tambien la
[ultima version disponible](https://github.com/GitbookIO/gitbook/issues/790)
directamente desde la pagina del proyecto ejecutando

```bash
URL=http://raw.github.com/kovidgoyal/calibre/master/setup/linux-installer.py
SCRIPT="import sys; exec(sys.stdin.read()); sys.stderr.write('Failed\n')"

wget -nv -O- $URL | sudo python -c $SCRIPT
```

Despues, podra instalar las dependencias de desarrollo del libro:

```bash
npm install
```

Una vez instaladas todas las herramientas y dependencias necesarias, podra
generar el libro en formato PDF listo para impresión o como un sitio web:

* **PDF**: el libro generado estara ubicado en el directorio del proyecto como
  `NodeOS.pdf`

  ```bash
  npm run pdf
  ```

* **sitio web**: el sitio web estara accesible desde la URL http://localhost:4000

  ```bash
  npm run serve
  ```
