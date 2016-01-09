## Estadisticas

Se han realizado diversas estadísticas tanto de rendimiento de CPU como de red,
al igual que de consumo de memoria. Los equipos empleados en dichas pruebas han
sido:

* Portatil Dell Latitude D530
* Portatil Apple MacBook Pro 2012
* Sobremesa HP

Salvo que se indique lo contrario, en todos ellos se ha ejecutado Ubuntu 15.10
"Wily Werewolf" usando un kernel Linux 4.3 y Node.js en sus versiones 0.12 y
5.3 arrancandolo tanto en un entorno de escritorio completo como desde una
consola de administrador en modo mono-usuario (*single*). También se ha
ejecutado en ellos NodeOS de forma nativa con Node.js 0.11.14 a excepción del
portatil Apple MacBook Pro 2012, el cual hace uso de EFI en lugar de BIOS y por
tanto no ha sido posible arrancar el sistema con él. De esta forma, se pueden
identificar las variaciones de rendimiento de NodeOS respecto al resto de
equipos teniendo en cuenta distintas CPUs (tanto de 32 como de 64 bits) como de
versiones de Linux y de Node.js utilizadas.

### CPU

El rendimiento de CPU se ha rehalizado mediante el uso del módulo
[performance](https://github.com/alexfernandez/performance). Dicho módulo
ejecuta repetidamente distintas tareas básicas del lenguaje Javascript como la
obtención de la fecha actual o de valores aleatorios o el recorrer listas,
junto con otras mas avanzadas proporcionadas por Node.js como el cálculo de
shashes criptográficos o la concatenación de [buffers](). De esta forma, se
puede comprobar el rendimiento tanto del motor Javascript v8 como de las
extensiones y módulos internos de Node.js en operaciones de gran consumo de CPU.



### Red

Para comprobar el rendimiento de red se ha hecho uso del módulo
[loadtest](https://github.com/alexfernandez/loadtest), el cual permite hacer
tests de carga sobre servidores HTTP creando un flujo constante de peticiones
por segundo, y tambien incorpora su propio servidor de pruebas cuando no se
tiene o se quiera usar uno real.



### Memoria

Por último, el consumo de memoria es comprobado a partir de los datos del
archivo `/proc/meminfo`, el cual proporciona información sobre los distintos
tipos de memoria disponibles en el sistema en tiempo real. Los datos son
comprobados con el sistema recien arrancado y sin tener haberse ejecutado
ninguna aplicación, mostrandose los datos correspondientes al uso de memoria
del sistema justo en el momento en que esta listo para ser usado. En el caso de
la capa *barebones*, al no estar disponible el sistema de archivos */proc*, en
su lugar se han obtenido los datos del consumo de memoria mediante las
funciones `os.freemem()` y `os.totalmen()` proporcionadas por Node.js.



estadisticas de uso de memoria en cada capa, 32/64 bits
  comparar con Ubuntu (/proc/meminfo)
