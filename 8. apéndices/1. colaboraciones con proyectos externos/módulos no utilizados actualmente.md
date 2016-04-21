#### Módulos no utilizados actualmente

Aparte de los módulos indicados anteriormente, también se ha contribuido en el
desarrollo de otros que no están siendo usados actualmente, ya sea porque se ha
postergado su uso o porque se han encontrado otras alternativas mejores.

##### Node Daemon Manager

[Node Daemon Manager](https://github.com/npm/ndm) permite la creación y
administración de scripts de arranque y servicios del sistema tanto para Linux
([initctl](http://linux.die.net/man/8/initctl) y
[upstart](http://upstart.ubuntu.com)) como para MacOS X
([launchctl](http://ss64.com/osx/launchctl.html)), al que se añadió soporte para
[usar un comando `restart` genérico](https://github.com/npm/ndm/pull/73) y no
obligar a los desarrolladores a incluir siempre uno propio, y al que también
[se propuso el uso de funciones](https://github.com/npm/ndm/issues/78) en una
clase base en vez de plantillas para ofrecer mayor flexibilidad al portar a
otros sistemas. Esto venia dado por la intención de usarlo junto con el módulo
[forever](forever.md) cuando en un diseño anterior del sistema los servicios
estarían centralizados, por lo que actualmente esta en desuso, pero gracias al
gestor de tareas minimalista [PalmTree](https://github.com/lite20/PalmTree)
creado por el colaborador de NodeOS [Lite McFish](https://github.com/lite20)
se plantea retomar el proyecto para que sea usado por cada uno de los usuarios
para administrar sus propios servicios del sistema si así lo desean.

##### node-century

[century](https://github.com/groundwater/node-century) es un proceso `init` del
sistema mínimo, encargado de recoger procesos zombie y evitar que puedan llegar
a provocar un *kernel panic* y delegando cualquier otra tarea a otros procesos.
Las APIs de Node.js sólo permiten controlar los procesos hijo que haya empezado
el propio proceso, por lo que para poder recoger todos los procesos zombie del
sistema (incluso los que no sean hijos directos suyos) *century* implementa un
módulo compilado que hace uso de [waitpid](http://linux.die.net/man/3/waitpid),
e iterativamente comprueba cada 3 segundos si ha habido procesos nuevos para ir
eliminándolos correctamente y limpiándolos del sistema. Se ha deprecado su uso
en beneficio de [nodeos-init](../../5. descripción informática/3. Implementación/7. módulos propios/nodeos-init.html) para
permitir el montaje del sistema de archivos *devtmpfs* antes de ejecutar
cualquier instancia de Node.js, tarea necesaria a partir de la versión 0.11.15.

##### node-cron

[node-cron](https://github.com/ncb000gt/node-cron) es una implementación del
comando `cron` compatible con el formato utilizado en los sistemas Unix normales,
aunque sólo permitía ejecutar funciones definidas dentro de la aplicación en vez
de comandos externos. Por este motivo, decidí añadirle dicho soporte para que
pueda ser usado como alternativa al mismo.

##### npm-registry-client

Debido a las primeras pruebas que se hicieron donde se descubrió que *musl*
tenía problemas para poder compilar *OpenSSL*, se decidió desactivar su soporte
en Node.js, aunque esto provocó que npm fallase debido a que el módulo
[npm-registry-client](https://github.com/piranna/npm-registry-client) usado
internamente para conectarse al repositorio de paquetes no consideraba la
posibilidad de que el soporte no estuviera disponible a pesar de que la
aplicación sí soporta el descargar los paquetes mediante una conexión no segura,
por lo que se añadió soporte para que detectara si Node.js fue compilado sin
OpenSSL y por tanto desactivara el soporte de descargar los paquetes mediante
HTTP. Actualmente se puede compilar *OpenSSL* usando *musl* sin problemas, por
lo que dicha modificación ya no es necesaria.
