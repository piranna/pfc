#### forever

[forever](https://github.com/foreverjs/forever) es uno de los mas populares
gestores de tareas de Node.js junto con [PM2](http://pm2.keymetrics.io), y se
decidio usarlo en un diseño anterior de NodeOS a modo de demonio del sistema
debido a su capacidad de administrar y reiniciar procesos de varios usuarios.
Para esta tarea le añadi la capacidad de poder usar un archivo de configuración
durante el inicio de su ejecución, aparte de poder ejecutar funciones y no solo
comandos externos, junto con la posibilidad de ejecutar un fallback en caso de
que un proceso fallara, y también realice algunas limpiezas en su API para
facilitar su uso convirtiendo algunos parametros en opcionales. Esto también
supuso la necesidad de hacer cambios en su libreria interna
[forever-monitor](https://github.com/foreverjs/forever-monitor), encargada de
toda la administración de los procesos, especialmente relativo al uso de
parametros y opciones que no eran evidentes en primera instancia y de los que la
documentación no indicaba apenas nada.

Sin embargo, debido al diseño actual donde cada usuario tiene su própio sistema
de archivos raíz y su propio ejecutable de inicio (pudiendo este ser también un
gestor de tareas) se esta estudiando el sustituirlo por alguna alternativa mas
simple que requiera menos recursos y sea mas facil de mantener.
