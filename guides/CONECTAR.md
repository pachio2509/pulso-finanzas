# Conecta tus propias fuentes

## Ruta fácil: Gmail desde tu chat

1. Abre la sección de Apps, Conectores o Integraciones del asistente que ya usas.
2. Busca **Gmail**. Si aparece, elige conectar tu propia cuenta y revisa los permisos en Google. La disponibilidad depende del producto, plan, región y políticas de tu organización.
3. Vuelve al chat y pega el texto de abajo. Si el asistente no tiene acceso, debe decirlo y ayudarte con una exportación; no debe afirmar que quedó conectado.
4. Revisa lo que encontró. Un correo de factura puede representar una deuda, no un cargo pagado. Una compra rechazada o retenida no es un gasto realizado.
5. Descarga el JSON/CSV que preparó y usa **Importar mis datos**. Si el asistente puede escribir en tu equipo, puede instalarlo con `scripts/import_data.py` y el dashboard local lo reflejará.

```text
Usa mi Gmail conectado, solo en lectura, para preparar movimientos del mes que yo confirme en el formato Pulso. Antes de buscar, confirma el periodo y mi zona horaria. Conserva fuente y clave estable; no copies correos enteros. Distingue pago recibido, pago realizado, factura, rechazo, retención y posible duplicado. No infieras la naturaleza de depósitos desconocidos. Muéstrame ambigüedades y conserva mis datos previos antes de actualizar el archivo.
```

En ChatGPT, revisa la [guía oficial de Apps](https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt) y la [gestión de cuentas conectadas](https://help.openai.com/en/articles/20001494-connecting-and-managing-app-accounts-in-chatgpt). El consentimiento de tu chat **no** entrega acceso a la web de Pulso ni al autor del kit. Desconecta la app desde tu asistente o desde tu cuenta Google cuando dejes de usarla.

## Si Gmail no aparece

Puedes aportar solo los avisos relevantes o un archivo descargado. El asistente debe obtener de ahí registros estructurados y declarar qué días/fuentes faltan. Nunca entregues la contraseña del correo. El dashboard admite archivos; no interpreta capturas o correos por sí solo.

## Bancos

Descarga un estado de cuenta **desde la web o app oficial de tu banco**. Conserva el original y pide adaptar una copia al esquema Pulso. Importa la copia estructurada. No subas tu archivo al repositorio público.

Una integración bancaria real necesita un proveedor que cubra tu país y banco, una aplicación autorizada y consentimiento individual. Esta edición no incluye ni simula esa conexión. No pegues claves de banca, NIP, tokens ni códigos SMS.

## Ruta técnica: Gmail OAuth propio

Para desarrollar tu propia integración, sigue el [quickstart oficial de Gmail](https://developers.google.com/workspace/gmail/api/quickstart/python). Crea una aplicación propia y selecciona el tipo de cliente correcto. Los usuarios autorizan en Google; el secreto nunca se pega en el chat ni en Git.

La lectura de correos usa un [ámbito restringido](https://developers.google.com/workspace/gmail/api/auth/scopes). Una app pública puede necesitar verificación y, según cómo maneje datos, evaluación de seguridad. No reutilices credenciales del autor del kit. Pulso no incluye cliente OAuth ni exportador Gmail; esta sección es la guía para un desarrollo adicional.

## Actualizaciones

- **Importación manual:** tú eliges el archivo nuevo.
- **Archivo conectado:** Chrome/Edge pueden pedir permiso para leer un archivo elegido; se revisa cada 5 segundos mientras la página está abierta. Otros navegadores usan importación manual.
- **Modo local:** el asistente actualiza `private/data.json` y el navegador lo vuelve a leer.
- **Gmail/bancos:** no hay sincronización automática ni tareas programadas incluidas. Cada lectura depende del conector autorizado y de una nueva petición o automatización creada por separado.

