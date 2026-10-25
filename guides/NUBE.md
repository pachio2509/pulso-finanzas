# Usarlo en la nube

## Una demo pública sin datos personales

Publica solo la carpeta `docs/` en un proveedor estático. El HTML inicia vacío, permite una demo ficticia y procesa archivos en el navegador del visitante. No contiene cuentas ni almacenamiento remoto. El proveedor recibe las solicitudes de página y los metadatos habituales de red; la app no envía el contenido importado.

GitHub Pages puede servir `docs/` desde una rama. Sigue la [documentación oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Publicar el código no publica el archivo privado de tu computadora.

## Un entorno de código en la nube

El servidor incluido solo escucha en `127.0.0.1`. Una previsualización remota puede requerir el proxy autenticado que ofrezca tu entorno. Un localhost remoto no es el localhost de tu computadora.

No conviertas ese servidor en público cambiando la dirección de escucha ni usando un túnel abierto con datos personales. Descarga la copia privada para seguir localmente si no existe una vista segura. Los archivos de una sesión temporal pueden desaparecer; exporta lo que quieras conservar.

## Un producto con cuentas

Esta edición es un kit individual, no una plataforma multiusuario. Para una app con cuentas hace falta implementar y probar:

- Autenticación, recuperación y revocación de sesiones.
- Aislamiento de datos por usuario en servidor/base de datos.
- Cifrado y manejo de secretos fuera del repositorio.
- OAuth individual de Gmail y/o proveedor bancario, cobertura y verificación correspondientes.
- Exportación, borrado y política de privacidad coherentes con el funcionamiento real.

No basta añadir una pantalla de login al HTML ni ocultar botones. Hasta que esa arquitectura esté implementada y verificada, no debe ofrecerse como una función disponible.

