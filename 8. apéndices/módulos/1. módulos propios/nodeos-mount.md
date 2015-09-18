#### nodeos-mount

Para el montaje de los sistemas de archivos primero se empleo el modulo
[node-src-mount](https://github.com/groundwater/node-src-mount) usado
originalmente por el proyecto, aunque despues decidi cambiarlo por
[nodeos-mount](https://github.com/NodeOS/nodeos-mount), no solo por tener una
funcionalidad mas completa sino principalmente por su soporte para montar las
particiones asincronamente y de esta forma poder optimizar el arranque del
sistema.

No obstante, este modulo ha requerido ciertas mejoras, como su actualizacion
realizada por [Csaba Szabo](https://github.com/netlovers) (miembro del proyecto)
para poder ser utilizado en Node.js 0.12 usando las macros proporcionadas por el
modulo [nan](https://github.com/nodejs/nan). Por mi parte, las mejoras que
realice yo mismo al modulo son:

* permitir el uso de parametros opcionales en la llamada a las distintas
  funciones del modulo manipulando los argumentos con los que han sido invocadas
* admitir el paso de las opciones de montaje como un array de strings en vez de
  como un conjunto de flags y los parametros del sistema de archivos como un
  objeto literal en vez de como una cadena de texto, de forma que sean mas
  coherente con el estilo empleado en Javascript
* añadir soporte para la deteccion automatica del sistema de archivos de la
  particion si no se ha indicado ninguno probando iterativamente en los sistemas
  de archivos soportados por el kernel y definidos en ```/proc/filesystems``` (e
  ignorando los sistemas de archivos virtuales) de forma similar a como lo
  realiza el comando *mount*
* poder definir el orden en que se probaran los sistemas de archivos, forzando
  por defecto a que se intente usar el formato Ext4 antes que los mas antiguos
  Ext3 o Ext2, igualmente de forma similar a como lo permite el comando *mount*
