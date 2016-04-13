# Conclusiones

1. [Estadísticas](1. Estadísticas/index.html)
2. [Logros principales alcanzados](2. Logros principales alcanzados.html)
  1. [Reconocimiento de la comunidad](2. Logros principales alcanzados.html#reconocimiento-de-la-comunidad)
  2. [Repercusión del proyecto](2. Logros principales alcanzados.html#repercusión-del-proyecto)
3. [Posibles trabajos futuros](3. Posibles trabajos futuros.html)
  1. [Actualizar versión de Node.js](3. Posibles trabajos futuros.html#actualizar-versión-de-node.js)
  2. [Separar módulos en proyectos independientes](3. Posibles trabajos futuros.html#separar-módulos-en-proyectos-independientes)
  3. [Compilación para ARM y MIPS](3. Posibles trabajos futuros.html#compilación-para-arm-y-mips)
  4. [Descarga de dependencias](3. Posibles trabajos futuros.html#descarga-de-dependencias)
  5. [Kernels alternativos](3. Posibles trabajos futuros.html#kernels-alternativos)
  6. ["Sabores" del sistema operativo](3. Posibles trabajos futuros.html#"Sabores"-del-sistema-operativo)
  7. [Mejorar la experiencia de usuario](3. Posibles trabajos futuros.html#mejorar-la-experiencia-de-usuario)
    1. [Modo texto](3. Posibles trabajos futuros.html#modo-texto)
    2. [Interfaz gráfica](3. Posibles trabajos futuros.html#interfaz-gráfica)
    3. [Añadir soporte de múltiples framebuffers al kernel de Linux](3. Posibles trabajos futuros.html#añadir-soporte-de-múltiples-framebuffers-al-kernel-de-linux)
  8. [Uso de memoria](3. Posibles trabajos futuros.html#uso-de-memoria)
    1. [Reducir el consumo de memoria](3. Posibles trabajos futuros.html#reducir-el-consumo-de-memoria)
    2. [Ajustar la ejecución del Recolector de Basura](3. Posibles trabajos futuros.html#ajustar-la-ejecución-del-recolector-de-basura)
    3. [Uso de zram](3. Posibles trabajos futuros.html#uso-de-zram)


Al contrario de lo que pensé en un principio, este proyecto me ha permitido ver
que lo más complicado de desarrollar un sistema operativo no es su programación,
la cual ha sido bastante menor de lo que en un principio se podría suponer
puesto que la mayoría de sus elementos ya están hechos y testeados previamente,
sino la orquestación y configuración de los distintos componentes para que el
sistema funcione correctamente, lo que me ha permitido conocer mejor cómo
funcionan los distintos elementos del mismo y la relación entre ellos. Otro
aspecto importante ha sido aprender a organizar el grupo de desarrolladores y
a administrar los issues, recogiendo sugerencias y problemas acontecidos, y
moderándolos (ya que, a efectos prácticos, ha funcionado también como lista de
correo y foro), y también a promocionar y hacer publicidad del proyecto y a
recabar atención sobre él mismo mediante la inscripción en diversos concursos, la
publicación de artículos o solicitando la colaboración de los distintos
proyectos de los que NodeOS depende, tanto para su fase de construcción como para
su funcionamiento. Esto también me ha permitido aprender a valorar la
importancia de anotar los cambios, evolución y desarrollo del proyecto para
poder después tener referencias sobre los problemas que ha habido y la forma en
que se han resuelto de cara a poder ser documentados y estudiados posteriormente.

También me ha permitido comprobar que las mayores virtudes del ecosistema de
Javascript y de Node.js son su dinamismo y su modularidad, los cuales les dan
mucha flexibilidad para poder adaptarse a los cambios. Sin embargo, estos
también son a la vez sus mayores defectos debido a lo inestable que se vuelve el
desarrollo, ya que un módulo de terceros puede afectar a todo el sistema. Esto
es algo que ha afectado directamente a NodeOS en dos ocasiones: la primera por
el cambio en la versión empleada del motor Javascript `v8` por Node.js, que ha
imposibilitado por el momento usar cualquier versión de Node.js superior a la
0.11.14, y la segunda, más reciente y relacionada con la anterior, por la
actualización de varios módulos compilados, para hacer uso de las macros
ofrecidas por la versión 2 del módulo `nan`, necesarias para que estos sean
compatibles con Node.js 5.

Respecto al problema de las versiones han surgido soluciones como son el uso de
[bundledDependencies](https://docs.npmjs.com/files/package.json#bundleddependencies)
o de [shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) (o el propio módulo
`nan` en el caso de la compatibilidad de los módulos compilados entre versiones)
y se siguen planteando otras nuevas como son el uso de paquetes comprimidos[^1],
o el firmado de módulos. Ninguna de estas soluciones es óptima o definitiva por
sí sola, aunque mientras tanto se están intentando promover códigos de buena
conducta como el uso de [versionado semántico](http://semver.org) estricto o la
conversión de módulos de la librería estándar en paquetes `npm` para prevenir
cambios en las APIs.

No obstante, también he podido comprobar en primera persona la idiosincrasia y
reticencias de algunos desarrolladores a aceptar la inclusión de cambios en su
código. Esto es algo que a veces ocurre en el software libre, pero se hace más
patente en el ecosistema de Node.js debido a su rápido crecimiento, que no ha
permitido que se adopte un código de conducta común, y a la tradicional falta
de convenciones en Javascript a diferencia de lo que ocurre en otros lenguajes
como [Python](https://www.python.org) y su guía de estilo
[PEP 8](https://www.python.org/dev/peps/pep-0008), que plantea unos mínimos de
calidad ampliamente aceptados por toda la comunidad. Algunos de los problemas
con los que me he encontrado han sido:

* el uso de lenguajes transpilados ([CoffeScript](http://coffeescript.org),
  [TypeScript](http://www.typescriptlang.org), [EcmaScript 6](http://babeljs.io)...)
  sin incluir su código Javascript equivalente generado que impiden el poder
  usar directamente los repositorios de GitHub como dependencias en la fase de
  desarrollo durante el tiempo que se espera a la inclusión de los cambios en el
  repositorio principal. Ésta es una de las razones por las que los principales
  desarrolladores de Node.js deciden usar directamente las características
  estándar que ofrece el lenguaje, sin la ayuda de componentes externos.
* el uso de tabuladores o de más 80 columnas en el código fuente. dificultando
  su lectura en navegadores web o en pantallas pequeñas.
* la adhesión a guías de estilo sin el uso de checkeadores de código automáticos
  o su uso previo a la fase de testeo, ralentizando el desarrollo al tener que
  dedicar esfuerzos a asegurarse que el estilo sea correcto en vez de a su
  funcionalidad, cuando esta debería realizarse solamente  en una última etapa
  previa a su publicación.
* ignorar los *pull-requests* (colaboraciones) hechos por parte de otros
  desarrolladores sin incluirlos en el código principal ni comentar los motivos
  que conllevan a su negativa.
* excesivo celo en que las aportaciones sean muy especificas en la funcionalidad
  que aportan, incluso en el caso de estar ejecutándose correctamente todos los
  tests.
* atención excesiva a que la cobertura de tests sea del 100% en proyectos
  relativamente pequeños, obligando en algunos casos a realizar tests para casos
  de uso triviales o que puedan darse solamente en casos de uso concretos.

Estas cuestiones hacen plantearse el dejar de contribuir en algunos de los
proyectos de Software Libre o directamente mantener un fork de los mismos cuando
esto sea posible donde mantener los cambios propios, empobreciendo el ecosistema
al hacer que una funcionalidad no siempre esté integrada dentro de un único
repositorio y aumentando la fragmentación de este. Todo esto contrasta con los
proyectos más grandes (en importancia, tamaño o número de seguidores) donde hay
más aceptación a admitir código de terceros y de forma mucho mas rápida, sin
tanta obsesión por la calidad del código, incluso llegando a aceptar los cambios
con fallos para después ser corregidos por parte de los propios
mantenedores, en vez de solicitar que los cambios sean correctos a priori a la
persona que los envía. Esta actitud facilita la colaboración en los distintos proyectos por parte de nuevos desarrolladores, sin necesidad de ser programadores expertos.

El hecho de que el repositorio de npm esté abierto a admitir paquetes nuevos de
cualquier persona sin ningún tipo de control hace que también haya algunos
paquetes vacíos, con pruebas hechas por sus autores, con código de otros autores
(incluso sin modificaciones) o con "proyectos de fin de semana" abandonados,
dificultando el poder encontrar paquetes adecuados para ser usados. Esto hace
que se terminen usando en su lugar forks propios alojados en GitHub como
dependencias, lo que hace prácticamente irrelevante el propósito del registro
npm para el que fue creado como lugar centralizado para hospedar los paquetes y
su versionado.


[^1]: El uso de paquetes comprimidos es [una propuesta mía](https://github.com/nodejs/node/issues/1278) que además [ha sido aceptada para para integrarla en npm](https://github.com/npm/npm/issues/7762) una vez que Node.js incluya soporte para la misma. Esto además implicaría un menor consumo de espacio en disco duro, ya que cada usuario potencialmente puede tener una copia de todas las librerías que necesitasen sus aplicaciones, aunque esto no sería un problema de mayor importancia en entornos donde solo haya un único usuario (servidores en la nube o equipos personales o sistemas embebidos), siendo la única diferencia en estos casos el sitio donde estén físicamente guardadas, ya sea dentro de la partición raíz o en el directorio del usuario.
