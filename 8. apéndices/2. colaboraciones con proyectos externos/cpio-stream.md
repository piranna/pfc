#### cpio-stream

El unico formato de archivo que soporta el kernel de Linux para el empaquetado
de su sistema de archivos initramfs es [cpio](https://www.gnu.org/software/cpio),
elegido sobre el mas comun [tar](https://www.gnu.org/software/tar) debido a que
su formato interno es mas simple y sencillo de implementar y mantener, a
diferencia de *tar* del que hay multiples versiones distintas y en algunos casos
incompatibles entre ellas. Sin embargo, precisamente por ser mas popular es el
formato usado por Docker y por vagga, por lo que es necesario convertir el
sistema de archivos initramfs entre ambos formatos.

El modulo [cpio-stream](https://github.com/finnp/cpio-stream) permite extraer el
contenido de un paquete cpio y manejarlo dinamicamente mediante la API de stream
de Node.js, sin embargo el único formato que soporta es `odc` o *Portable ASCII
Format*, mientras que el kernel de Linux emplea exclusivamente el formato `newc`
o *New ASCII Format*, por lo que decidí añadirle el soporte para dicho nuevo
[formato](https://github.com/finnp/cpio-stream/pull/4) a partir de su
[especificación](http://people.freebsd.org/~kientzle/libarchive/man/cpio.5.txt).

El sistema de extraccion de *cpio-stream* esta diseñado como una maquina de
estados, donde se consideraba en su implementacion original el tipo del formato
como parte de la cabecera del archivo. Sin embargo esto hacia complicada la
detección del formato del archivo y su procesamiento, por lo que el primer paso
fue separar dicha deteccion en un estado previo independiente para poder despues
parsear la cabecera acorde a cada formato. Esto ha permitido ademas que se pueda
añadir soporte del formato 'crc' o *New CRC Format*, y que se puedan añadir
facilmente en el futuro soporte para el formato `bin` (o *Old Binary Format*, el
formato original del archivo de tipo binario) o para cualquiera de los otros
formatos derivados del mismo.

En este sentido, lo mas complicado de añadir el soporte para el nuevo formato ha
sido que el codigo anterior estaba muy orientado al formato `odc` basado en el
uso de un stream de caracteres donde todos los campos son consecutivos, mientras
que en el formato `newc` contempla el uso de bytes de padding para aumentar el
rendimiento en la extraccion y facilitar el acceso directo a los datos (a
diferencia del formato `odc` mas enfocado al almacenamiento en cinta y por tanto
a un acceso secuencial), por lo que he tenido que cambiar los algoritmos de
extraccion (incluso en el caso del formato `odc`) para que hagan uso de valores
de alineacion en vez de directamente el tamaño de los campos para poder ignorar
dichos bytes de padding.
