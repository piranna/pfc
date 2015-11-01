#### GitBlog

Uno de los requisitos del CUSL es la necesidad de usar un blog donde se expongan
los progresos que se van aconteciendo durante el desarrollo del proyectos, por
lo que decidi usar para esto el propio blog del proyecto y de esta forma poder
tambien anunciar dichos progresos oficialmente, Este blog esta basado en Jekyll
y por tanto solo permite tener contenido estatico, por lo que para editar nuevas
entradas es preciso hacerlo localmente y despues subirlas cuando esten listas
como si de un repositorio de codigo se tratase. Aunque este enfoque pueda tener
ventajas como es la existencia de Una copia en local de las entradas del blog y
poder tener un control de los cambios gracias a git, tambien tiene sus
inconvenientes como es la falta de flexibilidad, el no poder guardar las
entradas como borrador y editarlas en un ordenador distinto o desde un telefono
movil facilmente, o la mas importante de todas la ausencia de comentarios,
teniendo que usarse para este fin servicios externas como
[Disqus](https://disqus.com). Ademas, esta el problema añadido de que esto
representa un lugar mas donde poder recibir feedback sobre el proyecto
descentralizandolo y complicando su administracion.

Para paliar todos estos problemas, puesto que la forma principal de comunicacion
dentro del proyecto son los issues de GitHub, planteé la posibilidad de diseñar
una pagina web que hiciera uso de la API de issues de GitHub para mostrar estas
como si fueran las entradas de un blog. En un principio era solo una idea de
cara al futuro, sin embargo [Sam Tobia](https://github.com/formula1) decidio
[implementarla el mismo](https://github.com/NodeOS/GitBlog), siendo suyo la
mayor parte del desarrollo. En este proyecto principalmente he colaborado con la
idea original y la aportacion de sugerencias y correcciones para la integracion
del mismo en la actual [pagina web de NodeOS](https://node-os.com) junto con el
uso de [Yahoo! Pipes](https://en.wikipedia.org/wiki/Yahoo!_Pipes) para generar
dinamicamente un feed RSS con las actualizaciones en los issues marcados con la
[etiqueta *blog*](https://github.com/NodeOS/NodeOS/issues?q=label%3Ablog). No
obstante, en Junio de 2015 se anuncio que el servicio de Yahoo! Pipes cerraba a
[partir del 31 de agosto](http://readwrite.com/2015/06/08/yahoo-shuts-down-pipes),
por lo que actualmente se esta buscando algun otro proveedor que pueda ofrecer
el mismo servicio.
