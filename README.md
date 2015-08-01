[![NodeOS](img/logo.svg)](http://node-os.com/)
========
Sistema operativo ligero usando Node.js como espacio de usuario

[![Build Status](https://www.gitbook.com/button/status/book/piranna/pfc)](https://www.gitbook.com/book/piranna/pfc/activity)

Memoria del Proyecto de Fin de Carrera de Jesús Leganés Combarro, alumno de la
[Escuela Técnica Superior de Ingeniería Informática](http://www.etsii.urjc.es/)
de la [Universidad Rey Juan Carlos](http://www.urjc.es/) y consistente en el
desarrollo de un sistema operativo basado en un
[kernel Linux](http://es.wikipedia.org/wiki/N%C3%BAcleo_Linux) y cuyo espacio de
usuario este basado en el framework [Node.js](https://nodejs.org/) y el gestor
de dependencias [npm](https://www.npmjs.org/), reduciendo el consumo de recursos
al eliminar capas intermedias y permitiendo un facil aprendizaje y mantenimiento
al estar todas las aplicaciones esten escritas en Javascript.

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
libro en formato PDF) y Node.js. Despues, podra instalar las dependencias de
desarrollo del libro (incluido GitBook) desde un terminal:

```bash
npm install
```

Posteriormente, podra generar el libro en formato PDF preparado para impresión,
o como un sitio web accesible en la URL http://localhost:4000:

```bash
# PDF
npm run build

# Sitio web
npm run serve
```
