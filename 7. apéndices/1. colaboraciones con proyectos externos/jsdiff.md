#### jsdiff

Debido al uso de `musl` como librería del sistema, es necesario parchear tanto
Node.js como `gcc` para que puedan compilar correctamente. En el caso de
Node.js, esto es debido al uso de la macro no estándar `TERMIOS` y exclusiva de
`glibc` en [OpenSSL](https://rt.openssl.org/Ticket/Display.html?id=2823), un
antiguo bug pendiente desde 2012 que finalmente se arreglo en parte gracias a mi
[insistencia](https://github.com/openssl/openssl/issues/163) para poder
facilitar la compilación de NodeOS, y desde la versión 0.12.0 de Node.js ya no
es preciso parchearlo. Por otra parte, en el caso de `gcc` es preciso parchearlo
porque a pesar de incorporar soporte nativo para `musl` desde la versión
[5.2.0](http://www.phoronix.com/scan.php?page=news_item&px=Musl-Libc-GCC-Support),
este soporte es sólo para poder compilar binarios que lo utilicen como librería
C del sistema pero no para que sea usada en la compilación del propio `gcc`, lo
cual es necesario para generar el
[cross-compiler](../../../4. descripción informática/3. Implementación/0. cross-toolchain.html).

Puesto que los parches necesarios para Node.js y `gcc` usan ambos el formato
[diff unificado](http://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html),
el cual es estándar en todos los entornos UNIX, para poder aplicarlos desde
Javascript el único módulo disponible que implementa dicho algoritmo es
[jsdiff](https://github.com/kpdecker/jsdiff), el cual también es capaz de
parsearlos. Sin embargo, al estar dicho módulo más enfocado a su uso en textos
pequeños dentro de páginas web en vez de para parchear programas completos,
dicha implementación tenía algunas limitaciones que impedían usarla para poder
parchear el código de proyectos grandes como es el caso de `gcc`.

El primero de los problemas encontrados fue la falta de soporte para poder usar
[parches que afecten a varios archivos](https://github.com/kpdecker/jsdiff/issues/60),
lo cual el autor solucionó habilitando una API de bajo nivel para poder parsear
y procesar los parches manualmente mediante callbacks.

Del mismo modo, el nombre de los archivos no se estaba incluyendo dentro de los
[parches mostrados por su API](https://github.com/kpdecker/jsdiff/issues/82),
por lo que no era factible saber a que archivo había que aplicar cada parche,
aunque en este caso era debido al método empleado para detectar dicho nombre e
identificar unívocamente cada uno de ellos, consistente en el uso del metadato
`Index` a pesar de que según el *formato diff unificado* no son estándar ninguno
de ellos, por lo que no es una fuente fiable a tener en cuenta. La solución que
se empleó en un principio fue utilizar el número de revisión como identificador
único, aunque igual que en el caso de `Index` tampoco es una solución completa
ya que hay casos en los que no se incluye ningún metadato que pueda utilizarse,
por lo que finalmente se adaptó *jsdiff* para que pueda parsear
[correctamente](https://github.com/kpdecker/jsdiff/pull/88) las cabeceras de los
archivos para posteriormente poder extraer de ellas las rutas correctas a los
mismos. Esto era especialmente importante para poder usar el módulo
[download-manager](../../4. descripción informática/3. Implementación/7. módulos propios/download-manager.html) pudiendo aplicar
todos los parches sin necesitar tener en cuenta casos de uso concretos.

Por último y mas importante, *jsdiff* no tenia soporte para aplicar parches cuya
localización no coincidiera exactamente con la
[indicada en los mismos](https://github.com/kpdecker/jsdiff/issues/84)
(*offset*), por lo que se le ha añadido dicho
[soporte](https://github.com/kpdecker/jsdiff/pull/83) y el cual desde la versión
[2.2.0](https://github.com/kpdecker/jsdiff/releases/tag/v2.2.0) está integrado
en el código principal.
