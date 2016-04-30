#### cpio-stream

El único formato de archivo que soporta el kernel de Linux para el empaquetado
de su sistema de archivos initramfs es [cpio](https://www.gnu.org/software/cpio),
elegido sobre el mas común [tar](https://www.gnu.org/software/tar) debido a que
su formato interno es mas simple y sencillo de implementar y mantener, a
diferencia de *tar* del que hay múltiples versiones distintas y en algunos casos
incompatibles entre ellas. Sin embargo, precisamente por ser mas popular es el
formato usado por *Docker* y por *vagga*, por lo que es necesario convertir el
sistema de archivos *initramfs* entre ambos formatos.

El módulo [cpio-stream](https://github.com/finnp/cpio-stream) permite extraer el
contenido de un paquete `cpio` y manejarlo dinámicamente mediante la API de
streams de Node.js, sin embargo el único formato que soportaba es `odc`
(*Portable ASCII Format*), mientras que el kernel de Linux emplea exclusivamente
el formato `newc` (*New ASCII Format*), por lo que se decidió añadir el soporte
para dicho [nuevo formato](https://github.com/finnp/cpio-stream/pull/4)
implementandolo a partir de su
[especificación](http://people.freebsd.org/~kientzle/libarchive/man/cpio.5.txt).

El sistema de extracción de *cpio-stream* está diseñado como una máquina de
estados, donde se consideraba el tipo del formato en su implementación original
como parte de la cabecera del archivo. Sin embargo, esto hacía complicada la
detección del formato del archivo y su procesamiento, por lo que el primer paso
fue separar dicha detección en un estado previo independiente para poder después
parsear la cabecera acorde a cada formato. Esto ha permitido además que se pueda
añadir soporte del formato `crc` (*New CRC Format*), y que se puedan añadir
fácilmente en el futuro soporte para el formato `bin` (*Old Binary Format*, el
formato binario original del archivo), o para cualquiera de los otros formatos
derivados del mismo.

En este sentido, lo mas complicado de añadir el soporte para el nuevo formato ha
sido que el código fuente estaba muy orientado al formato `odc` basado en el uso
de un stream de caracteres donde todos los campos son consecutivos, mientras que
en el formato `newc` contempla el uso de bytes de padding para aumentar el
rendimiento en la extracción y facilitar el acceso directo a los datos (a
diferencia del formato `odc` mas enfocado al almacenamiento en cinta y por tanto
a un acceso secuencial), por lo que se ha tenido que cambiar los algoritmos de
extracción (incluso en el caso del formato `odc`) para que hagan uso de valores
de alineación en vez de directamente el tamaño de los campos para poder ignorar
dichos bytes de padding.
