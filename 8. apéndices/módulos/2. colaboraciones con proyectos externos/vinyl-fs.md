#### vinyl-fs

El modulo [download](https://github.com/kevva/download) usado para descargar y
descomprimir automaticamente todos los componentes de construccion de NodeOS
internamente hace uso de [vinyl-fs](https://github.com/gulpjs/vinyl-fs), el cual
aplica la API de streams de Node.js para su uso con archivos (incluidos sus
metadatos).

El modulo tenia un problema por el cual la fecha de modificacion de los archivos
(`mtime`) [no se conservaba](https://github.com/gulpjs/vinyl-fs/issues/96) al
escribirlo en disco, sino que en su lugar el archivo se creaba con la fecha
actual. Esto ocasionaba que al compilar [libfuse](http://fuse.sourceforge.net)
el comando [make](https://www.gnu.org/software/make) diese problemas al creer
que todos los archivos habian sido modificados.

Finalmente [pude solucionarlo](https://github.com/gulpjs/vinyl-fs/pull/110)
mediante el uso de la funcion
[fs.utimes](https://nodejs.org/docs/v0.11.14/api/fs.html#fs_fs_utimes_path_atime_mtime_callback),
aunque al estar implementada en Node.js usando internamente la funcion
[utime](https://github.com/nodejs/node/blob/6fff47ffacfe663efeb0d31ebd700a65bf5521ba/deps/uv/src/unix/fs.c#L613),
la precision [queda reducida a un segundo](http://linux.die.net/man/2/utimes).
No obstante, dicha resolucion es suficiente para este caso. Mas tarde se
[descubrio un fallo](https://github.com/gulpjs/vinyl-fs/issues/113) debido a que
no se estaba consideranado el caso de que los campos `atime` y `mtime` tengan
valores invalidos, lo que [solucione](https://github.com/gulpjs/vinyl-fs/pull/114)
ignorandolos y [usando fecha nueva](https://github.com/gulpjs/vinyl-fs/pull/119)
en tal caso. Esta feature esta disponible a partir de la version *2.2.2* y en la
version *4.3.0* de *download*.

Al solucionar el problema anterior he podido detectar otro bug en *vinyl-fs*, al
[escribirse](https://github.com/gulpjs/vinyl-fs/pull/110#issuecomment-148546290)
el modo del archivo aun en el caso de no estar definido. No obstante a partir de
Node.js v0.12 se estan inicializando los stats de los archivos con todos los
valores posibles que puedan obtenerse o para los que se puedan definir valores
[por defecto](https://github.com/gulpjs/vinyl-fs/pull/110#issuecomment-148573049)
aceptables, por lo que la solucion adoptada es la de mostrar dicha funcionalidad
cuando se usen versiones de Node.js mas antiguas.
