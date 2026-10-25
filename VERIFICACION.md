# Verificación del kit 1.0.0

## Confirmado

- Ocho pruebas de JavaScript y cuatro de Python aprobadas: fechas/importes, desconocidos, duplicados, estados retenidos/rechazados, traspasos, CSV con comillas, conservación del original y copia previa al reemplazo.
- Validador oficial de la skill aprobado con PyYAML en un entorno temporal.
- Navegador local: estado inicial vacío, demo marcada como ficticia, y Excel ficticio con 4,321 MXN de entrada, 123.45 MXN de salida y traspaso de 800 MXN separado.
- La página no incluye datos personales. Las fuentes, ejemplos y paquetes se revisan antes de distribuir.

- ZIP descomprimido en carpeta temporal nueva: instalación de skill con destino explícito correcta; repetir no sobrescribe; arranque local sin Node/npm correcto.
- Reconstrucción de desarrollo desde la copia limpia: npm ci, 12 pruebas y build aprobados.
- Archivo privado actualizado con cuatro eventos ficticios: la pantalla cambió sin recargar, conservó MXN/USD separados y mostró un cobro pendiente.
- Servidor: endpoint de estado responde, Host ajeno devuelve 403 y la ruta directa private/data.json devuelve 404.
- Vista de 390 px en modo oscuro: ancho del documento 390 px, sin desbordamiento horizontal. Exportación JSON y consola sin errores verificadas.

## Alcance de compatibilidad

La verificación se realiza en macOS y navegador local disponible. Los lanzadores Windows/Linux se incluyen pero no se ejecutaron en esos sistemas. No se probó una sesión real de Claude Code ni la instalación automática desde un chat sin herramientas.

No hay cuentas Pulso, OAuth propio, integración bancaria, tareas programadas ni sincronización con Gmail implementadas. La conexión de archivos depende del soporte del navegador. La skill guía fuentes autorizadas, no concede permisos.

La apertura directa por file:// no se probó con la herramienta de navegador por su restricción de protocolos; se verificó el mismo HTML mediante localhost. No se publica un servicio remoto como parte de estas pruebas.
