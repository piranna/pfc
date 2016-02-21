#### download-checksum

Para poder comprobar los hashes de los archivos y sus firmas al usar
[download-manager](download-manager.html) a medida que éstos se estuviesen
descargando y tener garantía de que las descargas se han producido correctamente
he desarrollado el módulo
[download-checksum](https://github.com/piranna/download-checksum) como un plugin
independiente para [download](https://github.com/kevva/download), de forma que
pueda ser reusado en otros proyectos.

La forma de usarlo consiste en inicializar el módulo con un objeto o array de
objetos, conteniendo cada uno de ellos un campo `url` para identificar cada una
de las descargas (en el caso de indicar un objeto y por tanto una única descarga,
el campo `url` es opcional al ser usado únicamente como identificador), y otro
campo con el nombre del algoritmo de hash y su valor en hexadecimal, admitiendo
todos los algoritmos de hash soportados por Node.js. Este formato es compatible
con el usado en *download-manager* para definir las descargas, por lo que puede
usarse directamente el mismo objeto para la configuración de ambos. En el caso
de las firmas digitales, en vez del valor de la firma como una cadena de texto
como en el caso de los *checksums*, se usa en su lugar un objeto con los campos
`keys` y `signature` conteniendo las claves públicas y la firma digital ambas en
texto plano, o bien los mismos argumentos con el sufijo `File` para indicar la
ruta del archivo de donde pueden obtenerse las mismas.

A pesar de que los tests unitarios pasaban correctamente, en un primer momento
no llego a funcionar el plugin debido a un problema en el módulo
[duplexify](https://github.com/mafintosh/duplexify) por el cual se estaba
[consumiendo](https://github.com/kevva/download/issues/83) el primer conjunto de
datos del stream cuando estos eran cargados. Esto no afecta a las descargas de
los archivos pero si a los plugins que necesitan inspeccionar el contenido
completo de éstos, por lo que hasta que dicho problema pueda ser arreglado la
solución empleada ha sido obtener dicho fragmento de datos manualmente desde los
buffers internos de la librería después de inspeccionar su estructura:

```Javascript
var pipes = response._readableState.pipes
if(pipes) pipes.buffer.forEach(hash.update.bind(hash))
```

En el caso de las firmas digitales, se ha hecho uso del módulo
[openpgp](https://github.com/openpgpjs/openpgpjs), el cual implementa el formato
de firma y encriptación [PGP](http://tools.ietf.org/html/rfc4880) en Javascript.
Para permitir que pueda ser usado mediante streams de forma similar a los hashes
he creado una clase con su misma API, la cual recoge el contenido de todo el
archivo a medida que es descargado para proceder a la verificación de la firma
una vez que ha terminado. Para ello antes he tenido que aprender a crear una
[clave propia](https://www.gnupg.org/gph/en/manual/c14.html#AEN25) con la que
después [firmar](https://www.gnupg.org/gph/en/manual/x135.html#AEN152) una
cadena de prueba para poder ser incluidas en los tests unitarios.
