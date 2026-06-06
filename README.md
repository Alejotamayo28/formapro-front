# Logali Payments Dashboard

Dashboard web creado para la **Prueba 2** del reto técnico. La aplicación permite consultar y visualizar los pagos cargados en Supabase durante el reto anterior.

En este proyecto decidí separar la solución en dos partes:

- **API**: se conecta a Supabase y expone endpoints seguros de lectura.
- **Frontend**: consume esa API y muestra el dashboard de pagos.

De esta forma, el navegador nunca necesita acceder a claves sensibles de Supabase.

## Qué muestra el dashboard

El dashboard incluye los requisitos solicitados en la prueba:

- **Ingresos totales**, calculados solo con pagos `completed`.
- **Número total de pagos**.
- **Número de reembolsos**.
- **Ticket medio**.
- **Tabla de pagos** con paginación y ordenamiento.
- **Gráficos/resúmenes visuales** para entender mejor los datos.
- **Formato correcto de moneda** según cada pago: COP, USD, EUR, etc.
- **Filtros** por estado, moneda, curso, nombre y email.
- **Exportación CSV** de los pagos filtrados.
- **Indicador de estado de la API** para saber si el backend está disponible.

## Seguridad

La `service_role key` de Supabase **no está en el navegador ni en el repositorio**.

El frontend no se conecta directamente a Supabase con claves privadas. Solo consume la API pública creada para este reto, que es la encargada de leer los datos desde Supabase.

La URL actual de la API usada por el frontend es:

```txt
https://api-logali.alejotamayo.com/
```

## Cómo ejecutar el proyecto

Instalar dependencias:

```bash
npm install
```

Ejecutar en local:

```bash
npm run dev
```

Abrir en el navegador:

```txt
http://localhost:5173
```

## Validación antes de entregar

Comandos usados para revisar que el proyecto esté correcto:

```bash
npm run lint
npm run typecheck
npm run build
```

## Notas sobre el desarrollo con IA

Usé IA como apoyo para acelerar la construcción del dashboard, revisar estructura, mejorar componentes y validar detalles de la entrega. Aun así, revisé el resultado para asegurarme de entender la arquitectura, el flujo de datos, el formateo de moneda y las implicaciones de seguridad.

## Estructura general

- `app/`: páginas principales de Next.js.
- `components/`: componentes visuales del dashboard.
- `lib/`: funciones para consumir la API y formatear datos.
- `types/`: tipos TypeScript de pagos y respuestas.
