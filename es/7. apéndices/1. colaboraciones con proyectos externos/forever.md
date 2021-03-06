#### forever

[forever](https://github.com/foreverjs/forever) es uno de los gestores de tareas
más populares de Node.js junto con [PM2](http://pm2.keymetrics.io), y en un
diseño anterior de NodeOS se decidió usarlo a modo de demonio del sistema debido
a su capacidad de administrar y reiniciar procesos de varios usuarios. Para esta
tarea se añadió la capacidad de poder usar un archivo de configuración durante
el inicio de su ejecución, aparte de poder ejecutar funciones y no sólo comandos
externos, junto con la posibilidad de ejecutar un *fallback* en caso de que un
proceso fallara, y también se realizó algunas limpiezas en su API para facilitar
su uso convirtiendo algunos parámetros en opcionales. Esto también supuso la
necesidad de hacer cambios de nomenclatura y usabilidad en su librería interna
[forever-monitor](https://github.com/foreverjs/forever-monitor), encargada de
toda la administración de los procesos, especialmente relativo al uso de
parámetros y opciones que no eran evidentes en primera instancia y de los que la
documentación no indicaba apenas ninguna información al respecto.

Sin embargo, debido al diseño actual donde cada usuario tiene su propio sistema
de archivos raíz y su propio ejecutable de inicio (pudiendo este ser también un
gestor de tareas) se está estudiando el sustituirlo por alguna alternativa más
simple que requiera menos recursos y sea más fácil de mantener. En este sentido,
se encargaría solamente de ejecutar los comandos definidos en un archivo JSON y
reiniciarlos si estos terminasen, sin la complicación extra que implica el
controlar comandos de distintos usuarios, el poder iniciar y parar los servicios
remotamente o la generación de estadísticas, ya que sólo se ejecutaría durante
el inicio del sistema por parte del usuario *root*, lo que implica que por el
diseño de NodeOS no pueda controlarse su ejecución. No obstante, dicha utilidad
podría servir también para ser ejecutada como comando `/init` de los propios
usuarios, por lo que se plantea delegar todas estas tareas de administración a
[Node Daemon Manager](comandos no utilizados actualmente.html#node-daemon-manager)
(*ndm*), el cual permite controlar demonios del sistema creados en Node.js para
ser ejecutados por los gestores nativos de Linux, Windows y OSX a partir de
paquetes npm y al que se añadió soporte para un comando de reinicio genérico, de
forma que no se requiriera al desarrollador el tener que implementar uno
especifico si no es necesario, y al que sería fácil añadir soporte para que
actualice dicho archivo JSON automáticamente.
