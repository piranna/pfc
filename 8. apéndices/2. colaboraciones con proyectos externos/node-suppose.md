#### node-suppose

Para poder comprobar que tanto el binario de Node.js como el própio NodeOS son
generados y funcionan correctamente, es necesario comprobar que responden
correctamente. En este sentido son completamente unas cajas negras, siendo la
única manera posible de comunicarse con ellas mediante la entrada y salida
estandar proporcionadas por el binario de Node.js y por la máquina virtual de
QEmu respectivamente, del mismo modo como si fuese un humano el que escribiera
en su terminal y esperara la respuesta. Para poder hacer esto en Javascript, el
módulo [suppose](https://github.com/jprichardson/node-suppose) permite ejecutar
un comando y mediante expresiones regulares esperar a determinados valores en su
salida estandar, para despues introducir datos en su entrada estandar. De esta
manera, se puede interactuar de forma automatizada con un comando tal y como
haria un usuario y comprobar sus respuestas.

Originariamente el módulo estaba orientado a la automatización de programas al
estilo de cómo se usa [Selenium](http://www.seleniumhq.org) con las páginas web,
pero debido a mi intención de usarlo en un entorno de pruebas necesitaba
reaccionar ante los resultados obtenidos, por lo que añadí soporte para ejecutar
una función como resultado a una correspondencia en la salida estandar, al igual
que se pueda definir dicha respuesta al mismo tiempo que se define una
expectativa. Un problema que tiene dicho módulo es que su API usa la misma
[nomenclatura](https://github.com/jprichardson/node-suppose/issues/9#issuecomment-70378218)
que la empleada por la API de eventos de Node.js, lo que dificulta el
procesamiento de errores. Por este motivo, he propuesto que se use una API
[basada en Promises](https://github.com/jprichardson/node-suppose/issues/9#issuecomment-147813472),
de forma que tendría la ventaja añadida de poder hacer varias operaciones en
respuesta a una salida determinada.
