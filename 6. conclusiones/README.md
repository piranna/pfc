# Conclusiones

1. [Logros principales alcanzados](1. Logros principales alcanzados.html)
2. [Posibles trabajos futuros](2. Posibles trabajos futuros.html)
  1. [Compilacion para ARM y MIPS](2. Posibles trabajos futuros.html#compilación-para-arm-y-mips)
  2. [Kernels alternativos](2. Posibles trabajos futuros.html#kernels-alternativos)
  3. ["Sabores"](2. Posibles trabajos futuros.html#"Sabores")
  4. [Mejorar la experiencia de usuario](2. Posibles trabajos futuros.html#mejorar-la-experiencia-de-usuario)
    1. [Modo texto](2. Posibles trabajos futuros.html#modo-texto)
    2. [Interfaz grafica](2. Posibles trabajos futuros.html#-interfaz-gráfica)
  5. [Reducir el consumo de memoria](2. Posibles trabajos futuros.html#reducir-el-consumo-de-memoria)


Las mayores virtudes del ecosistema de Javascript y Node.js son su dinamismo y
su modularidad, los cuales les dan mucha flexibilidad para poder adaptarse a los
cambios. Sin embargo, estas tambien son a la vez sus mayores defectos debido a
lo inestable que se vuelve el desarrollo, ya que un modulo de terceros puede
afectar a todo el sistema. Esto es algo que ha afectado directamente a NodeOS en
dos ocasiones, la primera por un cambio en la versión empleada del motor
Javascript `v8` por Node.js que imposibilita por el momento usar cualquier
version de Node.js superior a la 0.11.14, y la segunda mas recientemente por la
actualización de varios módulos compilados para hacer uso de las macros
ofrecidas por la versión 2 del módulo `nan`, necesarias para que estos sean
compatibles con Node.js 5.

Han surgido diversas soluciones al respecto como son el uso de las
[bundledDependencies](https://docs.npmjs.com/files/package.json#bundleddependencies)
o de [shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) (o el propio módulo
`nan` en el caso de la compatibilidad de los módulos compilados entre versiones)
y se siguen planteando otras como el uso de paquetes comprimidos (esta última
[una propuesta mia](https://github.com/nodejs/node/issues/1278)), o el firmado
de módulos. Ninguna de estas soluciones es óptima o definitiva por si sola,
aunque mientras tanto desde la comunidad se estan intentando promover codigos de
buena conducta como el [versionado semantico](http://semver.org) estricto o la
conversión de modulos de la libreria estandar en paquetes `npm` para prevenir
cambios en las APIs.

No obstante, también he podido comprobar en primera persona la idiosincrasia y
reticencias de algunos desarrolladores a aceptar la inclusión de cambios en su
código. Esto es algo que a veces ocurre en el software libre, pero se hace mas
patente en el ecosistema de Node.js debido a su rapido crecimiento y a su
tradicional falta de convenciones a diferencia de como ocurre en otros lenguajes
como es el casos de [Python](https://www.python.org) y su guia de estilo
[PEP 8](https://www.python.org/dev/peps/pep-0008), que plantea unos minimos de
calidad ampliamente aceptados por toda la comunidad. Algunos de los problemas
con los que me he encontrado en algunos proyectos son:

* el uso de transpiladores ([CoffeScript](http://coffeescript.org),
  [TypeScript](http://www.typescriptlang.org), [EcmaScript 6](http://babeljs.io)...)
  sin incluir el código Javascript generado que impiden el poder usar
  directamente los repositorios de GitHub como dependencias durante la fase de
  desarrollo durante el tiempo que se espera a la inclusion de los cambios en el
  repositorio principal. Esta es una de las razones por las que los principales
  desarrolladores de Node.js solo usan caracteristicas estandar del lenguaje.
* el uso de tabuladores o de mas 80 columnas en el código fuente. dificultando
  su lectura en navegadores web o en pantallas pequeñas.
* la adhesión a guias de estilo sin el uso de checkeadores de código automáticos
  o su uso previo a la fase de testeo, ralentizando el desarrollo al tener que
  dedicar esfuerzos a asegurarse que el estilo sea correcto en vez de a su
  funcionalidad, cuando esta deberia realizarse solamente  en una última etapa
  previa a su publicación.
* ignorar los *pull-requests* (colaboraciones) hechos por parte de otros
  usuarios sin incluirlos en el código principal ni comentar porque no lo hacen.
* excesivo celo en que las aportaciones sean muy especificas en la funcionalidad
  que aportan incluso en el caso de estar ejecutandose correctamente todos los
  tests.
* o una atencion excesiva a que la covertura de tests sea del 100% en proyectos
  relativamente pequeños, obligando en algunos casos a rehalizar tests para
  casos de uso triviales o que puedan darse solamente en casos de uso concretos.

Estas cuestiones hacen plantearse el dejar de contribuir en algunos de los
proyectos de Software Libre o directamente mantener un fork de los mismos cuando
esto sea posible donde mantener los cambios propios, empobreciendo el ecosistema
al hacer que una funcionalidad no siempre este integrada dentro de un ínico
repositorio y aumentando la fragmentacion de este. Todo esto contrasta con los
proyectos mas grandes (en importancia, tamaño o número de seguidores) donde hay
mas aceptación a admitir código de terceros y de forma mucho mas rapida sin
tanta fijación por la calidad del código, incluso llegando a aceptar los cambios
y a continuación corregir los fallos que pudieran tener estos por parte de los
propios mantenedores de los repositorios en vez de solicitar que los cambios
sean correctos a priori a la persona que los envia. Esta actitud es mas
inclusiva al facilitar la colaboración en los distintos proyectos por parte de
nuevos desarrolladores, no siendo estos necesariamente programadores expertos.
