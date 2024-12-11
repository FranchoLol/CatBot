# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2023-12-10

### Añadido
- Implementación inicial del bot de Discord
- Configuración del cliente de Discord con intents necesarios
- Manejo de comandos de texto y comandos de barra (slash commands)
- Comandos básicos:
  - help: Muestra la lista de comandos disponibles
  - userinfo: Muestra información detallada sobre un usuario
  - serverinfo: Muestra información detallada sobre el servidor
  - say: Hace que el bot repita un mensaje
  - embed: Crea un mensaje embed personalizado
  - ping: Muestra la latencia del bot
- Comandos de moderación:
  - kick: Expulsa a un usuario del servidor
  - ban: Banea a un usuario del servidor
  - clear: Elimina una cantidad específica de mensajes
  - createrole: Crea un nuevo rol en el servidor
  - createcategory: Crea una nueva categoría
  - createchannel: Crea un nuevo canal
  - movechannel: Mueve un canal a una categoría o posición específica
- Comandos de información:
  - botinfo: Muestra información detallada sobre el bot
  - roleinfo: Muestra información sobre un rol
  - id: Muestra el ID de un usuario, canal, rol o emoji
- Comandos de utilidad:
  - avatar: Muestra el avatar de un usuario
  - jumbo: Muestra una versión ampliada de un emoji o GIF
  - calc: Realiza cálculos matemáticos simples
  - invite: Muestra el enlace de invitación del bot
  - support: Muestra información sobre el servidor de soporte
- Comandos de búsqueda:
  - google: Realiza una búsqueda en Google
- Comandos de diversión:
  - 8ball: Pregunta a la bola 8 mágica
- Comandos de configuración:
  - setprefix: Cambia el prefijo del bot para el servidor
  - setlanguage: Cambia el idioma del bot para el servidor
  - delprefix: Elimina el prefijo personalizado del servidor
- Sistema de niveles con comandos:
  - level: Muestra el nivel y experiencia de un usuario
  - top: Muestra los usuarios con más nivel en el servidor
  - leveladd: Añade experiencia o niveles a un usuario
  - levelremove: Quita experiencia o niveles a un usuario
  - xp: Obtiene XP diaria
  - levelconfig: Configura el sistema de niveles
- Soporte para múltiples idiomas (español, inglés, portugués)
- Configuración dinámica de prefijos por servidor
- Integración con la API de Google para búsquedas
- Sistema de rotación de estados del bot
- Manejo de errores y permisos en comandos
- Utilización de embeds para respuestas más atractivas
- Implementación de cooldowns para ciertos comandos

### Cambiado
- Migración de la estructura del proyecto para mejor organización
- Actualización de la gestión de comandos para soportar tanto comandos de texto como comandos de barra
- Mejora en la modularidad del código, separando funcionalidades en archivos distintos

### Eliminado
- Eliminación de la carpeta 'src' y reorganización de archivos en la raíz del proyecto

