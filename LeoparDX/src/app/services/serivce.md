Solo localStorage — uid
Una sola cosa va en localStorage:
uid del usuario al hacer login
Para que si recarga la página no lo mande de regreso al login.

Todo lo demás va en el Servicio
Situación
Por qué servicioLogin → Dashboard saber quién entróPasar datos entre componentes
Dashboard mostrar nombre, rol, fotoLeer usuario actualSaber si es entrenador o alumno para mostrar/ocultar menúsVerificar rol en cualquier componenteAgendar cita y que otro componente sepa que se agendóCompartir estadoCerrar sesión y limpiar todoUn solo lugar para limpiar

Lo que NUNCA va en localStorage en tu gym

Contraseña
Lista de rutinas o citas (eso vive en Firestore)
Datos del perfil físico (eso vive en Firestore)
Rol del usuario (podría manipularse desde DevTools)


Resumen visual de tu app
Login
  → guarda uid en localStorage
  → guarda Usuario completo en Servicio
  → navega a Dashboard

Dashboard / cualquier componente
  → lee del Servicio (nombre, rol, foto)
  → si es entrenador → muestra opciones de entrenador
  → si es alumno → muestra sus rutinas y citas

App arranca (recarga)
  → lee uid de localStorage
  → busca en Firestore
  → llena el Servicio de nuevo

Cerrar sesión
  → borra uid de localStorage
  → limpia el Servicio
  → regresa al login