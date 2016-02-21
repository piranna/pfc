# API
*Application Programming Interface* (*Interfaz de Programación de Aplicaciones*)
Conjunto de subrutinas, funciones y procedimientos ofrecidos por una librería o
programa para ser usados externamente. También se puede referir a los protocolos
usados por un servidor para poder hacer uso remotamente de su funcionalidad,
como es en el caso de los WebService o servicios web.

# AST
*Abstract Syntax Tree* (*Árbol de Sintaxis Abstracto*)
Estructura de los distintos elementos de un lenguaje de programación (funciones,
variables...) de un programa concreto organizada de forma jerarquizada para que
puedan ser fácilmente accedidos y transformados, por ejemplo para extraer sus
elementos, optimizarlo, compilarlo para una plataforma concreta, convertirlo a
otro lenguaje, generar su documentación...

# bindings
Conjunto de funciones que actúan de interfaz para poder usar una librería dentro
de un programa escrito en otro lenguaje, generalmente de alto nivel y/o script
como son Python o Javascript. También se suele denominar así a las librerías
para un lenguaje en concreto para acceder a los componentes ofrecidos por el
sistema operativo.

# BIOS
*Basic Input/Output System* (*Sistema Básico de Entrada y Salida*). Conjunto de
rutinas básicas de un ordenador introducidas por IBM y comunes a todos los PCs,
usadas principalmente durante el proceso de arranque.

# bundleDependencies
*dependencias integradas*, método por el que un paquete npm incluye alguna de
sus dependencias dentro de si mismo formando parte de su propio código.

# Concurso Universitario de Software Libre
Concurso de programación a nivel nacional celebrado en España desde 2006

# core dump
Fallo grave de una aplicación que impide que pueda continuar su ejecución, y que
según la configuración del sistema genera un archivo con una copia de la memoria
y del estado del microprocesador para su posterior depuración. El termino se
utiliza tanto para designar a dicho archivo como al error que lo provoco.

# CUSL
Véase Concurso Universitario de Software Libre

# dirección IP pública
Dirección IP accesible de forma directa desde cualquier punto de Internet

# Docker
herramienta de administración de contenedores LXC, la cual permite aislar unos
programas de otros en "containers" los cuales pueden englobar también sistemas
operativos enteros y ser usados como base para la personalización del sistema
"apilando" otros contenedores por encima de los usados como base.

# EFI
*Extensible Firmware Interface* (*Interfaz de Firmware Extensible*). Conjunto de
rutinas de bajo nivel proporcionadas por los ordenadores mas recientes y cuyo
objetivo es sustituir a las rutinas de la BIOS, ofreciendo una interfaz mas
sencilla y flexible.

# EGL
*Embedded openGL* (*openGL Embebido*), API gráfica para acceso nativo a la
tarjeta gráfica en entornos donde no hay disponible un sistema gráfico
independiente como X11, GDI, Cocoa... Permite disponer de gráficos acelerados
por hardware en dispositivos embebidos.

# firewall
Aplicación que administra y filtra las conexiones de red entrantes y salientes

# FUSE
*Filesystem in USErspace* (*sistema de archivos en espacio de usuario*).
funcionalidad del kernel de Linux y librería que permite desarrollar sistemas de
archivos como si fueran un programa normal. Es muy usado para el desarrollo de
sistemas de archivos experimentales o con un funcionamiento exótico, o para
circunvalar problemas legales como son licencias o patentes de software que
impiden que puedan incluirse dentro del kernel de Linux.

# GitHub
Repositorio online de versionado de software con algunas funcionalidades
similares a las de las redes sociales, lo cual lo ha convertido en uno de los
servicios favoritos entre los desarrolladores de software libre

# imagen ISO
Archivo cuyo contenido corresponde al de un CD o DVD real, listo para ser
grabado para ser grabado en estos.

# Internet de las Cosas
Conjunto de tecnologías que permiten que pequeños dispositivos electrónicos y
autónomos como lamparas, relojes, frigoríficos, sensores termostáticos... se
conecten a Internet y puedan realizar tareas cooperativamente entre ellos.

# journaling
Mecanismo ofrecido por algunos sistemas de archivos donde todas las operaciones
son escritas en un archivo "jornal" en lugar de hacerlo directamente sobre el
propio sistema de archivos, de forma que en caso de fallo fortuito (como por
ejemplo un apagón) el sistema pueda deshacer los cambios sin provocar perdida o
corrupción de datos.

# Kernel
Componente software encargada del control central de un sistema operativo.
Algunos ejemplos son el kernel Linux o [XNU](https://es.wikipedia.org/wiki/XNU)
en MacOS X.

# Kernel Panic
Fallo grave e irrecuperable del sistema cuya única solución posible es el
reinicio de la maquina.

# Linux
Kernel de sistema operativo con licencia libre desarrollado originalmente por
[Linus Torvalds](https://es.wikipedia.org/wiki/Linus_Torvalds) para PCs con
microprocesador 386 inspirándose en el sistema [Minix](http://www.minix3.org)
de [Andrew S. Tanenbaum](https://es.wikipedia.org/wiki/Andrew_S._Tanenbaum) y
actualmente portado y en uso en multitud de sistemas y plataformas, desde los
teléfonos con sistema operativo [Android](https://www.android.com) hasta
supercomputadores, pasando por equipos de escritorio o sistemas embebido. Su
código fuente esta disponible en http://kernel.org.

# Live CD
Método por el que un sistema operativo se distribuye como un CD autoarrancable,
principalmente usado para que los usuarios puedan probarlo antes de instalarlo
definitivamente en su disco duro, o como disco de rescate de emergencia.

# memory leak
Fallo de programación en el que se mantienen en uso regiones de memoria sin
referencias a ellas y por tanto sin poder ser utilizadas, provocando que el
proceso consuma cada vez mas memoria inútilmente afectando al rendimiento del
sistema hasta que este se queda sin memoria libre.

# npm
Gestor de paquetes oficial de Node.js, y el mas activo actualmente y con mayor
crecimiento de la historia de todos los que ha habido para cualquier lenguaje.
Su rico ecosistema ha influido la forma de trabajar no solo con Node.js o
Javascript en la web sino también en otros lenguajes como C++ o PHP donde han
surgido gestores de paquetes basados en él.

# out-of-tree
Tipo de compilación en la que los objetos temporales y los productos finales son
generados fuera del árbol del archivos del código fuente. Esto proporciona una
mayor limpieza y la posibilidad de eliminar los archivos compilados fácilmente.

# padding
Datos nulos o de "basura" usados para ajustar un texto o estructura de forma que
los datos queden alineados y sean mas fáciles de tratar.

# patrones Braille
Bloque de glifos Unicode que contiene los 256 patrones representables en una
celda Braille de 8 puntos y usada para poder "dibujar" lineas en alta definición
en terminales en modo texto.
http://en.wikipedia.org/wiki/Braille_Patterns

# pidfile
Archivo con información sobre la instancia actual de un proceso en ejecución
para poder reusarla en vez de crear nuevas instancias, permitiendo una mayor
integración dentro de la aplicación y un menor consumo de memoria.

# puntero
Variable cuyo contenido es una posición de memoria, usada para referenciar
indirectamente a otras variables. A pesar de la potencia y flexibilidad que
otorgan al permitir manipular directamente la memoria del programa, en los
lenguajes de alto nivel y en las ultimas revisiones de los lenguajes de bajo
nivel se proporcionan estructuras alternativas para los casos de uso mas
habituales debido a que su mal uso suelen provocar errores difíciles de detectar
que en muchos casos derivan en un memory leak o incluso en un core dump.

# REPL
*Read-Eval-Print-Loop* (*leer, evaluar, imprimir y repetir*). Modo de
funcionamiento interactivo que ofrecen los interpretes de un lenguaje de
programación.

# Rolling Release
Política de publicación de versiones en la que no hay versiones propiamente como
tales y en el que el último código publicado es válido en todo momento para ser
usado.

# umask
*user mask* (*mascara de usuario*). Patrón de permisos de acceso a los archivos
que se eliminan de los permisos que le aplica un usuario por defecto al crear
un nuevo archivo o directorio.

# VFAT
[Sistemas de archivos](https://technet.microsoft.com/en-us/library/cc938438.aspx)
desarrollados por Microsoft originalmente para MS-DOS y que por su sencillez de
estructuras internas e implementación están muy difundidos en todo tipo de
componentes y sistemas operativos, siendo por tanto el formato estándar
"de-facto" para almacenar datos en discos duros y pendrives que tengan que ser
accedidos por distintos equipos. Sin embargo debido a su antigüedad posee
algunas limitaciones técnicas como es el no poder almacenar archivos de mas de
4GB o la velocidad de acceso aleatorio a archivos muy grandes. Algunas de estas
limitaciones están solventadas por el mas reciente formato ExFAT (principalmente
el tamaño de los archivos) pero al estar protegido por patentes su adopción es
algo mas limitada.

# W3C
Consorcio encargado de definir los estándares y protocolos que deben seguir los
distintos navegadores web y demás servicios basados en Internet para garantizar
la interoperatibilidad.

# XIP
*eXecution In Place* (*ejecución en el sitio*). Modo de funcionamiento de
aplicaciones donde se ejecutan directamente sin copiarse previamente a la
memoria RAM, ahorrando el uso de recursos. Sin embargo, solo puede usarse en
entornos donde la velocidad de acceso de lectura al ejecutable es comparable a
la de la memoria RAM como es en el uso de discos RAM, memorias flash, SSD... ya
que sino la penalización en cuanto a rendimiento haría su uso inviable.

