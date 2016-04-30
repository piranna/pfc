#### node-suppose

Para poder comprobar que tanto el binario de Node.js como el propio NodeOS son
generados y funcionan correctamente, es necesario comprobar los resultados que
devuelven. En este sentido son completamente unas cajas negras, siendo la única
manera posible de comunicarse con ellas mediante la entrada y salida estándar
proporcionadas por el binario de Node.js y por la máquina virtual de QEmu
respectivamente, del mismo modo como si fuese un humano el que escribiera en su
terminal y esperara la respuesta. Para poder hacer esto en Javascript, el módulo
[suppose](https://github.com/jprichardson/node-suppose) permite ejecutar un
comando y mediante expresiones regulares esperar a determinados valores en su
salida estándar, para después introducir datos en su entrada estándar. De esta
manera, se puede interactuar de forma automatizada con un comando tal y como
haría un usuario y comprobar sus respuestas.

Originariamente el módulo estaba orientado a la automatización de programas al
estilo de cómo se usa [Selenium](http://www.seleniumhq.org) con las páginas web,
pero debido a la intención de usarlo en un entorno de pruebas se necesitaba
reaccionar ante los resultados obtenidos, por lo que se añadió soporte para
ejecutar una función como resultado a una correspondencia en la salida estándar,
al igual que el que se pueda definir dicha respuesta al mismo tiempo que se
define una expectativa, razónes por las que su autor me dio permisos para subir
código directamente al repositorio principal y publicar nuevas versiones en npm.

Un problema que tenía dicho módulo es que su API usaba la misma
[nomenclatura](https://github.com/jprichardson/node-suppose/issues/9#issuecomment-70378218)
que la empleada por la API de eventos de Node.js, lo que dificultaba el
procesamiento de errores. Por este motivo se propuso el usar una API basada en
[Promises](https://github.com/jprichardson/node-suppose/issues/9#issuecomment-147813472),
de forma que se tendría la ventaja añadida de poder hacer varias operaciones en
respuesta a una salida determinada, lo cual se implementó posteriormente en la
versión 0.4.0 junto con el soporte para procesar streams en vez de solamente el
resultado de comandos externos.
