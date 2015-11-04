#### download-manager

El codigo fuente de las distintas dependencias de NodeOS necesarias para su
construccion debe ser descargado y en algunos casos procesado antes de poder
usarse, como puede ser su parcheo en el caso de *Node.js* o *gcc*, o bien de su
compilacion previa en el caso de las herramientas externas como `genext2fs`.
Puesto que estas tareas debian ser realizadas en distintos puntos, decidi hacer
un modulo independiente que se encargaran de procesarlas de forma uniforme en
todos los casos.

[download-manager](https://github.com/piranna/download-manager) esta basado en
el modulo [download](https://github.com/kevva/download) para la descarga del
código fuente de las distintas dependencias independientemente del formato en el
que sean distribuidas, al igual que para mostrar el progreso actual hace uso de
[download-status](https://github.com/kevva/download-status). Ademas detecta
cuando esta siendo ejecutado en un entorno no interactivo (como es el caso de
los servidores de integración continua) para mostrar unicamente las etapas que
esta ejecutando. Por otro lado tambien hace uso del modulo
[jsdiff](../2. colaboraciones con proyectos externos/jsdiff.html) para poder
aplicar los parches del codigo de cada uno de los proyectos automaticamente,
reduciendo la tarea del usuario a configurar las descargas y definir los pasos a
seguir para despues compilar estos.

Para usar el modulo basta con definir un array de objetos que describan las
descargas, indicando en estas la URL desde donde se descargaran y el nombre que
tendra el directorio donde esta se guarde finalmente una vez descomprimida. De
esta forma todas las dependencias se descargaran en paralelo y se instalaran y
procesaran simultaneamente. Igualmente, de forma opcional se pueden definir la
URL del parche a aplicar junto con la ruta donde debe aplicarse y si debe
omitirse algun fragmento en la ruta indicada dentro de las cabeceras del propio
parche (por lo que es recomendable revisarlo antes de configurar el módulo para
que se apliquen automaticamente). Por ultimo, tambien se puede definir la acción
a ejecutar cuando el codigo haya sido descargado y parcheado, como por ejemplo
compilarlo en el caso de las herramientas externas.
