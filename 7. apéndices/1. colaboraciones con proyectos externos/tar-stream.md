#### tar-stream

El kernel de Linux utiliza el formato `cpio` para empaquetar el sistema de
archivos de *initramfs*, sin embargo tanto *Docker* como *vagga* sólo soportan
archivos `tar`. Para poder usar el mismo proceso de generación para ambos
entornos es preciso convertir entre ambos formatos, para lo cual se decidió usar
el módulo [tar-stream](https://github.com/mafintosh/tar-stream) para poder hacer
la conversión dinámicamente usando la API de streams de Node.js. Sin embargo, al
hacer la conversión se descubrió que los enlaces simbólicos se habían convertido
en archivos regulares dentro del paquete `tar`, y por tanto el binario de
Node.js no podía cargar las librerías del sistema dando error de símbolos no
definidos:

```bash
[piranna@Mabuk:~/Proyectos/NodeOS/node_modules/nodeos-barebones/.vagga/barebones]
 (vagga) > LD_LIBRARY_PATH=`pwd`/lib bin/node
Error loading shared library lisortbstdc++.so.6: Exec format error (needed by bin/node)
Error relocating bin/node: _Znam: symbol not found
Error relocating bin/node: _ZSt29_Rb_tree_insert_and_rebalancebPSt18_Rb_tree_node_baseS0_RS_: symbol not found
Error relocating bin/node: _ZSt17__throw_bad_allocv: symbol not found
Error relocating bin/node: _ZSt28_Rb_tree_rebalance_for_erasePSt18_Rb_tree_node_baseRS_: symbol not found
Error relocating bin/node: __cxa_guard_release: symbol not found
Error relocating bin/node: _ZSt18_Rb_tree_incrementPSt18_Rb_tree_node_base: symbol not found
Error relocating bin/node: _ZdlPv: symbol not found
Error relocating bin/node: _Znwm: symbol not found
Error relocating bin/node: _ZSt18_Rb_tree_decrementPSt18_Rb_tree_node_base: symbol not found
Error relocating bin/node: _ZSt18_Rb_tree_incrementPKSt18_Rb_tree_node_base: symbol not found
Error relocating bin/node: _ZdaPv: symbol not found
Error relocating bin/node: __cxa_guard_acquire: symbol not found
Error relocating bin/node: __cxa_pure_virtual: symbol not found
```

Este problema está ocasionado porque el módulo *tar-stream* no estaba usando el
modo del archivo para averiguar su tipo (sólo para definir los permisos de éste),
requiriendo en su lugar que se defina en un campo `type` y usando archivos
regulares en su defecto, por lo que se decidió añadir el soporte para que en
caso de que el tipo no estuviese definido éste pudiera detectarse
[automáticamente](https://github.com/NodeOS/tar-stream/commit/b2f57d1b248895d64d19c847fbe68854d9344d56)
a partir del modo.

No obstante, en el caso concreto de los enlaces simbólicos esto no fue suficiente,
ya que éstos no estaban obteniendo la ubicación del archivo original debido a la
estructura del formato `tar`, que requiere indicar dicha ubicación en la propia
cabecera, mientras que el módulo [cpio-stream](cpio-stream.html) estaba
transmitiéndola como el contenido de dicho archivo (lo cual estructuralmente es
lo correcto). En un principio se procedió a detectar el formato y rellenar dicha
cabecera previamente a añadir la entrada dentro del paquete `tar`, aunque
después se decidió añadir soporte en *tar-stream* para poder
[definir](https://github.com/NodeOS/tar-stream/commit/b32e9b6b39c15889d31d4d328e1b66cdf944ed27)
la ubicación del archivo original mediante un stream del contenido del archivo
si no se encontrase definida en la cabecera, de forma que finalmente el proceso
completo de convertir el archivo en formato `cpio` a `tar` pudiese ser realizado
en su totalidad mediante el uso de la API nativa de streams de Node.js:

```Javascript
#!/usr/bin/env node

var cpio = require('cpio-stream')
var tar  = require('tar-stream')


var extract = cpio.extract()
var pack    = tar.pack()

extract.on('entry', function(header, stream, callback)
{
  stream.pipe(pack.entry(header, callback))
})

extract.on('finish', pack.finalize.bind(pack))

process.stdin.pipe(extract)
pack.pipe(process.stdout)
```

Una vez hecho esto los enlaces simbólicos se generaron correctamente dentro del
archivo `tar` y pudieron ser cargados por el binario de Node.js. No obstante,
cuando el paquete generado contiene enlaces simbólicos hay un problema por el cual
[Docker no puede procesarlos](https://github.com/mafintosh/tar-stream/issues/44)
a diferencia de *vagga*, por lo que de momento los paquetes no son usables en
dicho entorno.

Por último, aparte de estos problemas, también estaba el hecho de que el código
de `Linux`, `gcc` y Node.js estaban empaquetados con la extensión `@LongLink`
que *tar-stream*
[no soportaba](https://github.com/mafintosh/tar-stream/issues/35), haciendo que
no se pudiese desempaquetar correctamente, aunque no hubo mayor problema una vez
se añadió el soporte para la misma.
