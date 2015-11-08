#### download-checksum

Para poder comprobar los hashes de los archivos y sus firmas al usar
[download-manager](download-manager.html) a medida que estos se estan
descargando y tener garantia de que las descargas se han producido correctamente,
he desarrollado el módulo
[download-checksum](https://github.com/piranna/download-checksum) como un plugin
para independiente para [download](https://github.com/kevva/download), de forma
que pueda ser reusado por otros proyectos.

La forma de usarlo consiste en inicializar el modulo con un objeto o array de
objetos, conteniendo cada uno de ellos un campo `url` para identificar cada una
de las descargas (en el caso de indicar un objeto, el campo `url` es opcional),
y otro campo con el nombre del algoritmo de hash y su valor en hexadecimal,
admitiendo todos los algoritmos de hash soportados por Node.js. Este formato es
compatible con el usado en *download-manager* para definir las descargas, por lo
que puede usarse directamente el mismo objeto. En el caso de las firmas
digitales, en vez del valor de la firma como una cadena de texto se usa un
objeto con los campos `keys` y `signature` conteniendo las claves publicas y la
firma digital ambas en texto plano, o bien los mismos argumentos con el sufijo
`File` para indicar el path del archivo de donde pueden obtenerlos.

A pesar de que los tests unitarios pasaban correctamente, en un primer momento
no llego a funcionar el plugin debido a un problema en el módulo
[duplexify](https://github.com/mafintosh/duplexify) por el cual se estaba
[consumiendo](https://github.com/kevva/download/issues/83) el primer conjunto de
datos del stream cuando estos eran cargados. Esto no afecta a las descargas de
los archivos pero si a los plugins que necesitan inspeccionar todos sus datos a
medida que estos son descargados, por lo que hasta que dicho problema pueda ser
arreglado la solución empleada ha sido obtener dicho fragmento de datos
manualmente desde uno de los buffers de la libreria despues de inspeccionar sus
estructuras de datos internas:

```Javascript
if(response._readableState.pipes)
  hash.update(response._readableState.pipes.buffer[0])
```

En el caso de las firmas digitales, se ha hecho uso del módulo
[openpgp](https://github.com/openpgpjs/openpgpjs), el cual implementa el formato
de firma y encriptación [PGP](http://tools.ietf.org/html/rfc4880) en Javascript.
Para permitir que pueda ser usado mediante streams de forma similar a los hashes
he creado una clase con su misma API, la cual recoge el contenido de todo el
archivo a medida que es descargado para proceder a la verificación de la firma
una vez que ha terminado. Para ello antes he tenido que aprender a crear una
[clave propia](https://www.gnupg.org/gph/en/manual/c14.html#AEN25) con la que
despues [firmar](https://www.gnupg.org/gph/en/manual/x135.html#AEN152) una
cadena de prueba para poder ser incluidas en los tests unitarios.
