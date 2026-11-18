# Actividad 5 – OWASP

## 1. ¿Qué es OWASP?
- **Origen:** *Open Worldwide Application Security Project* (antes *Open Web Application Security Project*). Fue fundado en 2001 y se constituyó como fundación sin fines de lucro en Estados Unidos en 2004.
- **Objetivos:** mejorar la seguridad del software mediante proyectos, documentación, herramientas y estándares abiertos, gratuitos y mantenidos por voluntarios.
- **Alcance:** comunidad global con capítulos locales (incluyendo Latinoamérica). Sus proyectos más conocidos son OWASP Top 10, ASVS, Cheat Sheet Series, ZAP (escáner), Dependency‑Check y SAMM.
- **Ejemplo de aplicación en este proyecto:** las políticas RLS por rol (A01) y el bloqueo tras 3 intentos fallidos (A07) se diseñaron siguiendo sus recomendaciones.

## 2. OWASP Top 10 – edición 2025 (la más reciente)
| ID | Categoría | Descripción resumida |
|----|-----------|----------------------|
| A01 | Broken Access Control | Usuarios que acceden a datos o funciones que no les corresponden (saltarse permisos, IDOR, escalamiento de privilegios). |
| A02 | Security Misconfiguration | Configuraciones inseguras o por defecto: servicios abiertos, cabeceras ausentes, mensajes de error detallados. |
| A03 | Software Supply Chain Failures | Fallos en dependencias, procesos de compilación o distribución (paquetes comprometidos, CI/CD sin proteger). |
| A04 | Cryptographic Failures | Ausencia o mal uso de cifrado: datos sensibles sin proteger, contraseñas sin hash, algoritmos débiles. |
| A05 | Injection | Datos no confiables interpretados como código (SQL, comandos, XSS). |
| A06 | Insecure Design | Fallos de diseño y de lógica de negocio que ninguna implementación perfecta corrige; falta de modelado de amenazas. |
| A07 | Authentication Failures | Debilidades en login y sesiones: fuerza bruta, contraseñas débiles, sesiones sin expiración. |
| A08 | Software or Data Integrity Failures | Código o datos aceptados sin verificar su integridad (actualizaciones sin firma, deserialización insegura). |
| A09 | Security Logging & Alerting Failures | Falta de registros y alertas que impiden detectar y responder a ataques. |
| A10 | Mishandling of Exceptional Conditions | Manejo inadecuado de errores y condiciones anómalas: fallos que revelan información o dejan el sistema en estado inseguro. |

### Las 3 vulnerabilidades más relevantes para Patitas Felices
| Riesgo | Por qué es relevante | Mitigación en el prototipo |
|--------|---------------------|----------------------------|
| **A01 Broken Access Control** | Hay 4 roles con datos muy distintos (finanzas y usuarios solo para el Administrador; fichas clínicas solo para personal clínico). Un fallo expone datos personales y financieros. | Matriz `ROLES_PERMISOS`; guardia de ruta `moduloVisible`; selector de rol solo para el Administrador real; cuentas nuevas con rol mínimo; **políticas RLS por rol** en PostgreSQL (`rol_actual()`). |
| **A07 Authentication Failures** | El sistema se expone en internet y maneja cuentas del personal; la fuerza bruta es el ataque más probable. | Bloqueo automático tras 3 intentos fallidos (RF04), cuentas desactivables (RF03), Supabase Auth con JWT para cuentas reales. |
| **A06 Insecure Design** | La lógica de negocio (stock, cobros, agenda) puede manipularse: stock negativo, doble reserva de horario, abonos mayores al total. | Validación de colisión de horarios (RF11), `CHECK` en BD (stock ≥ 0, cantidad > 0, totales ≥ 0), flujo de cobro con saldo pendiente validado. |

> **Limitación reconocida (A04/A07):** en el prototipo, las cuentas internas de demostración se guardan en el navegador (`localStorage`) con contraseña en texto plano para poder realizar la demo sin servidor. **En producción todas las cuentas deben pasar por Supabase Auth** (hash bcrypt) y el bloqueo debe aplicarse en el servidor.

## 3. OWASP ASVS (Application Security Verification Standard)
- **Qué es:** estándar abierto con una lista de requisitos de seguridad verificables para aplicaciones web, organizado en capítulos y 3 niveles de rigor (L1 básico, L2 estándar para datos sensibles, L3 alto aseguramiento). La versión vigente es la **5.0 (2025)**.
- **Para qué sirve:** como lista de chequeo para diseñar y probar la seguridad, como base para contratos y auditorías, y para medir el avance en forma objetiva. Por manejar datos personales, este proyecto apunta a **nivel 2**.

### Controles ASVS aplicables al prototipo
| # | Capítulo ASVS 5.0 | Control | Cómo se aplica |
|---|-------------------|---------|----------------|
| 1 | V6 Authentication | Requisitos de contraseña y defensa contra fuerza bruta / bloqueo de cuenta. | Bloqueo tras 3 intentos (RF04); contraseñas gestionadas por Supabase Auth. |
| 2 | V8 Authorization | Control de acceso aplicado en el servidor, con mínimo privilegio y denegación por defecto. | Políticas RLS por rol; cuenta sin rol ⇒ sin acceso; frontend solo refleja los permisos. |
| 3 | V16 Security Logging and Error Handling | Registrar eventos de seguridad y no revelar detalles internos en errores. | Mensajes de error genéricos al usuario; registros de movimientos de stock y ventas con responsable y fecha; logs de Supabase. |
| 4 | V1 Encoding and Sanitization / V2 Validation | Validar entradas y evitar inyección. | React escapa la salida por defecto (no se usa `dangerouslySetInnerHTML`); consultas parametrizadas vía supabase‑js; validaciones de formularios y `CHECK` en BD. |
| 5 | V13 Configuration | Secretos fuera del código y configuración segura. | Variables `VITE_*` en `.env` (ignorado por Git, ver `.env.example`); la clave `service_role` nunca va al frontend. |

> Los números de sección exactos de cada requisito (p. ej. 6.2.1) deben citarse desde el documento oficial en <https://asvs.dev> al redactar el informe.

## Fuentes
- OWASP Foundation. *OWASP Top 10:2025*. https://top10.owasp.org/2025/
- OWASP Foundation. *Application Security Verification Standard 5.0*. https://asvs.dev
- OWASP Foundation. *About OWASP*. https://owasp.org/about/
