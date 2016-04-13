#### Davius

Para las aplicaciones gráficas basadas en HTML5, la arquitectura recomendada
propone que se haga todo el procesamiento posible en el cliente (*fat
client*) y que se haga uso de un servidor web estático y sin estado para
transferirle su contenido, reduciendo su servidor al mínimo, ya sea por necesitar acceder a recursos hardware del servidor, por no haber APIs disponibles en los navegadores web para esa tarea, o porque una funcionalidad tenga que ejecutarse cuando el usuario no está conectado (aplicaciones P2P de intercambio de ficheros).

En una arquitectura de este tipo, el servidor web encargado de transferir el
contenido estático de las aplicaciones puede ser muy simple y genérico, pudiendo
ser compartido por todas las aplicaciones sin que estas necesiten el suyo propio.
Dicho servidor web puede ser usado para alojar los archivos del propio usuario y que pueda aplicar cambios a los mismos o borrarlos, en vez de únicamente servir los recursos estáticos de las aplicaciones, reduciendo aún más el número de casos donde es necesario el uso de un servidor de backend específico para una aplicación concreta. No obstante, al ser un protocolo orientado a su uso con archivos, HTTP no puede trabajar de forma transparente
con directorios o copiar recursos remotamente, para lo que puede hacerse uso de
otras alternativas como son [SpockFS](https://github.com/unbit/spockfs), que
implementa un sistema de archivos en red basado en HTTP y los métodos de la API
de [libfuse](https://github.com/libfuse/libfuse), o el protocolo
[WebDAV](http://www.webdav.org), que también es una extensión de HTTP pero
además es un [estándar](http://www.ietf.org/rfc/rfc4918.txt) ampliamente
aceptado por la industria.

[Davius](https://github.com/piranna/Davius) es un servidor HTTP/WebDAV estático
y sin estado que muestra en su jerarquía de recursos un mapeo directo del
sistema de archivos que se le haya indicado. Este sistema es usado en NodeOS para
servir los archivos del directorio del usuario, pertenecientes tanto al
contenido estático de las aplicaciones que tenga instaladas como sus archivos
personales, pudiendo acceder a los mismos y editarlos desde cualquier navegador
web o cliente WebDAV, además de poder funcionar como servidor web para publicar
contenido fácilmente. Esto último es especialmente útil en el caso del
desarrollo web, porque evita ciertas restricciones que se tienen al usar
archivos directamente desde el disco duro local.

*Davius* está basado en el módulo [oneshoot](https://github.com/piranna/oneshoot)
para implementar el servidor web sin estado, y en el módulo
[serve-static](https://github.com/expressjs/serve-static) para servir los
archivos, añadiéndole después la funcionalidad correspondiente a las extensiones
del protocolo WebDAV, debido a que no se ha podido encontrar ningún módulo que
implemente completamente dicho protocolo, o en caso de hacerlo, estas son
aplicaciones independientes con sus propios mecanismos de autenticación y otras
funcionalidades más avanzadas que no son necesarias, pero que además no permiten
ser integradas en un servidor web existente. Además, *Davius* también implementa
soporte para [RFC 4437](http://greenbytes.de/tech/webdav/rfc4437.html), que
es una extensión del protocolo WebDAV que permite la creación de links simbólicos.

El módulo [send](https://github.com/pillarjs/send), usado como dependencia del
módulo *static-serve*, ha recibido algunas mejoras como son el poder servir los
[links simbólicos como redirecciones HTTP](https://github.com/pillarjs/send/pull/87)
en vez de ofrecer directamente su contenido, algo más canónico al ofrecer
una relación 1:1 con todos los elementos del sistema de archivos, y que además
es la forma de trabajar que propone el *RFC 4437*. También
[sugerí](https://github.com/pillarjs/send/issues/85) el que se pudieran subir
archivos mediante el uso del método `PUT`, aunque se me indicó que dicha tarea
sería mejor que fuese realizada por un módulo independiente. Por esta razón, se desarrolla
el módulo [recv](https://github.com/piranna/recv), que además
soporta subidas de archivos parciales mediante el uso de la cabecera HTTP
`Content-Range`.
