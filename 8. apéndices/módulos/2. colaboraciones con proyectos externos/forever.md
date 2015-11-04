#### forever

starter


[forever](https://github.com/foreverjs/forever) es uno de los mas populares
gestores de tareas de Node.js junto con [PM2](http://pm2.keymetrics.io), y se
decidio usarlo en un diseño anterior de NodeOS a modo de demonio del sistema
debido a su capacidad de administrar y reiniciar procesos de varios usuarios.
Para esta tarea le añadi la capacidad de poder usar un archivo de configuracion
durante su arranque aparte de poder ejecutar funciones y no solo comandos
externos. Sin embargo, debido al diseño actual donde cada usuario tiene su
propio sistema de archivos raiz y su propio ejecutable de inicio (pudiendo este
ser tambien un gestor de tareas) se esta estudiando el sustituirlo por alguna
alternativa mas simple que requiera menos recursos y sea mas facil de mantener.
