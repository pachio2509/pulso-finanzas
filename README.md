# Pulso · Finanzas personales

Un dashboard en español para entender entradas, salidas, pendientes y monedas sin inventar saldos. Se entrega vacío; la demo es completamente ficticia.

## Descargas

- [Kit completo ZIP](https://github.com/pachio2509/pulso-finanzas/releases/download/v1.0.0/Pulso-kit-1.0.0.zip)
- [Skill ZIP](https://github.com/pachio2509/pulso-finanzas/releases/download/v1.0.0/Pulso-skill-1.0.0.zip)
- [Texto para copiar en tu chat](COPIAR-Y-PEGAR.txt)

También puedes clonar este repositorio con `git clone https://github.com/pachio2509/pulso-finanzas.git`. La descarga del ZIP no requiere Git ni una cuenta en GitHub.

## Empieza sin saber programar

1. Descomprime **Pulso-kit-1.0.0.zip** en una carpeta que vayas a conservar.
2. Abre **docs/index.html** con tu navegador y pulsa **Explorar demo** o **Importar mis datos**.
3. Importa Excel, CSV o JSON. Antes de cerrar, pulsa **Guardar copia privada**. La versión de navegador conserva datos solo durante esa sesión.

Para que tu asistente prepare la instalación, adjunta el ZIP al chat y pega [COPIAR-Y-PEGAR.txt](COPIAR-Y-PEGAR.txt). Un chat sin herramientas para ejecutar o guardar archivos puede orientarte, pero no instalar software en tu computadora.

## Con actualización local

Necesitas Python 3.10 o posterior, de [python.org](https://www.python.org/downloads/).

- **Mac:** doble clic en **Abrir Pulso.command**.
- **Windows:** doble clic en **Abrir Pulso.bat** (Python Launcher instalado).
- **Linux o terminal:** `python3 scripts/local_server.py --open`.

El lanzador abre `http://127.0.0.1:8766/`. Conserva abierta su ventana mientras lo usas. No instala servicios ni inicia con el equipo. Si un puerto está ocupado por otra app, usa `--port 8767`. Si el sistema bloquea el archivo, no desactives protecciones: usa la versión HTML o pide a tu asistente ejecutar el script local revisado.

El archivo `private/data.json` es la copia privada que puede actualizar tu asistente. La pantalla revisa cambios cada 5 segundos mientras está abierta. **Esto no conecta automáticamente Gmail.**

## ¿Cómo conecto Gmail o mi banco?

Sigue [CONECTAR](guides/CONECTAR.md). La ruta simple usa el conector disponible en **tu propio chat**, con tu autorización. Tu asistente prepara los datos y tú los importas, o los instala en tu copia local si tiene acceso a esa computadora.

La app no solicita contraseñas ni trae OAuth, cuentas de usuario, conexiones bancarias o un servicio multiusuario configurados. Un estado de cuenta o un aviso puede importarse después de convertirlo al [formato de datos](skills/pulso-finanzas/references/DATOS.md). Los bancos no se conectan por pegar un prompt.

## Instala la skill (opcional)

Para Codex: `python3 scripts/install_skill.py --target codex`  
Para Claude Code: `python3 scripts/install_skill.py --target claude`

No reemplaza una skill existente. Después abre una sesión nueva e invoca `$pulso-finanzas` en Codex o `/pulso-finanzas` en Claude Code. Otros chats pueden leer el `SKILL.md` adjunto, pero el soporte de instalación y herramientas depende de cada producto. No es una extensión universal para todos los chats.

La [skill](skills/pulso-finanzas/SKILL.md) incluye el dashboard y scripts de Python. La instalación básica no requiere Node, npm ni claves de API.

## Lo que muestra

- Entradas y salidas por fecha; calendario con zona predeterminada Mérida.
- Gráficas diarias y acumuladas; gasto personal, empresarial y naturaleza desconocida.
- Monedas separadas, traspasos propios y duplicados reservados.
- Cuentas por cobrar/pagar y renovaciones previstas.
- Búsqueda, filtros, detalle de evidencia, modo oscuro y movimiento reducido.

Una entrada no equivale necesariamente a ingreso ganado. Los pendientes no se suman al dinero recibido. La app no calcula saldos bancarios ni liquidez a partir de movimientos parciales. No importa fotografías históricas de balances como saldos actuales.

## Formatos

- **CSV:** usa `examples/plantilla.csv`. Fecha AAAA-MM-DD, importe positivo sin miles y con punto decimal, moneda explícita. Vacío significa desconocido.
- **JSON:** `examples/ejemplo_ficticio.json` muestra la estructura. Se recalculan las banderas de suma; no se confía en `cash` enviado por otro programa.
- **XLSX:** hoja `Registro` con columnas reconocidas. Puede incluir `Cobros pendientes` y `Pagos pendientes`. Máximo 10 MB de archivo / 50 MB descomprimido; sin macros ni ejecución de fórmulas. Las fórmulas requieren valores guardados por Excel; no se calculan en el navegador.

Cada importación de navegador reemplaza la vista de la sesión; no mezcla automáticamente archivos. El importador local conserva copia de la versión anterior y rechaza omisiones de claves sin `--replace` explícito.

## Desarrollo y hosting

Con Node 20+:

```sh
npm ci --ignore-scripts
npm test
npm run build
```

[Motion](https://github.com/motiondivision/motion), [Lucide](https://github.com/lucide-icons/lucide) y [fflate](https://github.com/101arrowz/fflate) están incluidos en el HTML; no se cargan desde CDN. El diseño toma referencias de composición de shadcn/ui; no incluye su runtime.

Puedes publicar **solo `docs/`**, que comienza vacío, en hosting estático. Nunca publiques `private/` ni una exportación personal. Para una app con cuentas, almacenamiento remoto y OAuth, revisa [NUBE](guides/NUBE.md); esa arquitectura no está implementada en esta edición.

Pruebas realizadas y limitaciones: [VERIFICACION.md](VERIFICACION.md). Licencia MIT; licencias de dependencias en `licenses/`.

