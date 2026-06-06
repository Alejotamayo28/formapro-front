# Logali Payments Dashboard

Dashboard web creado para la **Prueba 2** del reto técnico. La aplicación permite consultar y visualizar los pagos cargados en Supabase durante el reto anterior.

En este proyecto decidí separar la solución en dos partes:

- **API**: se conecta a Supabase y expone endpoints seguros de lectura.
- **Frontend**: consume esa API y muestra el dashboard de pagos.

De esta forma, el navegador nunca necesita acceder a claves sensibles de Supabase.

## URL desplegada

El dashboard está desplegado en Cloudflare Pages:

```txt
https://ui-logali.alejotamayo.com/
```

Además, configuré cache en el edge de Cloudflare únicamente para las rutas de lectura más usadas por el dashboard:

- `GET /payments`
- `GET /payments/summary`

No se cachean rutas como exportación CSV, health.

## Qué muestra el dashboard

El dashboard incluye:

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

```txt
https://api-logali.alejotamayo.com/docs
```
