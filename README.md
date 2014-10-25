[![ShareIt!](img/logo.svg)](http://shareit.es/)
========
Framework para desarrollo de aplicaciones P2P en Javascript

[![Build Status](https://www.gitbook.io/button/status/book/piranna/shareit-project_pfc)](https://www.gitbook.io/book/piranna/shareit-project_pfc/activity)

Memoria del Proyecto de Fin de Carrera de Jesús Leganés Combarro, alumno de la
[Escuela Técnica Superior de Ingeniería Informática](http://www.etsii.urjc.es/)
de la [Universidad Rey Juan Carlos](http://www.urjc.es/) y consistente en el
diseño e implementación de un conjunto de librerias y herramientas para el
desarrollo de aplicaciones web basadas en arquitecturas Peer-2-Peer
descentralizadas.

Este libro se ha generado con [GitBook](https://www.gitbook.io) usando
[npm](https://www.npmjs.org/) para la gestion de dependencias, y se ha utilizado
[Markdown](http://daringfireball.net/projects/markdown/) como formato de
edición. Sus fuentes originales estan disponible para descarga en
[GitHub](https://github.com/piranna/shareit-project_pfc).

Generación del libro
--------------------

Para generar el libro a partir de sus fuentes, necesitara tener instalados en su
sistema [Calibre](http://calibre-ebook.com/) (necesario para la generacion del
libro en formato PDF) y [Node.js](http://nodejs.org/). Despues, podra instalar
las dependencias de desarrollo del libro (incluido GitBook) desde un terminal:

```bash
npm install
```

Posteriormente, podra generar el libro en formato PDF preparado para impresión,
o como un sitio web accesible en la URL http://localhost:4000:

```bash
# PDF
npm run-script build

# Sitio web
npm run-script serve
```
