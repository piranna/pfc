#### vinyl-fs

El módulo [download](https://github.com/kevva/download), usado para descargar y
descomprimir automáticamente todos los componentes de construcción de NodeOS,
internamente hace uso de [vinyl-fs](https://github.com/gulpjs/vinyl-fs), el cual
aplica la API de streams de Node.js para su uso con archivos (incluidos sus
metadatos). El módulo tenía un problema por el cual la fecha de modificación de
los archivos (`mtime`)
[no se conservaba](https://github.com/gulpjs/vinyl-fs/issues/96) al escribirlo
en disco, sino que en su lugar el archivo se creaba con la fecha actual. Esto
ocasionaba que al compilar [libfuse](http://fuse.sourceforge.net), el comando
[make](https://www.gnu.org/software/make) diese problemas al creer que los
archivos habían sido modificados y necesitaban regenerarse.

Dicho problema [pude solucionarlo](https://github.com/gulpjs/vinyl-fs/pull/110)
mediante el uso de la función
[fs.utimes](https://nodejs.org/docs/v0.11.14/api/fs.html#fs_fs_utimes_path_atime_mtime_callback),
aunque al estar implementada en Node.js usando internamente la función
[utime](https://github.com/nodejs/node/blob/6fff47ffacfe663efeb0d31ebd700a65bf5521ba/deps/uv/src/unix/fs.c#L613),
la precisión [queda reducida a un segundo](http://linux.die.net/man/2/utimes).
Dicha resolución es suficiente para este caso, aunque después se sustituyó por
[fs.futimes](https://nodejs.org/api/fs.html#fs_fs_futimes_fd_atime_mtime_callback),
la cual internamente usa la función [futimes](http://linux.die.net/man/3/futimes)
y por tanto sí proporciona una precisión de milisegundos.

Mas tarde se descubrió que se había introducido un fallo debido a que
[no se estaba considerando el caso](https://github.com/gulpjs/vinyl-fs/issues/113)
de que los campos `atime` y `mtime` tuviesen valores inválidos, lo que solucioné
[ignorándolos](https://github.com/gulpjs/vinyl-fs/pull/114) y usando en su lugar
[una fecha nueva](https://github.com/gulpjs/vinyl-fs/pull/119) en tal caso. Esta
feature está disponible a partir de la versión *2.2.2* y en la versión *4.3.0*
de *download*.

Al solucionar el problema anterior he podido detectar otro bug en *vinyl-fs*, al
[escribirse](https://github.com/gulpjs/vinyl-fs/pull/110#issuecomment-148546290)
el modo del archivo aun en el caso de no estar definido. No obstante a partir de
Node.js v0.12 se están inicializando los `stats` de los archivos con todos los
valores posibles que puedan obtenerse o para los que se puedan definir valores
[por defecto](https://github.com/gulpjs/vinyl-fs/pull/110#issuecomment-148573049)
aceptables, por lo que la solución adoptada es la de emular dicha funcionalidad
cuando se usen versiones de Node.js mas antiguas que no la incluyan por defecto.
Sin embargo, también han surgido otros problemas relacionados con el uso de
funciones para el manejo de archivos que en determinadas circunstancias
requieren de permisos especiales, como son el propio *fs.utimes* pero que
también afectan a [chmod](http://linux.die.net/man/1/chmod) o
[chown](http://linux.die.net/man/1/chown), por lo que debido a esto se está
estudiando [un modo uniforme](https://github.com/gulpjs/vinyl-fs/issues/127) con
el que poder hacer uso de ellas.
