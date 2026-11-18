-- =============================================================================
-- SISTEMA DE GESTIÓN CLÍNICA Y OPERATIVA "VETERINARIA PATITAS FELICES" (ARICA)
-- Evaluacion 3 - Ingenieria de Software (TI3043) - INACAP Sede Arica
-- Grupo 5: Guillermo Aguayo y Diego Quispe | Docente: Hans Alarcon
-- Stack: React + Vite + Supabase Auth + PostgreSQL + Row Level Security (RLS)
-- =============================================================================

-- 1. Tabla de Tareas por Usuario (Etapa 5 - Demostracion Grupo 5)
CREATE TABLE IF NOT EXISTS public.tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'pendiente',
    responsable TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Usuario puede ver sus tareas" ON public.tareas
        FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuario puede crear sus tareas" ON public.tareas
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuario puede modificar sus tareas" ON public.tareas
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuario puede eliminar sus tareas" ON public.tareas
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- 2. Tabla de Personal y Roles de la Clinica (CU01, CU02 | RF01-RF04)
-- Roles: Administrador, Veterinario, Recepcionista, Asistente
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.usuarios_clinica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    rut TEXT UNIQUE NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('Administrador', 'Veterinario', 'Recepcionista', 'Asistente')),
    especialidad TEXT,
    activo BOOLEAN DEFAULT true,
    intentos_fallidos INT DEFAULT 0,
    bloqueado BOOLEAN DEFAULT false,
    auth_user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. Tabla de Clientes / Tutores (CU03 | RF05, RF07, RF08, RF09)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rut TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    correo TEXT,
    direccion TEXT,
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 4. Tabla de Mascotas y Ficha Clinica Unica (CU03 | RF06, RF08, RF09, RF16)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.mascotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ficha_codigo TEXT UNIQUE NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    especie TEXT NOT NULL,
    raza TEXT,
    sexo TEXT,
    fecha_nacimiento DATE,
    peso NUMERIC(5,2),
    alergias TEXT DEFAULT 'Sin alergias registradas',
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 5. Tabla de Citas y Urgencias (CU04, CU05, CU06, CU11 | RF10-RF15, RF21)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mascota_id UUID REFERENCES public.mascotas(id) ON DELETE CASCADE,
    servicio TEXT NOT NULL,
    veterinario TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TEXT NOT NULL,
    estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En espera', 'Atendida', 'Cancelada')),
    es_urgencia BOOLEAN DEFAULT false,
    gravedad TEXT DEFAULT 'Normal',
    motivo TEXT,
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 6. Tabla de Atenciones Clinicas (CU07, CU08 | RF17, RF18)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.atenciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mascota_id UUID REFERENCES public.mascotas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    veterinario TEXT NOT NULL,
    motivo TEXT NOT NULL,
    peso_kg NUMERIC(5,2),
    temperatura_c NUMERIC(4,1),
    diagnostico TEXT NOT NULL,
    tratamiento TEXT NOT NULL,
    observaciones TEXT,
    estado_registro TEXT DEFAULT 'Finalizada' CHECK (estado_registro IN ('Finalizada', 'Borrador')),
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 7. Tabla de Vacunas y Desparasitaciones (CU09 | RF19, RF20, RF26)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.vacunas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mascota_id UUID REFERENCES public.mascotas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('Vacuna', 'Desparasitación', 'Control Preventivo')),
    producto_nombre TEXT NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    lote TEXT NOT NULL,
    proximo_refuerzo DATE NOT NULL,
    responsable TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 8. Tabla de Productos e Inventario (CU12, CU13, CU14 | RF25-RF30)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    precio INT NOT NULL DEFAULT 0,
    fecha_vencimiento DATE NOT NULL,
    lote TEXT,
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.movimientos_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    producto_nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Entrada', 'Salida')),
    cantidad INT NOT NULL,
    motivo TEXT NOT NULL,
    responsable TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- 9. Tablas de Ventas/Cobros, Gastos y Recordatorios (CU10, CU15, CU16, CU17)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    cliente_nombre TEXT NOT NULL,
    mascota_nombre TEXT,
    detalle_items TEXT NOT NULL,
    total INT NOT NULL,
    medio_pago TEXT NOT NULL CHECK (medio_pago IN ('Efectivo', 'Tarjeta', 'Transferencia')),
    estado_pago TEXT NOT NULL CHECK (estado_pago IN ('Pagado', 'Deuda pendiente')),
    saldo_pendiente INT DEFAULT 0,
    responsable TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    proveedor TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    monto INT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('Pagado', 'Pendiente')),
    responsable TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recordatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_envio DATE NOT NULL DEFAULT CURRENT_DATE,
    cliente_nombre TEXT NOT NULL,
    mascota_nombre TEXT NOT NULL,
    contacto TEXT,
    canal TEXT NOT NULL,
    tipo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    estado_entrega TEXT NOT NULL CHECK (estado_entrega IN ('Entregado', 'No entregado (Contacto inválido)')),
    user_id UUID REFERENCES auth.users(id),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 10. ACTIVACION DE ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS CLINICAS
-- =============================================================================
ALTER TABLE public.usuarios_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordatorios ENABLE ROW LEVEL SECURITY;

-- Politicas RLS para personal autenticado de la clinica (TO authenticated)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'usuarios_clinica', 'clientes', 'mascotas', 'citas', 'atenciones',
        'vacunas', 'productos', 'movimientos_stock', 'ventas', 'gastos', 'recordatorios'
    ]
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Personal autenticado lectura %I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Personal autenticado lectura %I" ON public.%I FOR SELECT TO authenticated USING (true);', t, t);

        EXECUTE format('DROP POLICY IF EXISTS "Personal autenticado escritura %I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Personal autenticado escritura %I" ON public.%I FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);', t, t);
    END LOOP;
END $$;
