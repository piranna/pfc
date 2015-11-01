#### jsdiff

Debido al uso de `musl` como libreria del sistema, es necesario parchear tanto
Node.js como gcc para que puedan compilar correctamente. En el caso de Node.js
es debido al uso de la macro no estandar `TERMIOS` y exclusiva de `glibc` en
[OpenSSL](https://rt.openssl.org/Ticket/Display.html?id=2823), un antiguo bug
pendiente desde 2012 que finalmente se arreglo gracias en parte a mi
[insistencia](https://github.com/openssl/openssl/issues/163) para poder
facilitar la compilación de NodeOS, y desde la version 0.12.0 de Node.js ya no
es preciso parchearlo. Por otra parte, en el caso de gcc es preciso parchearlo
porque a pesar de incorporar soporte nativo para musl desde la version
[5.2.0](http://www.phoronix.com/scan.php?page=news_item&px=Musl-Libc-GCC-Support),
este soporte es solo para poder compilar binarios que lo utilicen como libreria
C del sistema pero no para que sea usada en la compilacion del propio gcc, lo
cual es necesario para generar el
[cross-compiler](../../../5. descripción informática/3. Implementación/0. cross-toolchain.html).

Puesto que los parches necesarios para Node.js y gcc usan ambos el formato
[diff unificado](http://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html)
el cual es estandar en todos los entornos UNIX, para poder aplicarlos desde
Javascript el unico modulo disponible que implementa dicho algoritmo es
[jsdiff](https://github.com/kpdecker/jsdiff), el cual tambien es capaz de
parsearlos. Sin embargo, al estar dicho modulo mas enfocado a su uso en textos
pequeños en paginas web en vez de para parchear programas completos dicha
implementacion tenia algunas limitaciones que impedian usarla para poder
parchear el codigo de proyectos grandes como es el caso de `gcc`.

El primero de los problemas encontrados fue la falta de soporte para poder usar
[parches que afecten](https://github.com/kpdecker/jsdiff/issues/60) a varios
archivos, lo cual el autor solucionó habilitando una API de bajo nivel para
poder parsear y procesar los parches manualmente mediante callbacks.

Del mismo modo, el nombre de los archivos no se estaba incluyendo dentro de los
[parches mostrados por su API](https://github.com/kpdecker/jsdiff/issues/82) por
lo que no era factible saber a que archivo habia que aplicar cada parche, aunque
en este caso era debido al metodo empleado para detectar dicho nombre e
identificar univocamente cada uno de ellos, consistente en el uso del metadato
`Index` a pesar de que segun el *formato diff unificado* no son estandar ninguno
de ellos, por lo que no es una fuente fiable que tener en cuenta. La solucion
que empleé en un principio fue utilizar el número de revision como identificador
único, aunque igual que en el caso de `Index` tampoco es una solucion completa
ya que hay casos en los que no se incluye ningun metadato que pueda utilizarse,
por lo que finalmente he adaptado `jsdiff` para que parsee
[correctamente](https://github.com/kpdecker/jsdiff/pull/88) las cabeceras de los
archivos para posteriormente poder extraer de ellas las rutas correctas a los
mismos. Esto era especialmente importante para poder usar el módulo
[download-manager](../1. módulos propios/download-manager.html) pudiendo aplicar
todos los parches sin necesitar tener en cuenta casos de uso concretos.

Por ultimo y mas importante, *jsdiff* no tenia soporte para aplicar parches cuya
localizacion no coincidiera exactamente con la
[indicada en los mismos](https://github.com/kpdecker/jsdiff/issues/84)
(*offset*), por lo que le he añadido dicho
[soporte](https://github.com/kpdecker/jsdiff/pull/83) y el cual desde la versión
[2.2.0](https://github.com/kpdecker/jsdiff/releases/tag/v2.2.0) esta integrado
en el código principal.
