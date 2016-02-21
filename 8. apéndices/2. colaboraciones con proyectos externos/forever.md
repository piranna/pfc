#### forever

[forever](https://github.com/foreverjs/forever) es uno de los gestores de tareas
mas populares de Node.js junto con [PM2](http://pm2.keymetrics.io), y en un
diseño anterior de NodeOS se decidió usarlo a modo de demonio del sistema debido
a su capacidad de administrar y reiniciar procesos de varios usuarios. Para esta
tarea le añadí la capacidad de poder usar un archivo de configuración durante el
inicio de su ejecución, aparte de poder ejecutar funciones y no solo comandos
externos, junto con la posibilidad de ejecutar un fallback en caso de que un
proceso fallara, y también realice algunas limpiezas en su API para facilitar su
uso convirtiendo algunos parámetros en opcionales. Esto también supuso la
necesidad de hacer cambios de nomenclatura y usabilidad en su librería interna
[forever-monitor](https://github.com/foreverjs/forever-monitor), encargada de
toda la administración de los procesos, especialmente relativo al uso de
parámetros y opciones que no eran evidentes en primera instancia y de los que la
documentación no indicaba apenas nada.

Sin embargo, debido al diseño actual donde cada usuario tiene su propio sistema
de archivos raíz y su propio ejecutable de inicio (pudiendo este ser también un
gestor de tareas) se esta estudiando el sustituirlo por alguna alternativa mas
simple que requiera menos recursos y sea mas fácil de mantener. En este sentido,
se encargaría solamente de ejecutar los comandos definidos en un archivo JSON y
reiniciarlos si estos terminasen, sin la complicación extra que implica el
controlar comandos de distintos usuarios, el poder iniciar y parar los servicios
remotamente o la generación de estadísticas, ya que solo se ejecutaría durante
el inicio del sistema por parte del usuario *root*, lo que implica que por el
diseño de NodeOS no pueda controlarse su ejecución. No obstante, dicha utilidad
podría servir también para ser ejecutada como comando `/init` de los propios
usuarios, por lo que se plantea delegar todas esta tareas de administración a
[Node Daemon Manager](comandos no utilizados actualmente.html#node-daemon-manager)
(*ndm*), el cual permite controlar demonios del sistema creados en Node.js para
ser ejecutados por los gestores nativos de Linux, Windows y OSX a partir de
paquetes npm y al que añadí soporte para un comando de restart genérico de forma
que no se requiriera al desarrollador que implemente uno especifico si no es
necesita, y al que sería fácil añadir soporte para que actualice dicho archivo
JSON.
