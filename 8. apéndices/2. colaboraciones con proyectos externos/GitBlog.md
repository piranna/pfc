#### GitBlog

Uno de los requisitos del CUSL es la necesidad de usar un blog donde se expongan
los progresos que se van aconteciendo durante el desarrollo del proyecto, por lo
que decidí usar para esto el própio blog del proyecto y de esta forma poder
también anunciar dichos progresos oficialmente, Este blog está basado en Jekyll
y por tanto sólo permite tener contenido estático, por lo que para editar nuevas
entradas es preciso hacerlo localmente y despues subirlas cuando estén listas
como si de un repositorio de código se tratase (de hecho, Jekyll es usado por
GitHub para el hospedaje de páginas de los proyectos). Aunque éste enfoque pueda
tener ventajas como es la existencia de una copia en local de las entradas del
blog y poder tener un control de los cámbios gracias a `git`, también tiene sus
inconvenientes como es la falta de flexibilidad, el no poder editar las entradas
en un ordenador que no se haya descargado antes una copia del blog o el poder
hacerlo facilmente desde un teléfono movil, o la mas importante de todas la
ausencia de comentarios, teniendo que usarse para este fin servicios externas
como [Disqus](https://disqus.com). Ademas, está el problema añadido de que ésto
representa un lugar mas desde donde recibir feedback sobre el proyecto,
descentralizandolo y complicando su administración.

Para paliar todos estos problemas, puesto que la forma principal de comunicación
dentro del proyecto son los issues de GitHub, planteé la posibilidad de diseñar
una página web que hiciera uso de la API de issues de GitHub para mostrar los
que esten [marcados](https://github.com/NodeOS/NodeOS/issues?q=label%3Ablog) con
una etiqueta determinada como si fueran las entradas de un blog. En un principio
sólo se planteó como una idea de cara al futuro, pero sin embargo al poco tiempo
[Sam Tobia](https://github.com/formula1) decidió implementarla él mismo creando
el proyecto [GitBlog](https://github.com/NodeOS/GitBlog), siendo suyo la mayor
parte del desarrollo.

En este proyecto principalmente he colaborado con la idea original y la
aportacion de sugerencias y correcciones para la integración del mismo en la
actual [pagina web de NodeOS](https://node-os.com), junto con el uso de
[Yahoo! Pipes](https://en.wikipedia.org/wiki/Yahoo!_Pipes) para generar
dinámicamente un feed RSS con las actualizaciones en los issues, al igual que
añadí anteriormente un feed RSS para la versión estatica del blog. No obstante,
en Junio de 2015 se anuncio que el servicio de Yahoo! Pipes cerraría a partir
del [31 de agosto](http://readwrite.com/2015/06/08/yahoo-shuts-down-pipes), por
lo que actualmente se esta buscando alguna otra alternatíva.
