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
cd veterinaria-patitas-felices
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
* **Endpoint conectado en `.env`:** `https://lgfsicqrpfqfeqjdrgoe.supabase.co`
* **Script SQL completo (Tablas + Políticas RLS):** Disponible en el archivo [`supabase_veterinaria_patitas_felices.sql`](./supabase_veterinaria_patitas_felices.sql) para ejecutar en el **SQL Editor** de Supabase.
