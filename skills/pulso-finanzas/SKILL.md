---
name: pulso-finanzas
description: Instala o actualiza un dashboard personal Pulso con archivos del usuario, visualiza flujos y pendientes, y guía la preparación de datos desde fuentes autorizadas. Úsala para crear una copia privada reutilizable, no para publicar finanzas ni ejecutar pagos.
---

# Pulso

Entrega un dashboard que la persona pueda volver a abrir. Usa `assets/Dashboard.html` y los scripts incluidos; no regeneres una app desde cero ni cambies su diseño salvo que se solicite.

## Instalar

1. Determina si puedes escribir y ejecutar en la computadora de la persona, solo en un entorno temporal o únicamente responder. Un navegador remoto y su localhost no son la Mac/PC del usuario. Explica el límite y escoge la ruta disponible.
2. Usa una carpeta persistente autorizada. Conserva los archivos originales. Copia `assets/` y `scripts/` a una carpeta nueva del proyecto; no guardes finanzas dentro de la instalación de la skill.
3. Con Python 3.10+, ejecuta `python3 scripts/local_server.py --open --data /ruta/privada/data.json` desde la copia. Usa un puerto libre si 8766 está ocupado. Solo localhost; sin servicios automáticos.
4. Sin Python/terminal, entrega `assets/Dashboard.html` y la ruta manual de importación en un navegador. No declares que instalaste algo si solo creaste archivos en una máquina temporal.
5. Abre y verifica la pantalla: estado vacío, o demo explícitamente ficticia. No presentes ejemplos como datos reales. Entrega ruta persistente y pasos cortos de reapertura.

## Datos

Lee [DATOS.md](references/DATOS.md) antes de transformar información. El usuario aporta el archivo o autoriza una fuente concreta. Para Gmail y bancos lee [CONECTAR.md](references/CONECTAR.md). Descubre conectores realmente disponibles; la skill no incluye credenciales ni concede acceso.

Confirma periodo, zona horaria y criterio personal/empresarial cuando falten. Mérida es el valor predeterminado de la interfaz, no una inferencia sobre todos los usuarios. Para otra zona, adapta el código de la copia y verifica sus fechas; no cambies fechas de operación ya documentadas.

- Importes, monedas, fechas y estados deben provenir de evidencia.
- Depósitos de naturaleza desconocida siguen en `unknown`; no son ingreso ganado.
- Traspasos propios van separados. No dupliques factura y pago, dos avisos del mismo cargo o pendientes ya cobrados.
- Los saldos declarados son fotografías separadas. Esta edición no tiene una tarjeta de saldo declarado: conserva esa evidencia aparte y comunica la limitación; no la insertes como un ingreso.
- No apliques a todos los usuarios una regla personal de otro usuario. Asignación desconocida queda `unclassified`.
- No prometas conciliación, rentabilidad, exactitud universal o sincronización de correo que no exista.

Al actualizar, conserva claves estables y revisa cambios locales. Construye un archivo nuevo, valídalo y usa `scripts/import_data.py ARCHIVO --destination /ruta/privada/data.json`. El script guarda la versión anterior y rechaza pérdida de claves salvo `--replace` deliberado. No lo uses para esconder conflictos; informa lo que no puedas conciliar.

## Verificar y cerrar

Compara entradas/salidas por moneda con la fuente, exclusión de traspasos y duplicados, pendientes y fechas. Verifica la interfaz visible, no solo el código HTTP. Prueba el flujo de reapertura en el entorno real si tienes control autorizado.

Entrega instrucciones simples: dónde abrir, cómo importar/actualizar y qué limitaciones quedan. No publiques, compartas ni programes lecturas de datos personales como parte implícita de instalar la skill. Si una acción fue incierta, verifica su resultado antes de repetirla.

