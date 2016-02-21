#### Davius

Para las aplicaciones gráficas basadas en HTML5, la arquitectura recomendada
propone que se haga todo el procesamiento que sea posible en el cliente (*fat
client*) y que se haga uso de un servidor web estático y sin estado para
transferirle su contenido, reduciendo su lado servidor al mínimo indispensable
ya sea por necesitar acceder a recursos hardware del servidor, por no haber APIs
disponibles en los navegadores web para esa tarea, o porque una funcionalidad
tenga que ejecutarse cuando el usuario no esta conectado como es el caso de las
aplicaciones P2P de intercambio de ficheros.

En una arquitectura de este tipo, el servidor web encargado de transferir el
contenido estático de las aplicaciones puede ser muy simple y genérico, pudiendo
ser compartido por todas las aplicaciones sin que éstas necesiten el suyo propio.
Por otro lado, dicho servidor web puede ser usado igualmente para alojar los
archivos del propio usuario y que pueda aplicar cambios a los mismos o borrarlos,
en vez de sólo servir los recursos estáticos de las aplicaciones, reduciendo aún
mas el número de casos donde es necesario el uso de un servidor de backend
específico para una aplicación concreta. No obstante, al ser un protocolo
orientado a su uso con archivos, HTTP no puede trabajar de forma transparente
con directorios o copiar recursos remotamente, para lo que puede hacerse uso de
otras alternativas como son [SpockFS](https://github.com/unbit/spockfs), que
implementa un sistema de archivos en red basado en HTTP y los métodos de la API
de [libfuse](https://github.com/libfuse/libfuse), o el protocolo
[WebDAV](http://www.webdav.org), el cual también es una extensión de HTTP pero
además es un [estándar](http://www.ietf.org/rfc/rfc4918.txt) ampliamente
aceptado por la industria.

[Davius](https://github.com/piranna/Davius) es un servidor HTTP/WebDAV estático
y sin estado que muestra en su jerarquía de recursos un mapeo directo del
sistema de archivos que se le haya indicado, el cual es usado en NodeOS para
servir los archivos del directorio del usuario, pertenecientes tanto al
contenido estático de las aplicaciones que tenga instaladas como sus archivos
personales, pudiendo acceder a los mismos y editarlos desde cualquier navegador
web o cliente WebDAV, además de poder funcionar como servidor web para publicar
contenido fácilmente. Esto último es especialmente útil en el caso del
desarrollo web, al poder evitar ciertas restricciones que se tienen al usar
archivos directamente desde el disco duro local.

*Davius* esta basado en el módulo [oneshoot](https://github.com/piranna/oneshoot)
para implementar el servidor web sin estado, y en el módulo
[serve-static](https://github.com/expressjs/serve-static) para servir los
archivos, añadiéndole después la funcionalidad correspondiente a las extensiones
del protocolo WebDAV, debido a que no se ha podido encontrar ningún modulo que
implemente completamente dicho protocolo, o en caso de hacerlo, éstas son
aplicaciones independientes con sus propios mecanismos de autenticación y otras
funcionalidades mas avanzadas que no son necesarias, pero que además no permiten
ser integradas en un servidor web existente. Además, *Davius* también implementa
soporte para [RFC 4437](http://greenbytes.de/tech/webdav/rfc4437.html), el cual
es una extensión del protocolo WebDAV que permite la creación de links simbólicos.

El módulo [send](https://github.com/pillarjs/send), usado como dependencia del
módulo *static-serve*, ha recibido algunas mejoras como son el poder servir los
[links simbólicos como redirecciones HTTP](https://github.com/pillarjs/send/pull/87)
en vez de ofrecer directamente su contenido, lo cual es mas canónico al ofrecer
una relación 1:1 con todos los elementos del sistema de archivos, y que además
es la forma de trabajar que propone el *RFC 4437* antes indicado. También
[sugerí](https://github.com/pillarjs/send/issues/85) el que se pudieran subir
archivos mediante el uso del método `PUT`, aunque se me indico que dicha tarea
seria mejor que fuese realizada por un módulo independiente. Por esta razón
desarrollo el módulo [recv](https://github.com/piranna/recv), el cual además
soporta subidas de archivos parciales mediante el uso de la cabecera HTTP
`Content-Range`.
