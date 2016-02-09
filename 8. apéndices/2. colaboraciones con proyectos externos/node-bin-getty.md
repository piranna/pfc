#### node-bin-getty

En las capas de
[barebones](../../../5. descripción informática/3. Implementación/1. barebones.html)
y de
[initramfs](../../../5. descripción informática/3. Implementación/2. initramfs.html)
se está utilizando el pseudo-terminal `/dev/console` empleado durante el
arranque del kernel de Linux como terminal interactivo. Esto es válido para
sistemas donde solo vaya a haber un único usuario conectado localmente, como es
el caso de MacOS X o Plan9, pero para poder ejecutar varios terminales virtuales
es preciso inicializarlos previamente, siendo recomendable dejar `/dev/console`
sólamente para los mensajes del kernel.

En el caso de NodeOS, esta funcionalidad es realizada por el módulo
[bin-getty](https://github.com/NodeOS/node-bin-getty), el cual implementa una
versión simplificada de [getty](https://www.freebsd.org/cgi/man.cgi?query=getty)
que actualmente solo considera el uso de `/dev/console`, aunque mas adelante se
incluira el uso de terminales virtuales cuando se pruebe mas extensamente el uso
de NodeOS en hardware real, aunque siendo un sistema operativo orientado a
servidores en la nube esto último no es actualmente una prioridad. Después de
inicializar el terminal virtual, su labor se reduce a usarlo como entrada y
salida estandar del proceso que se le pase como argumento para que actue como
login del sistema.

En este proyecto conseguí aislar un problema por el cual se estaban cerrando los
descriptores de fichero usados como entrada y salida estandar antes de que el
proceso se iniciara y por tanto no pudiendo interactuar con él. Este error no se
habia descubierto antes puesto que se estaba haciendo uso de *Docker*, en el que
`/dev/console` es redirigido al terminal actual donde se esté ejecutando, por lo
que siempre se encuentra abierto. Sin embargo, al ejecutarse en hardware real o
dentro de *QEmu* este terminal es independiente, por lo que al cerrarse los
descriptores de ficheros ya no podian seguir usandose. El proyecto también
necesitó de la actualización de sus dependencias
[src-unistd](https://github.com/netlovers/node-src-unistd) y
[src-termios](https://github.com/netlovers/node-src-termios) para que pudieran
funcionar en Node.js 0.11, empleandose las macros ofrecidas por el módulo
[nan](https://github.com/nodejs/nan) para ello.
