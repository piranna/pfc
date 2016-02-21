#### Comandos no utilizados actualmente

Aparte de los módulos indicados anteriormente, también se ha contribuido en el
desarrollo de otros que no están siendo usados actualmente, ya sea porque se ha
postergado su uso o porque se han encontrado otras alternativas mejores.

##### Node Daemon Manager

[Node Daemon Manager](https://github.com/npm/ndm) permite la creación y
administración de scripts de arranque y servicios del sistema tanto para Linux
([initctl](http://linux.die.net/man/8/initctl) y
[upstart](http://upstart.ubuntu.com)) como para MacOS X
([launchctl](http://ss64.com/osx/launchctl.html)), al que añadí soporte para
[usar un comando `restart` genérico](https://github.com/npm/ndm/pull/73) y no
obligar a los desarrolladores a incluir siempre uno propio, y al que también
[propuse el uso de funciones](https://github.com/npm/ndm/issues/78) en una clase
base en vez de plantillas para ofrecer mayor flexibilidad al portar a otros
sistemas. Esto venia dado por la intención de usarlo junto con el módulo
[forever](forever.md) cuando en un diseño anterior del sistema los servicios
estarían centralizados por lo que actualmente esta en desuso, pero gracias al
gestor de tareas minimalista [PalmTree](https://github.com/lite20/PalmTree)
creado por el colaborador de NodeOS [Lite McFish](https://github.com/lite20)
se plantea retomar el proyecto para que sea usado por cada uno de los usuarios
para administrar sus propios servicios del sistema si así lo desean.

##### node-cron

[node-cron](https://github.com/ncb000gt/node-cron) es una implementación del
comando `cron` compatible con el formato utilizado en los sistemas Unix normales,
aunque solo permitía ejecutar funciones definidas dentro de la aplicación en vez
de comandos externos. Por este motivo, decidí añadirle dicho soporte para que
pueda ser usado como alternativa al mismo.

##### npm-registry-client

Debido a las primeras pruebas que hice donde descubrí que *musl* tenía problemas
para poder compilar *OpenSSL* decidí desactivar su soporte en Node.js, aunque
esto provocó que npm fallase debido a que el módulo
[npm-registry-client](https://github.com/piranna/npm-registry-client) usado
internamente para conectarse al repositorio de paquetes no consideraba la
posibilidad de que el soporte no estuviera disponible a pesar de que la
aplicación sí soporta el descargar los paquetes mediante una conexión no segura,
por lo que le añadí soporte para que detectara si Node.js fue compilado sin
OpenSSL y por tanto desactivara el soporte de descargar los paquetes mediante
HTTP. Actualmente se puede compilar *OpenSSL* usando *musl* sin problemas, por
lo que dicha modificación ya no es necesaria.
