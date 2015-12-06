#### nodeos-mount

Para el montaje de los sistemas de archivos, originalmente el proyecto hacía uso
del módulo [node-src-mount](https://github.com/groundwater/node-src-mount),
aunque al no soportar el montaje de las particiones de forma asincrona, decidí
sustituirlo por [nodeos-mount](https://github.com/NodeOS/nodeos-mount), el cual
además tiene una funcionalidad mas completa que permite optimizar el arranque
del sistema. No obstante, este módulo ha requerido ciertas mejoras, como la
actualización realizada por [Csaba Szabo](https://github.com/netlovers) (miembro
del proyecto) para poder ser utilizado en Node.js 0.12 usando las macros
proporcionadas por el modulo [nan](https://github.com/nodejs/nan) (actualmente
la forma oficial de crear módulos compilados en Node.js) en vez de acceder
directamente a las APIs internas de [v8](https://developers.google.com/v8) y
Node.js. Por otra parte, las mejoras que he realizado al módulo han sido:

* permitir el uso de parametros opcionales en las llamadas a las distintas
  funciones del módulo manipulando los argumentos con los que han sido invocadas
* admitir el paso de las opciones de montaje como un array de strings en vez de
  como un conjunto de flags, y los parametros del sistema de archivos como un
  objeto literal en vez de como una cadena de texto. De esta forma, el estilo es
  mas coherente al empleado normalmente en Javascript
* añadir soporte para la detección automática del sistema de archivos de la
  partición si no se ha indicado ninguno mediante la prueba iterativa de los
  sistemas de archivos soportados por el kernel y definidos en
  `/proc/filesystems` (ignorando los sistemas de archivos virtuales) de forma
  similar a la realizada el comando [mount](http://man7.org/linux/man-pages/man8/mount.8.html)
* poder definir el orden en que se probaran los sistemas de archivos, forzando
  por defecto a que se intente usar el formato `Ext4` antes que los mas antiguos
  `Ext3` o `Ext2`, igualmente de forma similar a como lo permite el comando
  `mount`
