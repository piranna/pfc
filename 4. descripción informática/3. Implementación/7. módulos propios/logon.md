#### logon

Por seguridad, NodeOS está diseñado de forma que no exista un usuario con
permisos de administrador, siendo todos usuarios sin privilegios. Esto supone un
problema de cara al acceso al sistema puesto que, tradicionalmente, se ha hecho
comprobando las credenciales en una base de datos para todo el sistema (como es
el archivo `/etc/passwd` o el uso de [Kerberos](http://web.mit.edu/kerberos)),
por lo que se ha tenido que buscar una alternativa.

[logon](https://github.com/piranna/logon) implementa un mecanismo por el que se
permite el acceso al sistema de forma descentralizada, basándose en los propios
directorios de los usuarios para comprobar el acceso. Para ello, se guardan las
credenciales del mismo en el archivo `etc/logon.json` dentro del directorio del
usuario conteniendo los valores que tendría normalmente en el archivo
[/etc/passwd](http://linux.die.net/man/5/passwd), como son el hash `sha1` de la
contraseña o la shell por defecto, junto con otros datos que puedan ser útiles
para el acceso (como la interfaz gráfica a usar). De esta forma, los propios
usuarios pueden cambiar sus valores de acceso sin requerir el uso de ejecutables
con permisos privilegiados como [passwd](http://linux.die.net/man/1/passwd) o
solicitar el cambio a un administrador del sistema. Esto tiene el inconveniente
de que en el caso de que el usuario se infectara con un virus o accedieran a su
cuenta terceras personas, no solo se comprometería toda su información sino
también el acceso a su cuenta, ya que estos podrían haber cambiado la contraseña
(en todos los casos, la única solución realista sería poseer una copia de
seguridad de los datos), pero por otra parte al no haber una base de datos de
usuarios ni un usuario administrador ni archivos o elementos comunes a todos los
usuarios, sólo se comprometería la cuenta a la que se hubiera tenido acceso en
vez de a todo el sistema.

Se hace uso del módulo [prompt](http://github.com/flatiron/prompt) para solicitar
al usuario su nombre y contraseña. Se considera que el nombre de usuario es
válido si existe un directorio en la partición de usuarios con dicho nombre y si
el archivo `etc/logon.json` dentro del mismo tiene los mismos `UID` y `GID` que
el directorio. En tal caso, obtiene de dicho archivo el hash `sha1` de la
contraseña, considerando los casos especiales de que esté definida como cadena
vacía (la cuenta no requiere contraseña y se puede usar directamente), o que no
esté definida o no sea una cadena de texto (la cuenta no es interactiva y no se
puede hacer login en ella)[^1]. En caso de fallo en la autenticación, se
permiten hasta tres intentos antes de terminar el proceso.

Una vez que la autenticación ha sido correcta, se introduce el proceso dentro de
una jaula *chroot* creada dentro del directorio del usuario y se cambia el `UID`
y `GID` [reales y efectivos](http://linux.die.net/man/2/setreuid) del propio
proceso para reducir sus permisos. Se hace de esta manera en vez de simplemente
ejecutar la shell del usuario con sus permisos reducidos porque puede darse el
caso de que el usuario no tenga definida una o se produzca un error, y al estar
ejecutándose una sesión REPL por defecto, este se estaría ejecutado con permisos
de administrador, siendo un grave fallo de seguridad. De este modo, tanto si se
ejecuta la shell del usuario como una sesión REPL, estos se ejecutarían con los
permisos reducidos a los del usuario.

La idea es que posteriormente este sistema pueda usarse también para el acceso
remoto mediante *HTTP Basic Auth* o [wssh](https://www.npmjs.com/package/wssh).
No obstante, el diseño modular de NodeOS hace que sea muy fácil cambiar dicho
sistema de login por cualquier otro, por ejemplo en uno basado en
[Google Accounts](https://myaccount.google.com) y usar posteriormente su unidad
[GDrive](https://drive.google.com) como directorio del usuario, u otro servicio
con soporte de [OAuth](http://oauth.net) o con cualquier otro mecanismo de
autenticación.

Actualmente no existe ningún mecanismo para añadir nuevos usuarios al margen de
los que se están creando al generar la partición de usuarios en la capa de
[usersfs](../../../4. descripción informática/3. Implementación/4. usersfs.md),
pero se plantea la posibilidad de añadir una opción en el futuro para permitir
que sea el propio *logon* el que cree dichos usuarios en el sistema a cualquier
persona que lo desee, puesto que sólo se reduce a crear un directorio en la
partición de usuarios y todo el sistema queda aislado dentro de él, instalándose
una copia de `npm` para que el usuario pueda instalar los paquetes que vea
conveniente y configurar el entorno a su medida.


[^1]: En el futuro se plantea mejorar la seguridad de la contraseña añadiendo [sal](https://es.wikipedia.org/wiki/Sal_(criptografía)) (datos aleatorios) a su cifrado.
