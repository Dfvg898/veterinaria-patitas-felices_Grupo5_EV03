# Sistema de Gestión Clínica y Operativa "Veterinaria Patitas Felices" (Sede Arica)
**Evaluación 3 – Ingeniería de Software (TI3043) – INACAP Sede Arica**  
**Docente:** Hans Alarcón  
**Grupo 5:** Guillermo Aguayo · Diego Quispe  

---

## 1. Descripción del Prototipo Funcional
Prototipo web funcional desarrollado sobre el **Stack Tecnológico Oficial** (**Visual Studio Code + Node.js + React 19 + Vite + Git/GitHub + Supabase Auth/PostgreSQL RLS + Vercel**), que da continuidad al diseño de la **Evaluación 2** (cubriendo el **100 % de los 17 Casos de Uso, 34 Requisitos Funcionales, 12 Requisitos No Funcionales y los 4 Roles internos**) y a la demostración práctica de la **Etapa 5 (Autenticación y Permisos por Fila RLS en Supabase)**.

---

## 2. Ejecución Local (Paso a Paso)
```bash
git clone https://github.com/Dfvg898/grupo5ev03.git
cd grupo5ev03
cp .env.example .env     # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```
Abrir en el navegador: **`http://localhost:5173`**

---

## 3. Cuentas de Demostración por Rol (Actividad 2 EV03)
En la pantalla de inicio de sesión puedes usar los **4 botones de acceso rápido** o ingresar manualmente:

| Rol | Trabajador | Correo | Contraseña |
| :--- | :--- | :--- | :--- |
| **1. Administrador** | Dr. Fernando Soto (Propietario) | `admin@patitasfelices.cl` | `Admin2026!` |
| **2. Veterinario** | Dra. Camila Rojas | `veterinario@patitasfelices.cl` | `Vet2026!` |
| **3. Recepcionista** | Carla Morales | `recepcion@patitasfelices.cl` | `Recep2026!` |
| **4. Asistente** | Tomás Araya | `asistente@patitasfelices.cl` | `Asist2026!` |

*(También soporta inicio de sesión directo con las cuentas de prueba de Supabase Auth como `alumno1@prueba.cl` y `alumno2@prueba.cl`, además de demostrar el bloqueo automático tras 3 intentos fallidos del requisito **RF04**).*

---

## 4. Base de Datos y Políticas RLS en Supabase
* **Configuración:** las credenciales de Supabase van en `.env` (ver `.env.example`); el archivo `.env` no se sube a Git.
* **Script SQL completo (Tablas + Políticas RLS):** Disponible en el archivo [`supabase_veterinaria_patitas_felices.sql`](./supabase_veterinaria_patitas_felices.sql) para ejecutar en el **SQL Editor** de Supabase.
* **Control de acceso en la base de datos:** el script define la función `rol_actual()` y políticas RLS por rol (sección 11), alineadas con la matriz de permisos del frontend. Para usarlas, cada usuario de `usuarios_clinica` debe enlazarse a su cuenta de Supabase Auth mediante `auth_user_id`.

---

## 5. Documentación de las Actividades 4 y 5
* [Actividad 4 – Tecnologías para ofrecer el sistema como SaaS](./docs/ACTIVIDAD4_SaaS.md)
* [Actividad 5 – OWASP (Top 10 2025 y ASVS 5.0)](./docs/ACTIVIDAD5_OWASP.md)

## 6. Limitaciones conocidas del prototipo
* Los datos clínicos del prototipo se guardan en `localStorage` (modo demostración / sin conexión, RNF04); solo la tabla `tareas` usa Supabase en vivo.
* Las cuentas internas de demostración usan contraseña en texto plano en el navegador. **No usar en producción**: debe migrarse a Supabase Auth con bloqueo aplicado en el servidor.
* El selector «Cambiar Rol (Demo)» solo está disponible para sesiones autenticadas como Administrador.
