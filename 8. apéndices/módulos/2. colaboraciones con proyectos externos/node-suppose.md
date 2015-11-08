#### node-suppose

Para poder comprobar que tanto el binario de Node.js como el propio NodeOS
generados funcionan correctamente, es necesario hacer que ejecuten alguna
instrucción de Javascript y comprobar que den el resultado correcto. En este
sentido son completamente unas cajas negras, siendo la unica manera posible de
comunicarse con ellas mediante la entrada y salida estandar proporcionadas por
el binario de Node.js y por la maquina virtual de QEmu respectivamente, del
mismo modo como si fuese un humano el que escribiera las intrucciones y esperara
la respuesta. Para poder hacer esto en Javascript, el módulo
[suppose](https://github.com/jprichardson/node-suppose) permite ejecutar un
comando y mediante expresiones regulares esperar a determinados valores en su
salida estandar para despues introducir datos en su entrada estandar. De esta
manera, se puede interactuar de forma automatizada con un comando y comprobar
sus respuestas, tal y como deseabamos.

Originariamente el módulo estaba orientado a la automatización de programas al
estilo de [Selenium](http://www.seleniumhq.org) para las paginas web, pero
debido a mi intención de usarlo en un entorno de pruebas necesitaba reaccionar
ante los resultados obtenidos, por lo que añadi soporte para ejecutar una
función como resultado a una correspondencia en la salida estandar, al igual que
se pueda definir dicha respuesta al mismo tiempo que se define una expectativa.
