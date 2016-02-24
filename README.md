[![NodeOS](img/NodeOS.svg)](http://node-os.com) Sistema operativo ligero para Node.js
======

[![](img/by-nc-sa.svg)](http://creativecommons.org/licenses/by-nc-sa/4.0)

Memoria del Proyecto de Fin de Carrera de Jesús Leganés Combarro, alumno de la
[Escuela Técnica Superior de Ingeniería Informática](http://www.etsii.urjc.es)
de la [Universidad Rey Juan Carlos](http://www.urjc.es), consistente en el
desarrollo de un sistema operativo minimalista sobre un kernel Linux y cuyo
espacio de usuario este basado en el framework [Node.js](https://nodejs.org) y
el gestor de dependencias [npm](https://www.npmjs.org), reduciendo el consumo de
recursos al eliminar capas intermedias, y permitiendo un fácil aprendizaje y
mantenimiento al estar todas sus aplicaciones y librerías escritas en
Javascript.

Este libro se ha generado con [GitBook](https://www.gitbook.com) utilizando
[Markdown](http://daringfireball.net/projects/markdown) como formato de edición.
Se pueden descargar sus fuentes originales desde su repositorio en
[GitHub](https://github.com/piranna/pfc), estando también disponible para su
lectura online y su descarga en formato ebook y PDF desde su página web en
[gitbooks.io](http://piranna.gitbooks.io/pfc).

Generación del libro
--------------------

Para generar el libro a partir de sus fuentes, necesitara tener instalados en su
sistema [Calibre](http://calibre-ebook.com) (necesario para la generación del
libro en formato PDF) y Node.js 0.12. La versión de Calibre incorporada en Ubuntu
15.04 "Vivid Velvet" (2.20) contiene algunos errores que impiden su uso con
GitBook, por lo que se recomienda usar la versión 2.30 o superior, o bien la
[última versión disponible](https://github.com/GitbookIO/gitbook/issues/790)
directamente desde la página del proyecto ejecutando

```bash
URL=http://raw.github.com/kovidgoyal/calibre/master/setup/linux-installer.py
SCRIPT="import sys; exec(sys.stdin.read()); sys.stderr.write('Failed\n')"

wget -nv -O- $URL | sudo python -c $SCRIPT
```

Después, podrá instalar las dependencias de desarrollo del libro:

```bash
npm install
```

Una vez instaladas todas las herramientas y dependencias necesarias, podrá
generar el libro en formato PDF listo para impresión o como un sitio web:

* **PDF**: el libro generado estará ubicado en el directorio del proyecto como
  `NodeOS.pdf`

  ```bash
  npm run pdf
  ```

* **sitio web**: el sitio web estará accesible desde la URL http://localhost:4000

  ```bash
  npm run serve
  ```
