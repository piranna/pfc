[![NodeOS](img/NodeOS.svg)](http://node-os.com) Sistema operativo ligero basado en Node.js
======

[![Build Status](https://www.gitbook.com/button/status/book/piranna/pfc)](https://www.gitbook.com/book/piranna/pfc/activity)

Memoria del Proyecto de Fin de Carrera de Jesús Leganés Combarro, alumno de la
[Escuela Técnica Superior de Ingeniería Informática](http://www.etsii.urjc.es/)
de la [Universidad Rey Juan Carlos](http://www.urjc.es/) y consistente en el
desarrollo de un sistema operativo basado en un
[kernel Linux](http://es.wikipedia.org/wiki/N%C3%BAcleo_Linux) y cuyo espacio de
usuario este basado en el framework [Node.js](https://nodejs.org/) y el gestor
de dependencias [npm](https://www.npmjs.org/), reduciendo el consumo de recursos
al eliminar capas intermedias y permitiendo un facil aprendizaje y mantenimiento
al estar todas las aplicaciones escritas en Javascript.

Este libro se ha generado con [GitBook](https://www.gitbook.com) utilizando
[Markdown](http://daringfireball.net/projects/markdown/) como formato de
edición. Sus fuentes originales estan disponible para descarga en
[GitHub](https://github.com/piranna/pfc).

Para la creación de este libro tambien se ha colaborado aportando mejoras a los
siguientes proyectos:

* [Gitbook autocover](https://github.com/GitbookIO/plugin-autocover): usar
  plantillas SVG en vez de un layout predefinido para la portada del libro
* [node-canvg](https://github.com/yetzt/node-canvg): cargar imagenes desde disco
  al usar URLs relativas

Generación del libro
--------------------

Para generar el libro a partir de sus fuentes, necesitara tener instalados en su
sistema [Calibre](http://calibre-ebook.com/) (necesario para la generacion del
libro en formato PDF) y Node.js. La version de Calibre incorporada en Ubuntu (al
menos hasta la version 15.04 "Vivid Velvet") es antigua y contiene algunos
fallos que impiden su uso con GitBook, por lo que es preciso instalarse la
[ultima version disponible](https://github.com/GitbookIO/gitbook/issues/790) en
la pagina del proyecto ejecutando

```bash
URL=https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py
SCRIPT="import sys; main=lambda:sys.stderr.write('Failed\n'); exec(sys.stdin.read()); main()"

wget -nv -O- $URL | sudo python -c $SCRIPT
```

Despues, podra instalar las dependencias de desarrollo del libro:

```bash
npm install
```

Una vez instaladas todas las herramientas y dependencias necesarias, podra
generar el libro en formato PDF preparado para impresión o como un sitio web:

* **PDF**: el libro generado estara ubicado en el directorio del proyecto como
  `NodeOS.pdf`
  ```bash
  npm run build
  ```
* **sitio web**: el sitio web estara accesible desde la URL http://localhost:4000
  ```bash
  npm run serve
  ```
