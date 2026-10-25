# Contrato de datos

El JSON usa `{"meta":{"coverage":"Fuentes y periodo cubiertos"},"events":[],"pending":[]}`. Usa números sin símbolo monetario, sin separador de miles y con máximo dos decimales. `null` conserva lo desconocido.

## Movimiento

```json
{
  "key": "fuente-estable:evento-001",
  "date": "2026-01-15",
  "description": "Compra de ejemplo",
  "amount": 120.50,
  "currency": "MXN",
  "direction": "outgoing",
  "state": "paid",
  "flow": "expense",
  "allocation": "personal",
  "category": "Alimentos",
  "notes": "Ejemplo ficticio",
  "source": "Estado de cuenta aportado",
  "reference": "",
  "url": "",
  "link": "",
  "duplicate": null
}
```

- `key`: identidad estable de la operación; una clave repetida rechaza la importación. Usa ID de fuente o referencia, sin exponer datos sensibles innecesarios.
- `date`: fecha de operación AAAA-MM-DD o null. No uses la fecha de recepción del correo si no acredita la operación.
- `currency`: código ISO (MXN, USD, EUR, etc.) o UNKNOWN. No infieras MXN por el símbolo $.
- `direction`: incoming, outgoing o unknown.
- `state`: paid, received, refund, hold, rejected, invoiced o unknown.
- `flow`: income, expense, transfer o unknown.
- `allocation`: personal, business, other o unclassified.
- `duplicate`: clave del posible original si se reserva por duplicidad; no se sumará.
- `source` y `reference`: evidencia suficiente, sin correos completos ni credenciales. `url` solo se ofrece como enlace si es HTTPS.
- `cash` y `effectiveAllocation` se recalculan; no se aceptan como autorización para sumar.

Un movimiento suma solo con importe positivo, sin marca de duplicidad y estado recibido/devolución de entrada o pagado de salida. Los traspasos se separan. Los importes sin fecha no entran en un día o mes concreto.

## Pendiente

```json
{
  "key": "pendiente-ficticio-001",
  "kind": "receivable",
  "party": "Cliente de ejemplo",
  "description": "Servicio por cobrar",
  "date": null,
  "timing": "Fecha por confirmar",
  "amount": 450,
  "currency": "MXN",
  "state": "pendiente",
  "source": "Declaración del usuario",
  "notes": "",
  "link": ""
}
```

`kind`: receivable (cobrar), payable (pagar), renewal (renovación prevista). Estados cerrados: cobrado, pagado, liquidado, cancelado, completado. `parcial` conserva el importe original y exige conciliar el remanente; la app no inventa un saldo. Una renovación no es una deuda exigible.

## CSV / Excel

CSV utiliza los encabezados de `examples/plantilla.csv` (o sus nombres JSON). XLSX requiere hoja `Registro` y columnas Fecha, Descripción, Importe, Moneda, Dirección, Estado, Clase de flujo, Asignación y Clave de deduplicación. Las hojas opcionales de pendientes usan los encabezados del formato financiero descrito en README. Conserva evidencia desconocida; no conviertas celdas vacías a cero.

## Actualización segura

Primero compara claves contra el archivo privado existente. Agrega eventos nuevos; corrige uno existente solo con evidencia y una nota. Reserva coincidencias inciertas como duplicados. Mantén los históricos originales fuera de los movimientos actuales. No combines automáticamente JSON de varias personas.

Antes de importar informa el número de registros, monedas, rango de fechas y cobertura. Tras importar comprueba números por moneda en pantalla y conserva copia anterior. Si la importación falla, la versión anterior debe permanecer utilizable.

