# Actividad 4 – Tecnologías para ofrecer el sistema como SaaS

**Sistema:** Gestión Clínica y Operativa "Veterinaria Patitas Felices" (Sede Arica)

El prototipo se ofrecería como **SaaS multi‑clínica**: una sola plataforma en la nube, atendida por el proveedor (el grupo), a la que cada veterinaria accede por navegador mediante suscripción. A continuación se describen las 6 categorías solicitadas, qué tecnología se propone para cada una y por qué es pertinente.

| # | Categoría | Tecnología propuesta | Modelo de servicio |
|---|-----------|----------------------|--------------------|
| 1 | Plataforma de despliegue en la nube | **Vercel** (frontend React/Vite) | PaaS |
| 2 | Base de datos en la nube | **Supabase PostgreSQL** gestionado | PaaS / DBaaS |
| 3 | Autenticación y control de acceso | **Supabase Auth (JWT)** + **RLS** + RBAC | PaaS |
| 4 | Almacenamiento de archivos | **Supabase Storage** (compatible S3) | PaaS / IaaS |
| 5 | Facturación / suscripciones | **Stripe Billing** (alternativa local: Flow / Mercado Pago) | SaaS de terceros |
| 6 | Monitoreo y seguridad básica | **Sentry** + logs de Supabase/Vercel + **UptimeRobot**, HTTPS/HSTS, copias automáticas | SaaS de terceros |

## 1. Plataforma de despliegue en la nube – Vercel
- **Qué es:** plataforma PaaS que compila el proyecto Vite desde GitHub y lo publica en una CDN global con HTTPS automático.
- **Por qué:** es parte del stack oficial del curso; cada `git push` genera un despliegue (CI/CD) y *preview* por rama; escala sin administrar servidores. Variables de entorno (`VITE_SUPABASE_*`) se configuran en el panel, no en el código.
- **Alternativas consideradas:** Netlify, AWS Amplify (más configuración), servidor propio en IaaS (AWS EC2 / DigitalOcean; más control pero más costo operativo).

## 2. Base de datos en la nube – Supabase (PostgreSQL)
- **Qué es:** PostgreSQL administrado con respaldos, replicación y API REST autogenerada.
- **Por qué:** el modelo es relacional (clientes → mascotas → citas → atenciones → ventas), requiere integridad referencial y transacciones. El script `supabase_veterinaria_patitas_felices.sql` crea 12 tablas con restricciones `CHECK`.
- **Multi‑tenant:** para ofrecerlo a varias clínicas se agrega una columna `clinica_id` a cada tabla y las políticas RLS filtran por ella (aislamiento lógico entre clientes del SaaS).

## 3. Autenticación y control de acceso – Supabase Auth + RLS
- **Autenticación:** Supabase Auth emite JWT, almacena contraseñas con hash (bcrypt) y permite MFA, recuperación de contraseña y proveedores OAuth.
- **Autorización:** función `rol_actual()` + políticas RLS por rol (Administrador, Veterinario, Recepcionista, Asistente), alineadas con la matriz `ROLES_PERMISOS` del frontend. El frontend solo oculta opciones; **la barrera real está en la base de datos**.
- **Pertinencia:** datos clínicos y financieros de clientes exigen separación de funciones (Ley 21.719 de protección de datos personales).

## 4. Almacenamiento de archivos – Supabase Storage
- **Uso previsto:** exámenes de laboratorio, radiografías, fotos de mascotas, comprobantes y reportes PDF de la ficha clínica.
- **Por qué:** integra las mismas políticas RLS (un archivo solo es visible para usuarios autorizados), URL firmadas con expiración y límites de tamaño/tipo MIME. Alternativa: Amazon S3.

## 5. Facturación y suscripciones – Stripe Billing
- **Qué resuelve:** planes mensuales por clínica (p. ej. Básico / Profesional), cobro recurrente, reintentos de pago, portal de cliente y *webhooks* que activan o suspenden la cuenta de la clínica.
- **Seguridad:** el cobro se realiza en la página alojada por Stripe; el sistema nunca almacena datos de tarjeta (reduce el alcance PCI‑DSS). Los webhooks se verifican con firma y se procesan en una *Edge Function* de Supabase.
- **Para Chile:** facturación electrónica SII mediante un proveedor DTE (p. ej. Bsale / OpenFactura) y pasarelas locales (Flow, Webpay).

## 6. Monitoreo y seguridad básica
| Aspecto | Herramienta / práctica |
|---------|------------------------|
| Errores en frontend | Sentry |
| Disponibilidad | UptimeRobot o Better Stack (alertas por correo) |
| Logs de auditoría | Logs de Supabase (Auth, API, Postgres) y de Vercel |
| Transporte | HTTPS obligatorio, HSTS, cabeceras CSP/`X-Content-Type-Options` en `vercel.json` |
| Respaldos | Backups diarios automáticos de Supabase + prueba de restauración trimestral |
| Secretos | Variables de entorno en Vercel; `service_role` solo en backend/Edge Functions |
| Dependencias | `npm audit` y Dependabot de GitHub |

## Relación con los conceptos de computación en la nube
- **SaaS:** el producto final que usan las clínicas (el prototipo).
- **PaaS:** Vercel y Supabase sobre los que se construye, sin gestionar servidores.
- **IaaS:** infraestructura subyacente (AWS en Vercel/Supabase); solo se administraría directamente si se migrara a máquinas virtuales propias.
