#### Davius

[Davius](https://github.com/piranna/Davius) es un servidor HTTP/WebDAV estático
y sin estado que muestra en su jerarquía de recursos una traducción directa de
la jerarquía de archivos que se le haya indicado. Este sistema es usado en
NodeOS para servir los archivos del directorio del usuario, pertenecientes tanto
al contenido estático de las aplicaciones que tenga instaladas como sus archivos
personales, y permite acceder a los mismos y editarlos desde cualquier navegador
web o cliente WebDAV, además de poder funcionar como servidor web para publicar
contenido fácilmente. Esto último es especialmente útil en el caso del
desarrollo web para evitar ciertas restricciones que se tienen al usar archivos
directamente desde el disco duro local debido a la politica de
[origen único](https://developer.mozilla.org/en-US/docs/Same-origin_policy_for_file:_URIs).

*Davius* está basado en el módulo *oneshoot* para implementar el servidor web
sin estado, y en el módulo
[serve-static](https://github.com/expressjs/serve-static) para servir los
archivos. Después se le ha añadiéndo la funcionalidad correspondiente a las
extensiones del protocolo WebDAV, debido a que no se ha podido encontrar ningún
módulo que implemente completamente dicho protocolo, o en caso de hacerlo, estas
son aplicaciones independientes con sus propios mecanismos de autenticación y
otras funcionalidades más avanzadas que no son necesarias, pero que además no
permiten ser integradas en un servidor web existente. Además, *Davius* también
implementa soporte para [RFC 4437](http://greenbytes.de/tech/webdav/rfc4437.html),
que es una extensión del protocolo WebDAV que permite la creación de links
simbólicos, permitiendo de este modo cubrir toda la funcionalidad habitual usada
al trabajar con sistemas de archivos.

El módulo [send](https://github.com/pillarjs/send), usado como dependencia del
módulo *static-serve*, ha recibido algunas mejoras como son el poder servir los
[links simbólicos como redirecciones HTTP](https://github.com/pillarjs/send/pull/87)
en vez de ofrecer directamente su contenido, algo más canónico al ofrecer
una relación 1:1 con todos los elementos del sistema de archivos, y que además
es la forma de trabajar que propone el *RFC 4437*. También se
[sugerió](https://github.com/pillarjs/send/issues/85) el que se pudieran subir
archivos mediante el uso del método `PUT`, aunque se nos indicó que dicha tarea
sería mejor que fuese realizada por un módulo independiente. Por esta razón, se
desarrolló el módulo [recv](https://github.com/piranna/recv), el cual además
se le ha añadido soporte para rehalizar subidas de archivos parciales mediante
el uso de la cabecera HTTP `Content-Range`.
