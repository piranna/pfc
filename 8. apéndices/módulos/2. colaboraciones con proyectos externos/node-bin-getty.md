#### node-bin-getty

En las capas de
[barebones](../../../5. descripción informática/3. Implementación/1. barebones.html)
y de
[initramfs](../../../5. descripción informática/3. Implementación/2. initramfs.html)
se esta utilizando el emulador de terminal empleado durante el arranque del
kernel de Linux (`/dev/console`) como terminal interactivo. Esto es valido para
sistemas donde solo vaya a haber un único usuario conectado localmente como es
el caso de MacOS X o Plan9, pero para poder ejecutar varios terminales virtuales
es preciso inicializarlos previamente, siendo recomendable dejar `/dev/console`
solamente para los mensajes del kernel.

En el caso de NodeOS, esta funcionalidad es rehalizada por el modulo
[bin-getty](https://github.com/NodeOS/node-bin-getty), el cual implementa una
version simplificada de [getty](https://www.freebsd.org/cgi/man.cgi?query=getty)
la cual solo considera actualmente el uso de `/dev/console`, aunque mas adelante
se incluira el uso de terminales virtuales cuando se pruebe mas extensamente el
uso de NodeOS en hardware real (aunque siendo un sistema operativo orientado a
servidores en la nube esto ultimo no es una prioridad actualmente), reduciendose
su funcionalidad a solamente inicializar el terminal virtual y ejecutar el
comando dado por parametros.

En este proyecto consegui aislar un problema por el cual no se estaban pasando
correctamente los descriptores de fichero a usar por dicho comando, cerrandose
estos antes de haberlo hecho y por tanto no pudiendo interactuar con el. Este
error no se habia descubierto antes puesto que se estaba haciendo uso de Docker,
en el que `/dev/console` es redirigido al terminal actual donde se este
ejecutando por lo que siempre se encuentra abierto, sin embargo al ejecutarse en
hardware real o dentro de QEmu este terminal es independiente, por lo que al
cerrarse no puede seguir usandose.
